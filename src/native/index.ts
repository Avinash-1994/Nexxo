/**
 * TypeScript wrapper for the Rust native worker
 * Provides high-performance plugin execution via native Rust code
 */

type NativeWorkerModule = {
    helloRust(): string;
    NativeWorker: new (poolSize?: number) => NativeWorkerInstance;
    GraphAnalyzer: new () => GraphAnalyzerInstance;
    benchmarkTransform(code: string, iterations: number): number;
};

type NativeWorkerInstance = {
    poolSize: number;
    transformSync(code: string, id: string): string;
    transform(code: string, id: string): Promise<string>;
    processAsset(content: Buffer): string;
    // NAPI-RS converts snake_case to camelCase by default
    fastHash(content: string): string;
    scanImports(code: string): string[];
    invalidate?: (file: string) => void;
    rebuild?: (file: string) => string[];
};

type GraphAnalyzerInstance = {
    addNode(id: string): void;
    addDependency(from: string, to: string): void;
    addBatch(ids: string[], edges: string[][]): void;
    detectCycles(): string[];
    findOrphans(): string[];
    getTopologicalSort(): string[];
    getNodeCount(): number;
    analyze(): any;
};

import { createRequire } from 'module';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nodeRequire = createRequire(import.meta.url);

let nativeModule: NativeWorkerModule | null = null;
let nativeLoaded = false;

/**
 * Load the native module (lazy loading)
 */
function loadNative(): NativeWorkerModule {
    if (!nativeModule) {
        try {
            // Try multiple locations to find the native binary
            const candidates = [
                path.resolve(__dirname, '../../nexxo_native.node'), // From src/native/index.ts
                path.resolve(__dirname, '../nexxo_native.node'),    // From dist/native/index.js
                path.resolve(process.cwd(), 'nexxo_native.node'),   // Root fallback
                path.resolve(process.cwd(), 'dist/nexxo_native.node')
            ];

            let pathFound = '';
            for (const c of candidates) {
                const fsModule = nodeRequire('fs');
                if (fsModule.existsSync(c)) {
                    pathFound = c;
                    break;
                }
            }

            if (!pathFound) throw new Error('Native binary not found in candidates');

            nativeModule = nodeRequire(pathFound);
            nativeLoaded = true;
        } catch (e) {
            const fallback: NativeWorkerModule = {
                helloRust() {
                    return 'Hello from JS Fallback Native Worker!';
                },
                benchmarkTransform(code: string, iterations: number): number {
                    return 0;
                },
                NativeWorker: class {
                    poolSize: number;
                    constructor(poolSize?: number) { this.poolSize = poolSize ?? 4; }
                    transformSync(code: string, _id: string): string { return code; }
                    async transform(code: string, id: string): Promise<string> { return code; }
                    processAsset(content: Buffer): string { return ''; }
                    fastHash(content: string): string {
                        return createHash('sha256').update(content).digest('hex').substring(0, 16);
                    }
                    scanImports(code: string): string[] {
                        const imports: string[] = [];
                        const re = /(?:import|export)\s+.*?\s+from\s+['"](.*?)['"]|import\(['"](.*?)['"]\)|require\(['"](.*?)['"]\)/g;
                        let m;
                        while ((m = re.exec(code)) !== null) {
                            if (m[1] || m[2] || m[3]) imports.push(m[1] || m[2] || m[3]);
                        }
                        return Array.from(new Set(imports));
                    }
                },
                // Mock GraphAnalyzer for fallback
                GraphAnalyzer: class {
                    addNode() { }
                    addDependency() { }
                    addBatch() { }
                    detectCycles() { return []; }
                    findOrphans() { return []; }
                    getTopologicalSort() { return []; }
                    getNodeCount() { return 0; }
                    analyze() { return {}; }
                }
            };
            nativeModule = fallback;
            nativeLoaded = false;
        }
    }
    return nativeModule!;
}

/**
 * Check if native worker is available
 */
export function isNativeAvailable(): boolean {
    loadNative();
    return nativeLoaded;
}

/**
 * Rust Native Worker class
 */
export class RustNativeWorker {
    private worker: NativeWorkerInstance;
    constructor(poolSize: number = 4) {
        const native = loadNative();
        this.worker = new native.NativeWorker(poolSize);
    }
    transformSync(code: string, id: string): string { return this.worker.transformSync(code, id); }
    async transform(code: string, id: string): Promise<string> { return this.worker.transform(code, id); }
    get poolSize(): number { return this.worker.poolSize; }
    processAsset(content: Buffer): string { return this.worker.processAsset(content); }
    fastHash(content: string): string { return this.worker.fastHash(content); }
    scanImports(code: string): string[] { return this.worker.scanImports(code); }
    invalidate(file: string): void { if ((this.worker as any).invalidate) (this.worker as any).invalidate(file); }
    rebuild(file: string): string[] { return (this.worker as any).rebuild ? (this.worker as any).rebuild(file) : [file]; }
}

/**
 * Rust Graph Analyzer Class
 */
export class GraphAnalyzer {
    private analyzer: GraphAnalyzerInstance;
    constructor() {
        const native = loadNative();
        this.analyzer = new native.GraphAnalyzer();
    }
    addNode(id: string) { this.analyzer.addNode(id); }
    addDependency(from: string, to: string) { this.analyzer.addDependency(from, to); }
    addBatch(ids: string[], edges: string[][]) { this.analyzer.addBatch(ids, edges); }
    detectCycles(): string[] { return this.analyzer.detectCycles(); }
    findOrphans(): string[] { return this.analyzer.findOrphans(); }
    getTopologicalSort(): string[] { return this.analyzer.getTopologicalSort(); }
    getNodeCount(): number { return this.analyzer.getNodeCount(); }
    analyze(): any { return this.analyzer.analyze(); }
}

// Singleton for standalone functions
let globalWorker: RustNativeWorker | null = null;
function getGlobalWorker(): RustNativeWorker {
    if (!globalWorker) globalWorker = new RustNativeWorker(1);
    return globalWorker;
}

export const NativeWorker = RustNativeWorker;

export function helloRust(): string {
    const native = loadNative();
    return native.helloRust();
}

export function fastHash(content: string): string {
    return getGlobalWorker().fastHash(content);
}

export function scanImports(code: string): string[] {
    return getGlobalWorker().scanImports(code);
}

export function benchmarkNativeTransform(code: string, iterations: number = 10000): number {
    const native = loadNative();
    return native.benchmarkTransform(code, iterations);
}
