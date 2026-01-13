
// TypeScript bindings for Nexxo v2.0 native WASM runtime
// Day 8: Zero-Trust Ecosystem

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const nativeModule = require('../../nexxo_native.node');

const { PluginRuntime: NativePluginRuntime } = nativeModule;

import type { PluginRuntime as NativePluginRuntimeType } from '../../nexxo_native.node';

/**
 * Secure WASM Runtime wrapper
 * Enforces:
 * - CPU limits (via fuel/epochs)
 * - Memory limits (64MB)
 * - Sandbox (No FS/Net)
 */
export class PluginRuntime {
    private runtime: NativePluginRuntimeType;

    constructor() {
        this.runtime = new NativePluginRuntime();
    }

    /**
     * Verify a WASM binary is valid and safe (basic check)
     */
    verify(wasmBytes: Buffer): boolean {
        return this.runtime.verifyPlugin(wasmBytes);
    }

    /**
     * Execute a plugin with input string
     * @param wasmBytes Plugin binary
     * @param input Input data (JSON string usually)
     * @param timeoutMs CPU time budget
     */
    execute(wasmBytes: Buffer, input: string, timeoutMs: number = 100): string {
        return this.runtime.execute(wasmBytes, input, timeoutMs);
    }
}
