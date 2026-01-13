// Type definitions for nexxo_native.node
// Generated for Day 2: Tokio Orchestrator & RocksDB Cache

declare module '../../nexxo_native.node' {
    // Cache types
    export interface CacheStats {
        totalEntries: number;
        hits: number;
        misses: number;
        hitRate: number;
        sizeBytes: number;
    }

    export class BuildCache {
        constructor(cachePath: string);
        get(key: string): string | undefined;
        set(key: string, value: string): void;
        delete(key: string): void;
        has(key: string): boolean;
        batchSet(entries: Array<[string, string]>): void;
        clearTarget(target: string): number;
        clearAll(): void;
        getStats(): CacheStats;
        compact(): void;
        close(): void;
    }

    export function createInputKey(filePath: string, contentHash: string): string;
    export function createGraphKey(graphHash: string): string;
    export function createPlanKey(planHash: string, target: string): string;
    export function createArtifactKey(artifactId: string, target: string): string;

    // Orchestrator types
    export interface BuildEvent {
        stage: string;
        message: string;
        timestamp: number;
        durationMs?: number;
        metadata?: string;
    }

    export interface OrchestratorStats {
        totalTasks: number;
        completedTasks: number;
        failedTasks: number;
        totalDurationMs: number;
        parallelism: number;
    }

    export class BuildOrchestrator {
        constructor(parallelism?: number);
        logEvent(stage: string, message: string, durationMs?: number): Promise<void>;
        getEvents(): Promise<BuildEvent[]>;
        clearEvents(): Promise<void>;
        executeParallel(taskCount: number): Promise<OrchestratorStats>;
        processParallelSync(items: string[]): string[];
        generateStableId(content: string, prefix: string): string;
        batchGenerateIds(items: string[], prefix: string): string[];
        getStats(): Promise<OrchestratorStats>;
        get parallelism(): number;
        shutdown(): void;
    }

    export function getOptimalParallelism(): number;
    export function benchmarkParallelism(itemCount: number): Record<string, number>;

    // Existing graph types
    export interface GraphNode {
        id: string;
        dependencies: string[];
    }

    export interface CircularDependency {
        cycle: string[];
    }

    export interface GraphAnalysisResult {
        nodes: GraphNode[];
        circular_dependencies: CircularDependency[];
        total_nodes: number;
        total_edges: number;
    }

    export class GraphAnalyzer {
        constructor();
        addNode(id: string, dependencies: string[]): void;
        analyze(): GraphAnalysisResult;
        detectCircular(): CircularDependency[];
        topologicalSort(): string[];
    }

    export function fastHash(input: string): string;
    export function batchHash(inputs: string[]): string[];
    export function scanImports(code: string): string[];
    export function normalizePath(path: string): string;
}
