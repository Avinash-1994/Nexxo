
import { BuildContext, BuildPlan, ChunkPlan, AssetPlan, ExecutionPlan, BuildMode } from './types.js';
import { explainReporter } from './events.js';
import { canonicalHash } from './hash.js';
import path from 'path';

import { normalizePath, generateModuleId } from '../../resolve/utils.js';

// Stage 4: Build Planning
export function planBuild(ctx: BuildContext): BuildPlan {
    explainReporter.report('plan', 'start', 'Starting build planning');

    const chunks: ChunkPlan[] = [];
    const assets: AssetPlan[] = [];

    const entryDeps = new Map<string, Set<string>>();

    // Deterministic Traversal
    // Sort entry points
    const sortedEntries = [...ctx.config.entryPoints].sort();

    // Helper for ID generation
    const getId = (p: string) => {
        const normalized = normalizePath(p);
        return generateModuleId('file', normalized, ctx.rootDir);
    };

    for (const entry of sortedEntries) {
        const absEntry = path.resolve(ctx.rootDir, entry);
        const entryId = getId(absEntry);

        if (!ctx.graph.nodes.has(entryId)) {
            explainReporter.report('plan', 'warning', `Entry point not found in graph: ${absEntry} (ID: ${entryId})`);
            continue;
        }

        const visited = new Set<string>();
        const queue = [entryId];

        // BFS for stability
        while (queue.length > 0) {
            const currId = queue.shift()!;
            if (visited.has(currId)) continue;
            visited.add(currId);

            const node = ctx.graph.nodes.get(currId);
            if (node) {
                const sortedDeps = node.edges.map(e => e.to).sort();
                for (const dep of sortedDeps) {
                    queue.push(dep);
                }
            }
        }
        entryDeps.set(absEntry, visited);
    }

    // Create Entry Chunks
    // Sort map keys for determinism
    const sortedEntryKeys = Array.from(entryDeps.keys()).sort();

    for (const entry of sortedEntryKeys) {
        const deps = entryDeps.get(entry)!;
        const modules = Array.from(deps).sort();
        const name = path.basename(entry, path.extname(entry));

        chunks.push({
            id: `chunk_${name}`,
            entry: entry,
            modules: modules,
            outputName: `${name}.bundle.js`
        });
    }

    // Sort chunks strictly by ID
    chunks.sort((a, b) => a.id.localeCompare(b.id));

    const executionOrder = chunks.map(c => c.id);

    // Calculate Plan ID (Hash of the plan content)
    const planStructure = {
        target: ctx.target,
        chunks,
        assets,
        executionOrder
    };
    const planId = canonicalHash(planStructure);

    explainReporter.report('plan', 'complete', 'Build plan created', { planId, chunkCount: chunks.length });

    return {
        planId,
        target: ctx.target,
        chunks,
        assets,
        executionOrder
    };
}

// Stage 5: Parallel Execution Planning
export function planParallelExecution(plan: BuildPlan): ExecutionPlan {
    explainReporter.report('parallel_plan', 'start', 'Planning parallel execution');

    // For this simple engine, chunks are independent enough to run in parallel
    // In a real complex graph, we'd analyze shared chunks to avoid race conditions 
    // or build shared dependencies first.
    // Here we treat all chunks as one parallel group.

    const chunkIds = plan.chunks.map(c => c.id);

    const execPlan: ExecutionPlan = {
        sequential: [], // setup steps if any
        parallelGroups: [chunkIds] // All chunks in one parallel wave
    };

    explainReporter.report('parallel_plan', 'complete', 'Execution plan ready', { groups: execPlan.parallelGroups.length });
    return execPlan;
}

// Stage 6: Determinism Check
export function determinismCheck(plan: BuildPlan, ctx: BuildContext): void {
    explainReporter.report('determinism', 'check', `Checking determinism for mode: ${ctx.mode}`);

    // 1. Check Module Sorting
    // All chunk modules must be sorted.
    for (const chunk of plan.chunks) {
        const sorted = [...chunk.modules].sort();
        if (JSON.stringify(chunk.modules) !== JSON.stringify(sorted)) {
            const msg = `Determinism Violation: Chunk ${chunk.id} modules are not sorted.`;
            if (ctx.mode === 'ci') throw new Error(msg);
            explainReporter.report('determinism', 'fail', msg);
        }
    }

    // 2. Check Execution Order matches Chunks
    const planIds = plan.chunks.map(c => c.id);
    if (JSON.stringify(planIds) !== JSON.stringify(plan.executionOrder)) {
        const msg = `Determinism Violation: Execution order does not match chunk sort order.`;
        if (ctx.mode === 'ci') throw new Error(msg);
        explainReporter.report('determinism', 'fail', msg);
    }

    explainReporter.report('determinism', 'pass', 'Determinism checks passed');
}
