
import { NexxoPlugin, PluginHookName, PluginExecutionRecord, PluginValidation } from './types.js';
import { canonicalHash } from '../engine/hash.js';
import { explainReporter } from '../engine/events.js';

/**
 * Plugin Manager
 * 
 * PUBLIC: Responsible for registering and executing plugins in the Nexxo pipeline.
 * Use this to extend engine functionality via the official plugin contract.
 * 
 * @public
 */
export class PluginManager {
    /** @internal */
    private plugins: Map<string, NexxoPlugin> = new Map();

    /** @public */
    async register(plugin: NexxoPlugin) {
        const { name, version } = plugin.manifest;
        const pluginId = canonicalHash(`${name}@${version}`);

        // Verify engine version (simplified check for now)
        if (!plugin.manifest.engineVersion) {
            throw new Error(`Plugin ${name} missing engineVersion`);
        }

        // 6.2 Deterministic Registration
        // In practice, we'd sort these before registering if they come from a list
        this.plugins.set(pluginId, plugin);

        explainReporter.report('plugins', 'load', `Loaded plugin: ${name}@${version} (${plugin.manifest.type})`);
    }

    /** @internal */
    private metrics: Map<string, { time: number, calls: number }> = new Map();

    /** @internal - Used by the engine to execute hooks. */
    async runHook(hookName: PluginHookName, input: any, context?: any): Promise<any> {
        let result = input;

        const sortedPlugins = Array.from(this.plugins.values())
            .filter(p => p.manifest.hooks.includes(hookName))
            .sort((a, b) => a.id.localeCompare(b.id));

        for (const plugin of sortedPlugins) {
            const inputHash = canonicalHash(result);
            const executionStart = Date.now();

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

            const outputHash = canonicalHash(hookResult);

            const validation: PluginValidation = {
                passesDeterminism: true,
                executionTimeMs: executionTime,
                outputSizeBytes: JSON.stringify(hookResult).length,
                mutationScore: 0
            };

            const record: PluginExecutionRecord = {
                pluginId: plugin.id,
                hook: hookName,
                inputHash,
                outputHash,
                validation
            };

            explainReporter.report('plugins', 'hook', `Executed ${plugin.manifest.name}:${hookName} (${executionTime}ms)`);

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
