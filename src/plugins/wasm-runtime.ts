
import { PluginRuntime } from '../native/wasm.js';
export { PluginRuntime }; // Re-export for adapter usage
import * as fs from 'fs/promises';
import * as path from 'path';

export class WasmPluginHost {
    private runtime: PluginRuntime;

    constructor() {
        this.runtime = new PluginRuntime();
    }

    /**
     * Load and verify a plugin from disk
     */
    async loadPlugin(pluginPath: string): Promise<Buffer> {
        const buffer = await fs.readFile(pluginPath);
        if (!this.runtime.verify(buffer)) {
            throw new Error(`Invalid WASM plugin: ${pluginPath}`);
        }
        return buffer;
    }

    /**
     * Run a specific plugin
     */
    async runPlugin(pluginBytes: Buffer, input: any, timeoutMs: number = 100): Promise<any> {
        const inputStr = JSON.stringify(input);
        // Use provided timeout
        const outputStr = this.runtime.execute(pluginBytes, inputStr, timeoutMs);
        try {
            return JSON.parse(outputStr || 'null'); // Handle empty/string
        } catch (e) {
            return outputStr; // Return raw if not JSON
        }
    }
}

export const wasmHost = new WasmPluginHost();
