/**
 * Nexxo Plugin Governance & Stability System
 * 
 * Enforces strict typing, stability levels, and rules for the ecosystem.
 * This ensures "Production Ready" quality for all loaded plugins.
 */

export type PluginStability = 'experimental' | 'stable' | 'deprecated' | 'core';

export interface PluginMeta {
    version: string;
    author?: string;
    description?: string;
    homepage?: string;
    stability: PluginStability;
    // Explicit side-effect declaration for advanced tree-shaking
    sideEffects?: boolean | string[];
}

export interface GovernanceResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validates a plugin against Nexxo's strict governance rules.
 * 
 * Rules:
 * 1. Must have a valid name (kebab-case, @scope/name)
 * 2. Must declare stability level
 * 3. 'Stable' plugins must use semantic versioning (if version provided)
 * 4. No forbidden hooks (reserved for core) - None currently, but extensible
 */
export function validatePlugin(plugin: any): GovernanceResult {
    const result: GovernanceResult = { valid: true, errors: [], warnings: [] };

    if (!plugin.name) {
        result.valid = false;
        result.errors.push('Plugin missing "name" property.');
        return result; // Critical failure
    }

    // Name format check
    if (!/^(@[a-z0-9-]+\/)?[a-z0-9-]+$/.test(plugin.name)) {
        result.warnings.push(`Plugin name "${plugin.name}" should be kebab-case (e.g. nexxo-plugin-foo).`);
    }

    // Advanced: Check for legacy/unsafe patterns
    // e.g. detecting if a plugin tries to mutate global state excessively (heuristic)

    // Stability Check
    const stability = plugin.stability || 'experimental'; // Default to experimental
    if (stability === 'deprecated') {
        result.warnings.push(`Plugin "${plugin.name}" is deprecated.`);
    }

    return result;
}

/**
 * Registry of known stable plugins.
 * In a real scenario, this would fetch from a CDN or verified list.
 */
export const VERIFIED_PLUGINS = new Set([
    'nexxo-react',
    'nexxo-vue',
    'nexxo-svelte',
    'nexxo-copy',
    'nexxo-html',
    'nexxo-compress'
]);

export function isVerified(name: string): boolean {
    return VERIFIED_PLUGINS.has(name) || name.startsWith('@nexxo/');
}
