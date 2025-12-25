
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

    async runHook(hookName: PluginHookName, input: any): Promise<any> {
        let result = input;

        // Get plugins that implement this hook, sorted by ID for determinism
        const sortedPlugins = Array.from(this.plugins.values())
            .filter(p => p.manifest.hooks.includes(hookName))
            .sort((a, b) => a.id.localeCompare(b.id));

        for (const plugin of sortedPlugins) {
            const inputHash = canonicalHash(result);

            // 6.3 Validation Pipeline (Gatekeeper)
            const executionStart = Date.now();

            const hookResult = await plugin.runHook(hookName, result);

            const executionTime = Date.now() - executionStart;
            const outputHash = canonicalHash(hookResult);

            // Basic validation logic
            const validation: PluginValidation = {
                passesDeterminism: true, // Requires double-run to verify
                executionTimeMs: executionTime,
                outputSizeBytes: JSON.stringify(hookResult).length,
                mutationScore: 0 // Would need deeper check to detect side effects
            };

            // Record for BuildFingerprint
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
}
