
import { BuildContext, BuildPlan, BuildArtifact, ExecutionPlan } from './types.js';
import { explainReporter } from './events.js';
import { canonicalHash } from './hash.js';
import fs from 'fs/promises';

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

            // CALCULATE CACHE KEY
            // Key = HASH(ChunkID + ModulePaths + ConfigHash)
            // Ideally we'd hash module CONTENT here too for strict caching
            // But for speed we might trust contentHash from inputs if we propagated it.
            // Let's stick to a solid key.
            const chunkKey = canonicalHash({
                id: chunk.id,
                modules: chunk.modules,
                config: ctx.config // simplistic
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
            for (const modId of chunk.modules) {
                try {
                    // Resolve ID to Path via Graph
                    const node = ctx.graph.nodes.get(modId);
                    if (!node) {
                        // If strict, assume modId is path (compatibility) but better error
                        // throw new Error(`Module ${modId} not found in graph`);
                        // Fallback for now if graph was bypassed? No, strict.
                        // Actually, let's try to read it as path if not found, but log warning.
                        explainReporter.report('execute', 'warning', `Module ${modId} absent from graph, trying as path`);
                        const content = await fs.readFile(modId, 'utf-8');
                        bundleContent += `\n/* Module: ${modId} */\n${content}`;
                        continue;
                    }

                    const content = await fs.readFile(node.path, 'utf-8');
                    bundleContent += `\n/* Module: ${node.path} */\n${content}`;
                } catch (e: any) {
                    throw {
                        code: 'EXEC_READ_ERROR',
                        message: `Failed to read ${modId}: ${e.message}`,
                        stage: 'execute'
                    };
                }
            }

            const contentHash = canonicalHash(bundleContent).substring(0, 16);

            const artifact: BuildArtifact = {
                id: contentHash,
                type: 'js',
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

    // Sort artifacts by execution order for strict internal consistency before emit
    // Note: This collection part is sequential, which is fine ("Emit always sequential")
    for (const id of buildPlan.executionOrder) {
        const art = artifactMap.get(id);
        if (art) artifacts.push(art);
    }

    return artifacts;
}
