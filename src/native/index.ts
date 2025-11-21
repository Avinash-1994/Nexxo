/**
 * TypeScript wrapper for the Rust native worker
 * Provides high-performance plugin execution via native Rust code
 */

type NativeWorkerModule = {
    helloRust(): string;
    NativeWorker: new (poolSize?: number) => NativeWorkerInstance;
    benchmarkTransform(code: string, iterations: number): number;
};

type NativeWorkerInstance = {
    poolSize: number;
    transformSync(code: string, id: string): string;
    transform(code: string, id: string): Promise<string>;
};

let nativeModule: NativeWorkerModule | null = null;

/**
 * Load the native module (lazy loading)
 */
function loadNative(): NativeWorkerModule {
    if (!nativeModule) {
        try {
            nativeModule = require('../nextgen_native.node');
        } catch (e) {
            throw new Error(`Failed to load Rust native worker: ${e}`);
        }
    }
    return nativeModule!; // Assert non-null since we throw if loading fails
}

/**
 * Check if native worker is available
 */
export function isNativeAvailable(): boolean {
    try {
        loadNative();
        return true;
    } catch {
        return false;
    }
}

/**
 * Rust Native Worker class
 * Provides high-performance plugin transformations using native Rust code
 */
export class RustNativeWorker {
    private worker: NativeWorkerInstance;

    constructor(poolSize: number = 4) {
        const native = loadNative();
        this.worker = new native.NativeWorker(poolSize);
    }

    /**
     * Synchronously transform code
     */
    transformSync(code: string, id: string): string {
        return this.worker.transformSync(code, id);
    }

    /**
     * Asynchronously transform code
     */
    async transform(code: string, id: string): Promise<string> {
        return this.worker.transform(code, id);
    }

    /**
     * Get the pool size
     */
    get poolSize(): number {
        return this.worker.poolSize;
    }
}

/**
 * Utility function: Hello from Rust
 */
export function helloRust(): string {
    const native = loadNative();
    return native.helloRust();
}

/**
 * Benchmark native transform performance
 */
export function benchmarkNativeTransform(code: string, iterations: number = 10000): number {
    const native = loadNative();
    return native.benchmarkTransform(code, iterations);
}
