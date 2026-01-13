import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const native = require('../../nexxo_native.node');

export const {
    GraphAnalyzer,
    BuildOrchestrator,
    BuildCache,
    fastHash,
    batchHash,
    scanImports,
    normalizePath,
    PluginRuntime,
    NativeWorker,
    helloRust
} = native;

// Alias for compatibility if needed
export { NativeWorker as RustNativeWorker };

export default native;
