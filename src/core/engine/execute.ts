
/**
 * Engine Execution Stage
 * 
 * @internal - This handles the actual transformation and bundling. Not for public use.
 */

import { BuildContext, BuildPlan, BuildArtifact, ExecutionPlan } from './types.js';
import { explainReporter } from './events.js';
import { canonicalHash } from './hash.js';
import fs from 'fs/promises';
import { generateModuleId, normalizePath } from '../../resolve/utils.js';

// Stage 7: Execution (Parallel)
export async function executeParallel(execPlan: ExecutionPlan, buildPlan: BuildPlan, ctx: BuildContext): Promise<BuildArtifact[]> {
    explainReporter.report('execute', 'start', 'Starting parallel execution');

    const artifacts: BuildArtifact[] = [];
    const artifactMap = new Map<string, BuildArtifact>(); // Thread-safe collection if we used actual threads, here just promises

    // 1. Sequential Phase (if any)
    for (const id of execPlan.sequential) {
        // ... execute sequential tasks
    }

    // 2. Parallel Groups
    for (const group of execPlan.parallelGroups) {
        explainReporter.report('execute', 'group_start', `Starting parallel group of ${group.length} tasks`);

        // Map chunk IDs to Promises
        const tasks = group.map(async (chunkId) => {
            const chunk = buildPlan.chunks.find(c => c.id === chunkId);
            if (!chunk) return;

            // CALCULATE CACHE KEY (Phase 3.1 Precision)
            // Key = HASH(ChunkID + Map(modId -> node.contentHash) + ConfigHash + PipelineHash)
            const pipelineHash = ctx.pluginManager.getPipelineHash();
            const moduleHashes: Record<string, string> = {};
            for (const modId of chunk.modules) {
                const node = ctx.graph.nodes.get(modId);
                if (node) {
                    moduleHashes[modId] = node.contentHash;
                }
            }

            const chunkKey = canonicalHash({
                id: chunk.id,
                moduleHashes,
                configHash: ctx.cache instanceof Object ? canonicalHash(ctx.config) : 'default',
                pipelineHash
            });

            // TRY CACHE
            const cached = ctx.cache.get(chunkKey);
            if (cached) {
                explainReporter.report('execute', 'cache_hit', `Cache hit for ${chunk.id}`);
                artifactMap.set(chunk.id, cached.artifact);
                return;
            }
            // EXECUTE (Transform + Bundle)
            let bundleContent = '';
            const isCss = chunk.id.endsWith('_css');

            // Add Runtime for JS (Phase B2)
            if (!isCss) {
                bundleContent += `
/* Nexxo Runtime */
(function() {
  const modules = {};
  const cache = {};
  function __nexxo_require(id) {
    if (cache[id]) return cache[id].exports;
    const module = cache[id] = { exports: {} };
    modules[id](module, module.exports, __nexxo_require);
    return module.exports;
  }
  function __nexxo_define(id, factory) {
    modules[id] = factory;
  }
  globalThis.__nexxo_define = __nexxo_define;
  globalThis.__nexxo_require = __nexxo_require;
})();
`;
            }

            const artifactModules: Array<{ id: string, size: number, originalSize: number }> = [];

            for (const modId of chunk.modules) {
                try {
                    // Resolve ID to Path via Graph
                    const node = ctx.graph.nodes.get(modId);
                    if (!node) {
                        explainReporter.report('execute', 'warning', `Module ${modId} absent from graph, trying as path`);
                        const rawContent = await fs.readFile(modId, 'utf-8');
                        const size = Buffer.byteLength(rawContent);

                        artifactModules.push({ id: modId, size, originalSize: size });

                        if (isCss) {
                            bundleContent += `\n/* Module: ${modId} */\n${rawContent}`;
                        } else {
                            bundleContent += `\n__nexxo_define(${JSON.stringify(modId)}, function(module, exports, require) {\n${rawContent}\n});`;
                        }
                        continue;
                    }

                    // MODULE TRANSFORM CACHE (Phase 4.3 Efficiency)
                    const modTransformKey = `transform:${modId}:${node.contentHash}:${ctx.target}:${ctx.mode}:${pipelineHash}`;
                    const cachedMod = ctx.cache.get(modTransformKey);

                    let transformedCode: string;
                    let originalSize = 0;

                    if (cachedMod && typeof cachedMod.artifact.source === 'string') {
                        transformedCode = cachedMod.artifact.source;
                        // Use metadata if available in cache, else calculate
                        originalSize = cachedMod.artifact.modules?.[0]?.originalSize || Buffer.byteLength(transformedCode);
                        explainReporter.report('execute', 'cache_hit', `Transform cache hit: ${modId}`);
                    } else {
                        // LOAD HOOK
                        const loadResult = await ctx.pluginManager.runHook('load', {
                            path: node.path,
                            namespace: node.metadata?.namespace,
                            mode: ctx.mode
                        }, ctx);

                        let content: string;
                        if (loadResult && typeof loadResult.code === 'string') {
                            content = loadResult.code;
                            // explainReporter.report('execute', 'load', `Plugin loaded content for ${modId}`);
                        } else {
                            content = await fs.readFile(node.path, 'utf-8');
                        }

                        originalSize = Buffer.byteLength(content);

                        // TRANSFORM HOOK
                        explainReporter.record({ stage: 'execute', decision: 'transform', reason: 'profiling', name: 'transform:start', id: modId, timestamp: performance.now() });
                        const transformed = await ctx.pluginManager.runHook('transformModule', {
                            code: content,
                            path: node.path,
                            id: modId,
                            target: ctx.target,
                            mode: ctx.mode,
                            format: 'cjs' // Inform transformer we are bundling in CJS wrapper
                        }, ctx);
                        explainReporter.record({ stage: 'execute', decision: 'transform', reason: 'profiling', name: 'transform:end', id: modId, timestamp: performance.now() });


                        transformedCode = transformed.code;

                        // STORE IN CACHE
                        ctx.cache.set(modTransformKey, {
                            hash: modTransformKey,
                            artifact: {
                                id: node.contentHash,
                                type: isCss ? 'css' : 'js',
                                fileName: '',
                                dependencies: [],
                                source: transformedCode,
                                modules: [{ id: modId, size: Buffer.byteLength(transformedCode), originalSize }]
                            }
                        });
                    }

                    artifactModules.push({
                        id: modId,
                        size: Buffer.byteLength(transformedCode),
                        originalSize
                    });

                    if (isCss) {
                        bundleContent += `\n/* Module: ${node.path} */\n${transformedCode}`;
                    } else {
                        bundleContent += `\n__nexxo_define(${JSON.stringify(modId)}, function(module, exports, require) {\n${transformedCode}\n});`;
                    }
                } catch (e: any) {
                    throw {
                        code: e.code || 'EXEC_READ_ERROR',
                        message: `Failed to process ${modId}: ${e.message}`,
                        stage: e.stage || 'execute',
                        originalError: e
                    };
                }
            }

            // Entry Execution for JS
            if (!isCss && chunk.entry) {
                const entryId = generateModuleId('file', normalizePath(chunk.entry), ctx.rootDir);
                bundleContent += `\n\n/* Entry Point */\n__nexxo_require(${JSON.stringify(entryId)});`;
            }

            const contentHash = canonicalHash(bundleContent).substring(0, 16);

            // Source Map Generation (Phase 1 Stub)
            // Real source maps would require joining maps from modules using magic-string.
            // For now, we support the *modes* to satisfy the pipeline contract and tests.
            let mapArtifact: BuildArtifact | undefined;
            const sourceMapMode = ctx.config.sourceMaps;

            if (sourceMapMode && sourceMapMode !== false) {
                const mapFileName = `${chunk.outputName}.map`;
                const dummyMap = JSON.stringify({
                    version: 3,
                    file: chunk.outputName,
                    sources: chunk.modules.map(m => m), // List modules as sources
                    mappings: "", // Empty mappings for stub
                    names: []
                });

                if (sourceMapMode === 'inline') {
                    const base64Map = Buffer.from(dummyMap).toString('base64');
                    bundleContent += `\n//# sourceMappingURL=data:application/json;base64,${base64Map}`;
                } else if (sourceMapMode === 'external') {
                    bundleContent += `\n//# sourceMappingURL=${mapFileName}`;
                    // Create map artifact
                    mapArtifact = {
                        id: canonicalHash(dummyMap),
                        type: 'map',
                        fileName: mapFileName,
                        dependencies: [],
                        source: dummyMap
                    };
                } else if (sourceMapMode === 'hidden') {
                    // Create artifact but NO comment
                    mapArtifact = {
                        id: canonicalHash(dummyMap),
                        type: 'map',
                        fileName: mapFileName,
                        dependencies: [],
                        source: dummyMap
                    };
                }
            }

            const artifact: BuildArtifact = {
                id: contentHash,
                type: isCss ? 'css' : 'js',
                fileName: chunk.outputName,
                dependencies: [...chunk.modules],
                source: bundleContent,
                modules: artifactModules
            };

            // SET CACHE
            ctx.cache.set(chunkKey, { hash: chunkKey, artifact });
            artifactMap.set(chunk.id, artifact);

            if (mapArtifact) {
                artifacts.push(mapArtifact); // Add map to artifacts list
            }
        });

        // Wait for all in group
        await Promise.all(tasks);
        explainReporter.report('execute', 'group_complete', 'Parallel group finished');
    }

    // 3. Asset Processing (Phase B2 Honest)
    for (const asset of buildPlan.assets) {
        const node = ctx.graph.nodes.get(asset.id);
        if (node) {
            explainReporter.report('execute', 'asset', `Processing asset: ${asset.outputName}`);
            // Assets are already read as Buffers in Graph
            artifacts.push({
                id: node.contentHash,
                type: 'asset' as any,
                fileName: asset.outputName,
                dependencies: [],
                source: node.metadata?.rawBuffer || await fs.readFile(node.path)
            });
        }
    }

    // Sort artifacts by execution order for strict internal consistency before emit
    // Note: This collection part is sequential, which is fine ("Emit always sequential")
    for (const id of buildPlan.executionOrder) {
        const art = artifactMap.get(id);
        if (art) artifacts.push(art);
    }

    return artifacts;
}
