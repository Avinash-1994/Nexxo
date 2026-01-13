
/**
 * Module 2: Plugin Performance Benchmark
 * Compares Native JS Function vs WASM Plugin Call
 * Day 13: Integration & Benchmarks Lock
 */

import { wasmHost } from '../src/plugins/wasm-runtime.js';
import { performance } from 'perf_hooks';

// Native function
function nativeTransform(code: string) {
    return code + ' // transformed';
}

// WASM Binary (Echo/Transform Stub)
// (module (func (export "transform"))) -> returns void? 
// Our WASM runtime stubs currently return "Success". 
// To allow meaningful benchmark, we assume the overhead is the Call + Context Switch + String Passing.
const WASM_HEX = '0061736d0100000001040160000003020100070d01097472616e73666f726d00000a040102000b';
const WASM_BYTES = Buffer.from(WASM_HEX, 'hex');

async function runBenchmark() {
    console.log('🚀 Running Plugin Architecture Benchmarks...');

    const ITERATIONS = 1000;
    const code = 'const a = 1;';
    const payload = JSON.stringify({ hook: 'transform', args: [code, 'file.js'] });

    // 1. Native Baseline
    const startNative = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        nativeTransform(code);
    }
    const endNative = performance.now();
    const nativeTime = endNative - startNative;
    const nativeOps = (ITERATIONS / nativeTime) * 1000;

    console.log(`Native: ${nativeTime.toFixed(2)}ms for ${ITERATIONS} ops (${Math.round(nativeOps)} ops/s)`);

    // 2. WASM Plugin
    // Pre-load plugin to exclude disk IO
    // Actually runtime.execute re-instantiates every time currently? That's heavy.
    // Ideally we cache instantiated modules. 
    // `PluginRuntime` currently does `new Module(...)` every `execute` call.
    // This is "Day 8 MVP" implementation. 
    // Optimized impl would cache `Module` and just `instantiate`.
    // Let's benchmark the CURRENT state to see the cost.

    const startWasm = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        // We use execute directly to avoid JSON parse overhead in wrapper if possible, 
        // but wasmHost.runPlugin does JSON.stringify.
        // Let's stick to public API.
        await wasmHost.runPlugin(WASM_BYTES, payload);
    }
    const endWasm = performance.now();
    const wasmTime = endWasm - startWasm;
    const wasmOps = (ITERATIONS / wasmTime) * 1000;

    console.log(`WASM:   ${wasmTime.toFixed(2)}ms for ${ITERATIONS} ops (${Math.round(wasmOps)} ops/s)`);

    // Comparisons
    // We expect WASM to be slower due to re-instantiation in MVP.
    // If it's too slow (e.g. 100x), we should note "Optimization Needed" for Day 14 or Module 3.
    // But for "Zero-Trust", isolation cost is expected.

    const slowdown = wasmTime / nativeTime;
    console.log(`Overhead Factor: ${slowdown.toFixed(2)}x`);

    if (nativeTime < 5 && wasmTime > 500) {
        console.warn('⚠️ High Overhead detected. Optimization recommended for Module 3.');
    } else {
        console.log('✅ Performance within acceptable security trade-off parameters.');
    }
}

runBenchmark();
