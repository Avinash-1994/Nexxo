import { LunxPlugin, PluginHookName } from '../core/plugins/types.js';

// Generic interface for Rollup/Vite-style plugins to make them compatible
export interface CommunityPlugin {
    name: string;
    resolveId?: any;
    load?: any;
    transform?: any;
    configureServer?: (server: any) => void;
    [key: string]: any;
}

/**
 * Adapter to run Community (Vite/Rollup) plugins within Lunx
 * Converts middleware-based plugins to Lunx's Command Pattern
 */
export function adaptPlugin(plugin: CommunityPlugin): LunxPlugin {
    const hooks: PluginHookName[] = [];
    if (plugin.resolveId) hooks.push('resolveId');
    if (plugin.load) hooks.push('load');
    if (plugin.transform) hooks.push('transformModule');

    // Lunx mandates strict versioning, so we mock it for community plugins
    return {
        manifest: {
            name: `adapter:${plugin.name}`,
            version: '0.0.0-adapter', // Placeholder
            engineVersion: '2.0.0',   // Target current engine
            type: 'js',
            hooks: hooks,
            permissions: { fs: 'read' }
        },
        // Unique ID generation to safely allow multiple instances
        id: `adapter:${plugin.name}-${Math.random().toString(36).substring(2, 6)}`,

        async runHook(hookName: PluginHookName, input: any, context?: any) {
            // 1. ResolveId Hook
            if (hookName === 'resolveId' && plugin.resolveId) {
                const handler = typeof plugin.resolveId === 'function' ? plugin.resolveId : plugin.resolveId.handler;
                const ctx = {
                    resolve: () => { }, // Mock resolve context
                    warn: (msg: string) => console.warn(`[${plugin.name}] ${msg}`),
                    error: (msg: string) => console.error(`[${plugin.name}] ${msg}`)
                };
                try {
                    // Adapt input: Lunx passes object { source, importer }, Rollup expects (source, importer)
                    const source = input.source || input.id;
                    const importer = input.importer;

                    const res = await handler.call(ctx, source, importer, { isEntry: false });

                    if (!res) return null;
                    return typeof res === 'string' ? { id: res } : { id: res.id };
                } catch (e) {
                    return null; // Fallback to next plugin
                }
            }

            // 2. Load Hook
            if (hookName === 'load' && plugin.load) {
                const handler = typeof plugin.load === 'function' ? plugin.load : plugin.load.handler;
                const ctx = {
                    warn: (msg: string) => console.warn(`[${plugin.name}] ${msg}`),
                    error: (msg: string) => console.error(`[${plugin.name}] ${msg}`)
                };
                try {
                    const res = await handler.call(ctx, input.id);
                    return res ? { code: typeof res === 'string' ? res : res.code } : null;
                } catch (e) {
                    return null;
                }
            }

            // 3. Transform Hook
            if (hookName === 'transformModule' && plugin.transform) {
                const handler = typeof plugin.transform === 'function' ? plugin.transform : plugin.transform.handler;
                const ctx = {
                    warn: (msg: string) => console.warn(`[${plugin.name}] ${msg}`),
                    error: (msg: string) => console.error(`[${plugin.name}] ${msg}`)
                };
                try {
                    const res = await handler.call(ctx, input.code, input.path);
                    if (!res) return input;

                    if (typeof res === 'string') return { ...input, code: res };
                    return { ...input, code: res.code, map: res.map }; // Merge maps if needed
                } catch (e) {
                    console.error(`Adapter error for ${plugin.name}:`, e);
                    return input;
                }
            }

            return input;
        }
    };
}
