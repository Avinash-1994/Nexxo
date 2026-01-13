// TypeScript bindings for Tokio orchestrator
// Day 2: Module 1 - Speed Mastery

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const nativeModule = require('../../nexxo_native.node');

const {
    BuildOrchestrator: NativeBuildOrchestrator,
    getOptimalParallelism,
    benchmarkParallelism
} = nativeModule;

import type {
    BuildOrchestrator as NativeBuildOrchestratorType,
    BuildEvent,
    OrchestratorStats
} from '../../nexxo_native.node';

export { BuildEvent, OrchestratorStats };

/**
 * Tokio-based parallel build orchestrator
 * 
 * Features:
 * - Work-stealing scheduler for optimal CPU utilization
 * - Parallel workers for graph/plan/execute stages
 * - Deterministic stable IDs
 * - Structured event logging
 * 
 * @example
 * ```ts
 * const orchestrator = new BuildOrchestrator();
 * 
 * // Execute tasks in parallel
 * const stats = await orchestrator.executeParallel(100);
 * console.log(`Completed ${stats.completedTasks} tasks in ${stats.totalDurationMs}ms`);
 * 
 * // Generate stable IDs
 * const id = orchestrator.generateStableId(fileContent, 'module');
 * 
 * // Get events
 * const events = await orchestrator.getEvents();
 * ```
 */
export class BuildOrchestrator {
    private orchestrator: NativeBuildOrchestratorType;

    constructor(parallelism?: number) {
        this.orchestrator = new NativeBuildOrchestrator(parallelism);
    }

    /**
     * Log a build event
     */
    async logEvent(stage: string, message: string, durationMs?: number): Promise<void> {
        await this.orchestrator.logEvent(stage, message, durationMs);
    }

    /**
     * Get all logged events
     */
    async getEvents(): Promise<BuildEvent[]> {
        return await this.orchestrator.getEvents();
    }

    /**
     * Clear all events
     */
    async clearEvents(): Promise<void> {
        await this.orchestrator.clearEvents();
    }

    /**
     * Execute tasks in parallel
     */
    async executeParallel(taskCount: number): Promise<OrchestratorStats> {
        return await this.orchestrator.executeParallel(taskCount);
    }

    /**
     * Process items in parallel using Rayon (CPU-bound)
     */
    processParallelSync(items: string[]): string[] {
        return this.orchestrator.processParallelSync(items);
    }

    /**
     * Generate deterministic stable ID from content
     */
    generateStableId(content: string, prefix: string): string {
        return this.orchestrator.generateStableId(content, prefix);
    }

    /**
     * Batch generate stable IDs
     */
    batchGenerateIds(items: string[], prefix: string): string[] {
        return this.orchestrator.batchGenerateIds(items, prefix);
    }

    /**
     * Get orchestrator statistics
     */
    async getStats(): Promise<OrchestratorStats> {
        return await this.orchestrator.getStats();
    }

    /**
     * Get parallelism level
     */
    get parallelism(): number {
        return this.orchestrator.parallelism;
    }

    /**
     * Shutdown the orchestrator
     */
    shutdown(): void {
        this.orchestrator.shutdown();
    }
}

/**
 * Get optimal parallelism for the current system
 */
export function getOptimalConcurrency(): number {
    return getOptimalParallelism();
}

/**
 * Benchmark parallel vs sequential processing
 */
export function benchmarkConcurrency(itemCount: number): Record<string, number> {
    return benchmarkParallelism(itemCount);
}
