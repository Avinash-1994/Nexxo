
/**
 * Module 2: Zero-Trust Ecosystem - WASM Runtime Test
 * Validates Day 8 Wasmtime Integration
 */

import { wasmHost } from '../src/plugins/wasm-runtime.js';
import * as fs from 'fs';
import * as path from 'path';

const TEST_DIR = path.resolve('.test_wasm_runtime');

// Minimal WASM: (module (func (export "transform")))
// Hex: 0061736d0100000001040160000003020100070d01097472616e73666f726d00000a040102000b
const WASM_HEX = '0061736d0100000001040160000003020100070d01097472616e73666f726d00000a040102000b';
const WASM_BYTES = Buffer.from(WASM_HEX, 'hex');

async function setup() {
    fs.mkdirSync(TEST_DIR, { recursive: true });
}

async function cleanup() {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
}

async function testWasmLifecycle() {
    console.log('🧪 Testing WASM Plugin Lifecycle...');

    // 1. Write Plugin
    const pluginPath = path.join(TEST_DIR, 'test_plugin.wasm');
    fs.writeFileSync(pluginPath, WASM_BYTES);

    // 2. Load & Verify
    console.log('  Loading plugin...');
    const bytes = await wasmHost.loadPlugin(pluginPath);
    if (bytes.length !== WASM_BYTES.length) throw new Error('Plugin load mismatch');

    // 3. Execute
    console.log('  Executing plugin...');
    // Input is ignored by this minimal plugin, but interface requires it
    const result = await wasmHost.runPlugin(bytes, { foo: 'bar' });

    console.log('  Result:', result);

    if (result !== 'Success') {
        throw new Error(`Execution failed. Expected 'Success', got '${result}'`);
    }

    console.log('✅ WASM Lifecycle Passed');
}

async function runTests() {
    try {
        await setup();
        await testWasmLifecycle();
        console.log('---------------------------');
        console.log('🎉 Day 8 WASM Infra Verified!');
    } catch (e: any) {
        console.error('❌ WASM Test Failed:', e);
        process.exit(1);
    } finally {
        await cleanup();
    }
}

runTests();
