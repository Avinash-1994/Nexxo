
import path from 'path';
import { initBuild, attachGraph, computeInputFingerprint } from './config.js';
import { planBuild, planParallelExecution, determinismCheck } from './plan.js';
import { executeParallel } from './execute.js';
import { optimizeArtifacts } from './optimize.js';
import { emit, computeBuildFingerprint } from './emit.js';
import { DependencyGraph } from '../../resolve/graph.js';
import { BuildConfig } from '../../config/index.js';
import { BuildMode } from './types.js';
import { explainReporter } from './events.js';
import { log } from '../../utils/logger.js';
import { canonicalHash } from './hash.js';

/**
 * Core Build Engine
 * 
 * PUBLIC: The main orchestrator for the Nexxo build pipeline.
 * Use this class to run builds programmatically.
 * 
 * @public
 */
export class CoreBuildEngine {
    /** @internal */
    private latestGraph: DependencyGraph | null = null;
    /** @internal */
    private ctx: any = null;

    /** @public */
    getGraph() { return this.latestGraph; }

    /**
     * Incremental Invalidation (Phase 10)
     */
    async invalidateFile(filePath: string) {
        if (this.latestGraph && this.ctx) {
            await this.latestGraph.invalidate(filePath, this.ctx.rootDir);
        }
    }

    /**
     * Shutdown and cleanup resources
     */
    async close() {
        if (this.ctx && this.ctx.cache) {
            this.ctx.cache.close();
        }
        this.ctx = null;
    }

    /**
     * Main Entry Point for the Build Engine (Pipeline Orchestrator)
     */
    async run(userConfig: BuildConfig, mode: BuildMode = 'dev', rootDir: string, changedFiles: string[] = []) {
        try {
            explainReporter.clear();
            explainReporter.startMark('Total Build');
            log.info('--> Core Engine: Starting Build Pipeline');

            // Stage 1: Initialization
            // Normalize paths, Load env, Resolve config, Freeze context
            explainReporter.startMark('Initialization');
            if (!this.ctx) {
                this.ctx = await initBuild(userConfig, mode, rootDir);
            }
            explainReporter.endMark('Initialization', 'init');

            // Stage 2: Input Fingerprinting
            // Hash all inputs for CI verification
            explainReporter.startMark('Fingerprinting');
            const inputFingerprint = await computeInputFingerprint(this.ctx);
            explainReporter.endMark('Fingerprinting', 'fingerprint');

            // Stage 3: Attach Dependency Graph
            // (In a full architecture, Module 2 would be invoked here independently)
            explainReporter.startMark('Dependency Graph');
            if (!this.latestGraph) {
                log.info('--> Core Engine: Building NEW Dependency Graph');
                const graph = new DependencyGraph(this.ctx.pluginManager);
                for (const entry of this.ctx.config.entryPoints) {
                    const absEntry = path.isAbsolute(entry)
                        ? entry
                        : path.resolve(this.ctx.rootDir, entry);
                    await graph.addEntry(absEntry, this.ctx.rootDir);
                }
                this.latestGraph = graph;
            } else {
                log.info(`--> Core Engine: Reusing Incremental Dependency Graph with ${changedFiles.length} changes`);
                // If we have explicit changed files, invalidate them now
                for (const file of changedFiles) {
                    await this.latestGraph.invalidate(file, this.ctx.rootDir);
                }
            }
            this.ctx = attachGraph(this.ctx, this.latestGraph);
            explainReporter.endMark('Dependency Graph', 'graph');

            // Stage 4: Build Planning
            // Chunk boundaries, Asset grouping, Execution order
            explainReporter.startMark('Build Planning');
            log.info('--> Core Engine: Planning Build');
            const buildPlan = planBuild(this.ctx);
            explainReporter.endMark('Build Planning', 'plan');

            // Stage 5: Parallel Execution Planning
            // Group independent work
            explainReporter.startMark('Parallel Planning');
            const execPlan = planParallelExecution(buildPlan);
            explainReporter.endMark('Parallel Planning', 'parallel_plan');

            // Stage 6: Determinism Check
            // Mode-aware checks
            explainReporter.startMark('Determinism Check');
            determinismCheck(buildPlan, this.ctx);
            explainReporter.endMark('Determinism Check', 'determinism');

            // Stage 7: Execution
            // Execute parallel groups, Cache-aware
            explainReporter.startMark('Execution');
            log.info('--> Core Engine: Executing Plan');
            let artifacts = await executeParallel(execPlan, buildPlan, this.ctx);
            explainReporter.endMark('Execution', 'execute');

            // Stage 8: Optimization
            explainReporter.startMark('Optimization');
            artifacts = await optimizeArtifacts(artifacts, this.ctx);
            explainReporter.endMark('Optimization', 'optimize');

            // POST-BUILD HOOK (Federation, Manifests, etc.)
            const hookResult = await this.ctx.pluginManager.runHook('buildEnd', {
                artifacts,
                ctx: this.ctx
            }, this.ctx);

            if (hookResult && hookResult.artifacts) {
                artifacts = hookResult.artifacts;
            }

            // Stage 9: Emit
            // Write files, Store metadata
            explainReporter.startMark('Emit');
            log.info('--> Core Engine: Emitting Artifacts');
            const emittedArtifacts = await emit(artifacts, this.ctx);
            explainReporter.endMark('Emit', 'emit');

            // Stage 10: Output Fingerprinting
            // Compute final build hash
            explainReporter.startMark('Output Fingerprint');
            const buildFingerprint = computeBuildFingerprint(inputFingerprint, emittedArtifacts, buildPlan, this.ctx);
            explainReporter.endMark('Output Fingerprint', 'fingerprint_output');

            explainReporter.endMark('Total Build', 'profile');
            log.success(`--> Core Engine: Build Complete. ${emittedArtifacts.length} artifacts emitted.`);

            return {
                success: true,
                fingerprint: buildFingerprint,
                artifacts: emittedArtifacts,
                events: explainReporter.getEvents(),
                pluginMetrics: this.ctx.pluginManager.getMetricsSummary()
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
