import { canonicalHash } from '../../core/engine/hash.js';
import { NexxoPlugin, PluginHookName, PluginManifest } from '../../core/plugins/types.js';

// Basic Rollup Plugin Interface
interface RollupPlugin {
    name: string;
    resolveId?: (source: string, importer?: string, options?: any) => Promise<any> | any;
    load?: (id: string) => Promise<any> | any;
    transform?: (code: string, id: string) => Promise<any> | any;
    renderChunk?: (code: string, chunk: any, options?: any) => Promise<any> | any;
    buildStart?: (options?: any) => Promise<void> | void;
    buildEnd?: (err?: any) => Promise<void> | void;
    [key: string]: any;
}

/**
 * Adapter to use Rollup plugins within Nexxo
 * @param plugin The Rollup plugin instance
 * @returns An Nexxo-compatible plugin
 */
export function rollupAdapter(plugin: RollupPlugin): NexxoPlugin {
    const hooks: PluginHookName[] = [];
    if (plugin.resolveId) hooks.push('resolveId');
    // Note: load hook in Nexxo takes {path, id}, rollup takes id.
    if (plugin.load) hooks.push('load');
    // transformModule maps to transform
    if (plugin.transform) hooks.push('transformModule');
    if (plugin.renderChunk) hooks.push('renderChunk');
    if (plugin.buildEnd) hooks.push('buildEnd');

    const manifest: PluginManifest = {
        name: `rollup-compat-${plugin.name}`,
        version: '1.0.0',
        engineVersion: '1.0.0',
        type: 'js',
        hooks,
        permissions: { fs: 'read' }
    };

    const id = canonicalHash(manifest.name + manifest.version);

    return {
        manifest,
        id,
        async runHook(hook: PluginHookName, input: any, context?: any) {
            if (hook === 'resolveId' && plugin.resolveId) {
                const { source, importer } = input;
                // Rollup context mock
                const ctx = {
                    meta: {},
                    resolve: async () => null
                };
                const res = await plugin.resolveId.call(ctx, source, importer);
                if (!res) return null;
                if (typeof res === 'string') return { id: res };
                if (typeof res === 'object' && res.id) return res;
                return null;
            }

            if (hook === 'load' && plugin.load) {
                const { id } = input; // Use current ID
                const ctx = { meta: {} };
                const res = await plugin.load.call(ctx, id);
                if (!res) return null;
                if (typeof res === 'string') return { code: res };
                if (typeof res === 'object' && res.code) return { code: res.code };
                return null;
            }

            if (hook === 'transformModule' && plugin.transform) {
                const { code, id } = input;
                const ctx = { meta: {} };
                const res = await plugin.transform.call(ctx, code, id);

                if (!res) return { code }; // No transform
                if (typeof res === 'string') return { code: res };
                if (typeof res === 'object' && res.code) return { code: res.code, map: res.map };
                return { code };
            }

            if (hook === 'buildEnd' && plugin.buildEnd) {
                await plugin.buildEnd();
            }

            return input;
        }
    };
}

export const createRollupAdapter = rollupAdapter;
