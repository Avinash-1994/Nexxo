
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
            // Key = HASH(ChunkID + Map(modId -> node.contentHash) + ConfigHash)
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
                configHash: ctx.cache instanceof Object ? canonicalHash(ctx.config) : 'default'
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
/* Urja Runtime */
(function() {
  const modules = {};
  const cache = {};
  function __urja_require(id) {
    if (cache[id]) return cache[id].exports;
    const module = cache[id] = { exports: {} };
    modules[id](module, module.exports, __urja_require);
    return module.exports;
  }
  function __urja_define(id, factory) {
    modules[id] = factory;
  }
  globalThis.__urja_define = __urja_define;
  globalThis.__urja_require = __urja_require;
})();
`;
            }

            for (const modId of chunk.modules) {
                try {
                    // Resolve ID to Path via Graph
                    const node = ctx.graph.nodes.get(modId);
                    if (!node) {
                        explainReporter.report('execute', 'warning', `Module ${modId} absent from graph, trying as path`);
                        const rawContent = await fs.readFile(modId, 'utf-8');
                        if (isCss) {
                            bundleContent += `\n/* Module: ${modId} */\n${rawContent}`;
                        } else {
                            bundleContent += `\n__urja_define(${JSON.stringify(modId)}, function(module, exports, require) {\n${rawContent}\n});`;
                        }
                        continue;
                    }

                    let content = await fs.readFile(node.path, 'utf-8');

                    // RUN PLUGINS (Phase B1/B2)
                    const transformed = await ctx.pluginManager.runHook('transformModule', {
                        code: content,
                        path: node.path,
                        id: modId,
                        target: ctx.target,
                        mode: ctx.mode
                    }, ctx);


                    if (isCss) {
                        bundleContent += `\n/* Module: ${node.path} */\n${transformed.code}`;
                    } else {
                        bundleContent += `\n__urja_define(${JSON.stringify(modId)}, function(module, exports, require) {\n${transformed.code}\n});`;
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
                bundleContent += `\n\n/* Entry Point */\n__urja_require(${JSON.stringify(entryId)});`;
            }

            const contentHash = canonicalHash(bundleContent).substring(0, 16);

            const artifact: BuildArtifact = {
                id: contentHash,
                type: isCss ? 'css' : 'js',
                fileName: chunk.outputName,
                dependencies: [...chunk.modules],
                source: bundleContent
            };

            // SET CACHE
            ctx.cache.set(chunkKey, { hash: chunkKey, artifact });
            artifactMap.set(chunk.id, artifact);
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
