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
    processAsset(content: Buffer): string;
    invalidate?: (file: string) => void;
    rebuild?: (file: string) => string[];
};

import { createRequire } from 'module';
import { createHash } from 'crypto';

const nodeRequire = createRequire(import.meta.url);

let nativeModule: NativeWorkerModule | null = null;
let nativeLoaded = false;

/**
 * Load the native module (lazy loading)
 */
function loadNative(): NativeWorkerModule {
    if (!nativeModule) {
        try {
            nativeModule = nodeRequire('../nextgen_native.node');
            nativeLoaded = true;
        } catch (e) {
            const fallback: NativeWorkerModule = {
                helloRust() {
                    return 'Hello from JS Fallback Native Worker!';
                },
                benchmarkTransform(code: string, iterations: number): number {
                    const start = Date.now();
                    for (let i = 0; i < iterations; i++) {
                        void code.replace('console.log', 'console.debug');
                    }
                    return (Date.now() - start) / 1000;
                },
                NativeWorker: class {
                    poolSize: number;
                    constructor(poolSize?: number) {
                        this.poolSize = poolSize ?? 4;
                    }
                    transformSync(code: string, _id: string): string {
                        return code.replace('console.log', 'console.debug');
                    }
                    async transform(code: string, id: string): Promise<string> {
                        return this.transformSync(code, id);
                    }
                    processAsset(content: Buffer): string {
                        return createHash('sha256').update(content).digest('hex');
                    }
                    invalidate(_file: string): void {
                    }
                    rebuild(file: string): string[] {
                        return [file];
                    }
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

    /**
     * Process asset and return content hash
     */
    processAsset(content: Buffer): string {
        return this.worker.processAsset(content);
    }

    invalidate(file: string): void {
        const w: any = this.worker as any;
        if (typeof w.invalidate === 'function') {
            w.invalidate(file);
        }
    }

    rebuild(file: string): string[] {
        const w: any = this.worker as any;
        if (typeof w.rebuild === 'function') {
            return w.rebuild(file);
        }
        return [file];
    }
}

// Export alias for backward compatibility
export const NativeWorker = RustNativeWorker;

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
