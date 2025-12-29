import { UrjaPlugin, PluginHookName } from '../../core/plugins/types.js';
import { canonicalHash } from '../../core/engine/hash.js';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Supported Hook Surface (Phase B1):
 * - transform (Mapped to transformModule)
 * - buildStart (Mapped to beforeGraph)
 * - buildEnd (Mapped to afterGraph)
 * - renderChunk (Mapped to renderChunk)
 * - resolveId (Mapped to resolveId)
 * - load (Mapped to load)
 * 
 * NOTE: Lifecycle hooks requiring deep Graph API access are experimental.
 */
export function createRollupAdapter(rollupPlugin: any): UrjaPlugin {
    const hookMap: Record<string, PluginHookName> = {
        'transform': 'transformModule',
        'buildStart': 'beforeGraph',
        'buildEnd': 'afterGraph',
        'renderChunk': 'renderChunk',
        'resolveId': 'resolveId',
        'load': 'load'
    };

    // Audit for unsupported hooks
    const rollupHooks = Object.keys(rollupPlugin);
    const unsupported = rollupHooks.filter(h =>
        typeof rollupPlugin[h] === 'function' &&
        !['name', 'transform', 'buildStart', 'buildEnd', 'renderChunk', 'resolveId', 'load'].includes(h)
    );

    if (unsupported.length > 0) {
        console.warn(`[Urja Compat] Plugin "${rollupPlugin.name}" uses unsupported hooks: ${unsupported.join(', ')}. These will be ignored.`);
    }

    const urjaHooks: PluginHookName[] = [];
    for (const [rollupHook, urjaHook] of Object.entries(hookMap)) {
        if (rollupPlugin[rollupHook]) {
            if (!urjaHooks.includes(urjaHook)) {
                urjaHooks.push(urjaHook);
            }
        }
    }

    return {
        manifest: {
            name: `rollup-compat:${rollupPlugin.name || 'unnamed'}`,
            version: '1.0.0-compat',
            engineVersion: '1.0.0',
            type: 'js',
            hooks: urjaHooks,
            permissions: { fs: 'read' }
        },
        id: canonicalHash(`rollup-compat:${rollupPlugin.name || 'unnamed'}`),
        async runHook(hook, input) {
            const context = {
                name: rollupPlugin.name,
                meta: { rollupVersion: '2.0.0', watchMode: false },
                async resolve(source: string, importer?: string) {
                    // Simple resolution bridge
                    // In a real Rollup environment, this would call other plugins.
                    // For now, we do a basic path resolve.
                    const dir = importer || process.cwd();
                    const abs = path.resolve(dir, source);
                    if (fs.existsSync(abs)) return { id: abs };
                    return null;
                },
                parse(code: string, options?: any) {
                    const acorn = require('acorn');
                    return acorn.parse(code, { ecmaVersion: 'latest', ...options });
                },
                error(err: any) { throw err; },
                warn(msg: string) { console.warn(`[Rollup:${rollupPlugin.name}]`, msg); }
            };

            try {
                switch (hook) {
                    case 'transformModule':
                        if (rollupPlugin.transform) {
                            // Rollup transform(code, id)
                            const result = await rollupPlugin.transform.call(context, input.code, input.id || input.path);
                            if (result === null || result === undefined) return input;
                            if (typeof result === 'string') return { ...input, code: result };
                            // Rollup result can be { code, map, ast, ... }
                            return { ...input, ...result };
                        }
                        break;

                    case 'beforeGraph':
                        if (rollupPlugin.buildStart) {
                            await rollupPlugin.buildStart.call(context, {});
                        }
                        // If it has resolveId, we could hook it into a specialized Urja hook if added
                        break;

                    case 'afterGraph':
                        if (rollupPlugin.buildEnd) {
                            await rollupPlugin.buildEnd.call(context);
                        }
                        break;

                    case 'renderChunk':
                        if (rollupPlugin.renderChunk) {
                            // Rollup renderChunk(code, chunk, options)
                            const result = await rollupPlugin.renderChunk.call(context, input.source || input.code, input, {});
                            if (result === null || result === undefined) return input;
                            if (typeof result === 'string') return { ...input, source: result, code: result };
                            return { ...input, ...result };
                        }
                        break;

                    case 'resolveId':
                        if (rollupPlugin.resolveId) {
                            const result = await rollupPlugin.resolveId.call(context, input.source, input.importer, {});
                            if (typeof result === 'string') return { id: result };
                            if (result && typeof result === 'object' && result.id) return result;
                            return null;
                        }
                        break;

                    case 'load':
                        if (rollupPlugin.load) {
                            // Rollup load(id)
                            const result = await rollupPlugin.load.call(context, input.id);
                            if (typeof result === 'string') return { code: result };
                            if (result && typeof result === 'object' && result.code) return result;
                            return null;
                        }
                        break;
                }
            } catch (err: any) {
                console.error(`[RollupCompat] Error in plugin ${rollupPlugin.name}:`, err);
                throw err;
            }
            return input;
        }
    };
}

/**
 * Webpack Loader Compatibility Layer
 * 
 * Supports transform-only, stateless loaders.
 */
export function createWebpackLoaderAdapter(loader: Function, name: string): UrjaPlugin {
    return {
        manifest: {
            name: `webpack-compat:${name}`,
            version: '1.0.0-compat',
            engineVersion: '1.0.0',
            type: 'js',
            hooks: ['transformModule'],
            permissions: { fs: 'read' }
        },
        id: canonicalHash(`webpack-compat:${name}`),
        async runHook(hook, input) {
            if (hook === 'transformModule') {
                // Webpack loaders are often synchronous or use this.async()
                // For now, we assume a simple function that takes content and returns content
                // More complex loader context can be added if needed
                const context = {
                    resourcePath: input.path,
                    async: () => (err: any, result: string) => result,
                    callback: (err: any, result: string) => result,
                };

                const result = await loader.call(context, input.code);
                return { ...input, code: result };
            }
            return input;
        }
    };
}
