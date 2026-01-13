declare module "*.node" {
    export interface CacheStats {
        totalEntries: number;
        hits: number;
        misses: number;
        hitRate: number;
        sizeBytes: number;
    }

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

    export class BuildCache {
        constructor(cachePath: string);
        get(key: string): string | undefined;
        set(key: string, value: string): void;
        delete(key: string): void;
        has(key: string): boolean;
        batchSet(entries: Record<string, string>): void;
        clearTarget(target: string): number;
        clearAll(): void;
        getStats(): CacheStats;
        compact(): void;
        close(): void;
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
        readonly parallelism: number;
        shutdown(): void;
    }

    export class PluginRuntime {
        constructor();
        verifyPlugin(wasmBytes: Uint8Array | Buffer): boolean;
        execute(wasmBytes: Uint8Array | Buffer, input: string, timeoutMs?: number): string;
    }

    export interface CircularDependency {
        cycle: string[];
        entryPoint: string;
    }

    export interface GraphAnalysisResult {
        hasCycles: boolean;
        cycles: CircularDependency[];
        orphanedNodes: string[];
        entryPoints: string[];
        totalNodes: number;
        totalEdges: number;
    }

    export class GraphAnalyzer {
        constructor();
        addNode(id: string, dependencies: string[]): void;
        addBatch(ids: string[], edges: string[][]): void;
        detectCycles(): CircularDependency[];
        findOrphanedNodes(entryPoints: string[]): string[];
        analyze(entryPoints: string[]): GraphAnalysisResult;
        topologicalSort(): string[] | null;
        nodeCount(): number;
        edgeCount(): number;
        clear(): void;
    }

    export const fastHash: (content: string) => string;
    export const batchHash: (contents: string[]) => string[];
    export const scanImports: (code: string) => string[];
    export const normalizePath: (path: string) => string;
    export const helloRust: () => string;
}
