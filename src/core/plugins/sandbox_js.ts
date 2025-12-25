
import vm from 'vm';
import { UrjaPlugin, PluginHookName, PluginManifest } from './types.js';
import { canonicalHash } from '../engine/hash.js';

export class JSPluginSandbox implements UrjaPlugin {
    manifest: PluginManifest;
    id: string;
    private context: vm.Context;
    private script: vm.Script;

    constructor(code: string, manifest: PluginManifest) {
        this.manifest = manifest;
        this.id = canonicalHash(`${manifest.name}@${manifest.version}`);

        // Create a sandboxed context with restricted globals
        this.context = vm.createContext({
            console: {
                log: (...args: any[]) => console.log(`[Plugin:${manifest.name}]`, ...args),
                warn: (...args: any[]) => console.warn(`[Plugin:${manifest.name}]`, ...args),
                error: (...args: any[]) => console.error(`[Plugin:${manifest.name}]`, ...args),
            },
            // Restricted process.env
            process: {
                env: { NODE_ENV: 'production' }
            },
            // No fs/network by default
            Buffer,
            URL,
        });

        // Wrap code in a function if needed or expect it to be an IIFE / module
        // For this implementation, we expect `code` to return an object with hooks
        this.script = new vm.Script(`(function() {
      ${code}
      return plugin; // Expecting plugin object in scope
    })()`);
    }

    async runHook(hookName: PluginHookName, input: any): Promise<any> {
        const pluginInstance = this.script.runInContext(this.context);

        if (pluginInstance && pluginInstance[hookName]) {
            // Direct execution for now. In full impl we might want to run in a separate worker
            return await pluginInstance[hookName](input);
        }

        return input;
    }
}
