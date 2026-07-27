
import fs from 'fs/promises';
import { LunxPlugin, PluginHookName, PluginExecutionRecord, PluginValidation } from './types.js';
import { canonicalHash } from '../engine/hash.js';
import { explainReporter } from '../engine/events.js';

/**
 * Plugin Manager
 * 
 * PUBLIC: Responsible for registering and executing plugins in the Lunx pipeline.
 * Use this to extend engine functionality via the official plugin contract.
 * 
 * @public
 */
export class PluginManager {
    /** @internal */
    private plugins: Map<string, LunxPlugin> = new Map();

    /** @public */
    async register(plugin: LunxPlugin | any) {
        // [SAFE REMOVAL] Phase 1.1: Wasmtime Sandbox removal
        if (plugin?.manifest?.type === 'wasm' || plugin?.path?.endsWith('.wasm')) {
            console.warn('[LUNX:WARN] WASM plugins are deprecated. See https://lunx.dev/migrate for the new JS/TS Hook API hook migration path.');
            throw new Error(`[Lunx] Error: .wasm plugin architecture has been removed for security and performance reasons. Plugin "${plugin?.manifest?.name || plugin?.name || 'unknown'}" must be migrated to a standard JS/TS hook format.`);
        }

        let activePlugin = plugin;

        // Auto-adapt ported plugins (missing manifest)
        if (!plugin.manifest && plugin.name) {
            activePlugin = {
                id: canonicalHash(plugin.name),
                manifest: {
                    name: plugin.name,
                    version: '0.0.0',
                    type: 'js',
                    hooks: Object.keys(plugin).filter(k => typeof plugin[k] === 'function') as any[],
                    permissions: { fs: 'read' },
                    engineVersion: '^1.0.0'
                },
                runHook: async (hook: string, ...args: any[]) => {
                    if (typeof plugin[hook] === 'function') {
                        return plugin[hook](...args);
                    }
                    return null;
                }
            } as LunxPlugin;
        }

        const { name, version } = activePlugin.manifest;
        const pluginId = canonicalHash(`${name}@${version}`);

        // Verify engine version (simplified check for now)
        if (!activePlugin.manifest.engineVersion) {
            throw new Error(`Plugin ${name} missing engineVersion`);
        }

        // 6.2 Deterministic Registration
        // In practice, we'd sort these before registering if they come from a list
        this.plugins.set(pluginId, activePlugin);

        explainReporter.report('plugins', 'load', `Loaded plugin: ${name}@${version} (${activePlugin.manifest.type})`);
    }

    /**
     * @deprecated WASM plugin support has been removed (Phase 1.1).
     * Please migrate your plugin to standard JS/TS Hooks.
     */
    async registerWasmPlugin(wasmBytes: Buffer | Uint8Array | ArrayBuffer): Promise<void> {
        console.warn('[LUNX:WARN] registerWasmPlugin() is deprecated. See https://lunx.dev/migrate');
        throw new Error('[Lunx] Error: .wasm plugin architecture has been removed.');
    }

    /**
     * @deprecated WASM plugin support has been removed (Phase 1.1).
     */
    async registerWasmPluginFromFile(filePath: string): Promise<void> {
        console.warn('[LUNX:WARN] registerWasmPluginFromFile() is deprecated. See https://lunx.dev/migrate');
        throw new Error('[Lunx] Error: .wasm plugin architecture has been removed.');
    }

    /** @internal */
    private metrics: Map<string, { time: number, calls: number }> = new Map();
    /** @internal */
    private hookCache: Map<string, LunxPlugin[]> = new Map();

    /** @internal - Used by the engine to execute hooks. */
    async runHook(hookName: PluginHookName, input: any, context?: any): Promise<any> {
        let result = input;

        const isProd = context?.mode === 'production' || context?.mode === 'build';

        let sortedPlugins = this.hookCache.get(hookName);
        if (!sortedPlugins) {
            sortedPlugins = Array.from(this.plugins.values())
                .filter(p => p.manifest.hooks.includes(hookName))
                .sort((a, b) => a.id.localeCompare(b.id));
            this.hookCache.set(hookName, sortedPlugins);
        }

        for (const plugin of sortedPlugins) {
            const inputHash = isProd ? '' : canonicalHash(result);
            const executionStart = performance.now();

            let hookResult;
            try {
                hookResult = await plugin.runHook(hookName, result, context);
            } catch (error: any) {
                explainReporter.report('plugins', 'error', `Plugin ${plugin.manifest.name} failed during ${hookName}`, { error: error.message });
                const pluginError: any = new Error(`[Plugin:${plugin.manifest.name}] ${hookName} failed: ${error.message}`);
                pluginError.code = 'PLUGIN_ERROR';
                pluginError.plugin = plugin.manifest.name;
                pluginError.hook = hookName;
                pluginError.originalError = error;
                throw pluginError;
            }

            const executionTime = Date.now() - executionStart;

            // Track metrics (Phase 2.2)
            const m = this.metrics.get(plugin.manifest.name) || { time: 0, calls: 0 };
            m.time += executionTime;
            m.calls += 1;
            this.metrics.set(plugin.manifest.name, m);

            if (!isProd) {
                const outputHash = canonicalHash(hookResult);
                const validation: PluginValidation = {
                    passesDeterminism: true,
                    executionTimeMs: executionTime,
                    outputSizeBytes: hookResult ? JSON.stringify(hookResult)?.length || 0 : 0,
                    mutationScore: 0
                };
                explainReporter.report('plugins', 'hook', `Executed ${plugin.manifest.name}:${hookName} (${executionTime.toFixed(2)}ms)`);
            }

            if (hookResult !== null && hookResult !== undefined) {
                result = hookResult;

                // Stop at first successful resolution for resolveId/load
                if (hookName === 'resolveId' || hookName === 'load') {
                    break;
                }
            }
        }

        return result;
    }

    /** @public */
    getPipelineHash() {
        const pluginIdentities = Array.from(this.plugins.values())
            .map(p => `${p.manifest.name}@${p.manifest.version}`)
            .sort();
        return canonicalHash(pluginIdentities);
    }

    /** @public */
    getMetricsSummary() {
        return Array.from(this.metrics.entries()).map(([name, m]) => ({
            plugin: name,
            totalTimeMs: m.time,
            avgTimeMs: Math.round(m.time / m.calls),
            callCount: m.calls
        })).sort((a, b) => b.totalTimeMs - a.totalTimeMs);
    }
}
