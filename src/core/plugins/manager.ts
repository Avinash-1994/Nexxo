
import { UrjaPlugin, PluginHookName, PluginExecutionRecord, PluginValidation } from './types.js';
import { canonicalHash } from '../engine/hash.js';
import { explainReporter } from '../engine/events.js';

export class PluginManager {
    private plugins: Map<string, UrjaPlugin> = new Map();

    async register(plugin: UrjaPlugin) {
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

    private metrics: Map<string, { time: number, calls: number }> = new Map();

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

            result = hookResult;
        }

        return result;
    }

    getMetricsSummary() {
        return Array.from(this.metrics.entries()).map(([name, m]) => ({
            plugin: name,
            totalTimeMs: m.time,
            avgTimeMs: Math.round(m.time / m.calls),
            callCount: m.calls
        })).sort((a, b) => b.totalTimeMs - a.totalTimeMs);
    }
}
