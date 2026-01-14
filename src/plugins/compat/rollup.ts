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
 * Adapter to use Rollup plugins within Nexxo
 * @param plugin The Rollup plugin instance
 * @returns A Nexxo-compatible plugin
 */
export function rollupAdapter(plugin: RollupPlugin): Plugin {
    return {
        name: plugin.name,

        async resolveId(source: string, importer?: string) {
            if (!plugin.resolveId) return undefined;

            const ctx = {
                meta: {},
                resolve: async () => null
            };
            const res = await plugin.resolveId.call(ctx, source, importer);
            if (!res) return undefined;
            if (typeof res === 'string') return res;
            if (typeof res === 'object' && res.id) return res.id;
            return undefined;
        },

        async load(id: string) {
            if (!plugin.load) return undefined;

            const ctx = { meta: {} };
            const res = await plugin.load.call(ctx, id);
            if (!res) return undefined;
            if (typeof res === 'string') return res;
            if (typeof res === 'object' && res.code) return res.code;
            return undefined;
        },

        async transform(code: string, id: string) {
            if (!plugin.transform) return undefined;

            const ctx = { meta: {} };
            const res = await plugin.transform.call(ctx, code, id);

            if (!res) return undefined;
            if (typeof res === 'string') return res;
            if (typeof res === 'object' && res.code) return { code: res.code, map: res.map };
            return undefined;
        },

        async renderChunk(code: string, chunk: any) {
            if (!plugin.renderChunk) return undefined;

            const ctx = { meta: {} };
            const res = await plugin.renderChunk.call(ctx, code, chunk);

            if (!res) return undefined;
            if (typeof res === 'string') return res;
            if (typeof res === 'object' && res.code) return { code: res.code, map: res.map };
            return undefined;
        },

        async buildStart() {
            if (plugin.buildStart) {
                await plugin.buildStart();
            }
        },

        async buildEnd() {
            if (plugin.buildEnd) {
                await plugin.buildEnd();
            }
        }
    };
}

export const createRollupAdapter = rollupAdapter;
