import { Plugin } from '../index.js';

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
 * Adapter to use Rollup plugins within Urja
 * @param plugin The Rollup plugin instance
 * @returns An Urja-compatible plugin
 */
export function rollupAdapter(plugin: RollupPlugin): Plugin {
    return {
        name: plugin.name,

        async buildStart() {
            if (plugin.buildStart) {
                // Mock context if needed
                await plugin.buildStart.call({ meta: {} } as any, {} as any);
            }
        },

        async buildEnd() {
            if (plugin.buildEnd) {
                await plugin.buildEnd();
            }
        },

        async resolveId(source: string, importer?: string) {
            if (!plugin.resolveId) return undefined;

            // Call Rollup hook
            // Note: Rollup resolveId context includes `resolve` method etc.
            // We provide a minimal mock context
            const ctx = {
                meta: {},
                resolve: async () => null // Mock resolve
            };

            const result = await plugin.resolveId.call(ctx as any, source, importer);

            if (result === null || result === undefined) return undefined;
            if (typeof result === 'string') return result;
            if (typeof result === 'object' && result.id) return result.id;

            return undefined;
        },

        async renderChunk(code: string, chunk: any) {
            if (!plugin.renderChunk) return undefined;

            const ctx = { meta: {} };
            // Mock options as empty
            const result = await plugin.renderChunk.call(ctx as any, code, chunk, {});

            if (result === null || result === undefined) return undefined;
            if (typeof result === 'string') return result;

            if (typeof result === 'object') {
                return {
                    code: result.code,
                    map: result.map
                };
            }
            return undefined;
        },

        async load(id: string) {
            if (!plugin.load) return undefined;

            const ctx = { meta: {} };
            const result = await plugin.load.call(ctx as any, id);

            if (result === null || result === undefined) return undefined;
            if (typeof result === 'string') return result;
            if (typeof result === 'object' && result.code) return result.code; // Urja simplifies loaded content to string for now

            return undefined;
        },

        async transform(code: string, id: string) {
            if (!plugin.transform) return undefined;

            const ctx = { meta: {} };
            const result = await plugin.transform.call(ctx as any, code, id);

            if (result === null || result === undefined) return undefined;
            if (typeof result === 'string') return result;

            if (typeof result === 'object') {
                return {
                    code: result.code,
                    map: result.map
                };
            }
            return undefined;
        }
    };
}

// Alias for backward compatibility
export const createRollupAdapter = rollupAdapter;
