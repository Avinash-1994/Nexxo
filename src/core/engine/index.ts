
import path from 'path';
import { initBuild, attachGraph, computeInputFingerprint } from './config.js';
import { planBuild, planParallelExecution, determinismCheck } from './plan.js';
import { executeParallel } from './execute.js';
import { emit, computeBuildFingerprint } from './emit.js';
import { DependencyGraph } from '../../resolve/graph.js';
import { BuildConfig } from '../../config/index.js';
import { BuildMode } from './types.js';
import { explainReporter } from './events.js';
import { log } from '../../utils/logger.js';
import { canonicalHash } from './hash.js';

export class CoreBuildEngine {

    /**
     * Main Entry Point for the Build Engine (Pipeline Orchestrator)
     */
    async run(userConfig: BuildConfig, mode: BuildMode = 'dev', rootDir: string) {
        try {
            explainReporter.clear();
            log.info('--> Core Engine: Starting Build Pipeline');

            // Stage 1: Initialization
            // Normalize paths, Load env, Resolve config, Freeze context
            let ctx = initBuild(userConfig, mode, rootDir);

            // Stage 2: Input Fingerprinting
            // Hash all inputs for CI verification
            const inputFingerprint = await computeInputFingerprint(ctx);

            // Stage 3: Attach Dependency Graph
            // (In a full architecture, Module 2 would be invoked here independently)
            log.info('--> Core Engine: Building Dependency Graph');
            const graph = new DependencyGraph();
            for (const entry of ctx.config.entryPoints) {
                const absEntry = path.isAbsolute(entry)
                    ? entry
                    : path.resolve(ctx.rootDir, entry);
                await graph.addEntry(absEntry, ctx.rootDir);
            }
            ctx = attachGraph(ctx, graph);

            // Stage 4: Build Planning
            // Chunk boundaries, Asset grouping, Execution order
            log.info('--> Core Engine: Planning Build');
            const buildPlan = planBuild(ctx);

            // Stage 5: Parallel Execution Planning
            // Group independent work
            const execPlan = planParallelExecution(buildPlan);

            // Stage 6: Determinism Check
            // Mode-aware checks
            determinismCheck(buildPlan, ctx);

            // Stage 7: Execution (Parallel)
            // Execute parallel groups, Cache-aware
            log.info('--> Core Engine: Executing Plan');
            const artifacts = await executeParallel(execPlan, buildPlan, ctx);

            // Stage 8: Emit Artifacts
            // Write files, Store metadata
            log.info('--> Core Engine: Emitting Artifacts');
            const emittedArtifacts = await emit(artifacts, ctx);

            // Stage 9: Output Fingerprinting
            // Compute final build hash
            const buildFingerprint = computeBuildFingerprint(inputFingerprint, emittedArtifacts, buildPlan, ctx);

            log.success(`--> Core Engine: Build Complete. ${emittedArtifacts.length} artifacts emitted.`);

            return {
                success: true,
                fingerprint: buildFingerprint,
                artifacts: emittedArtifacts,
                events: explainReporter.getEvents()
            };

        } catch (error: any) {
            log.error('--> Core Engine: Build Failed', error);
            // In case of error, we can still try to dump explain logs for debugging
            return {
                success: false,
                error: {
                    message: error.message,
                    code: error.code || 'UNKNOWN_ERROR',
                    stage: error.stage || 'unknown'
                },
                events: explainReporter.getEvents()
            };
        }
    }
}
