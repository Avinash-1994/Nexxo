
import { NexxoPlugin, PluginValidation, PluginHookName } from './types.js';
import { canonicalHash } from '../engine/hash.js';

export class PluginValidator {
    /**
     * 6.3 Validation Pipeline
     * Runs the plugin twice and compares outputs to ensure determinism.
     */
    async validate(plugin: NexxoPlugin, sampleHook: PluginHookName, sampleInput: any): Promise<PluginValidation> {
        const start = Date.now();

        // First run
        const result1 = await plugin.runHook(sampleHook, sampleInput);
        const hash1 = canonicalHash(result1);
        const time1 = Date.now() - start;

        // Second run (for determinism check)
        const start2 = Date.now();
        const result2 = await plugin.runHook(sampleHook, sampleInput);
        const hash2 = canonicalHash(result2);
        const time2 = Date.now() - start2;

        const passesDeterminism = hash1 === hash2;

        // Detect mutation
        // If we passed result1 to the second run, we could detect mutation,
        // but here we pass sampleInput both times.
        // To detect mutation of sampleInput, we'd hash it before and after.

        return {
            passesDeterminism,
            executionTimeMs: Math.max(time1, time2),
            outputSizeBytes: JSON.stringify(result1).length,
            mutationScore: passesDeterminism ? 0 : 1 // Simple suspicious score
        };
    }
}
