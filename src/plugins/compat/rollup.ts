import { Plugin } from '../index.js';

// Basic Rollup Plugin Interface
interface RollupPlugin {
    name: string;
    resolveId?: (this: RollupPluginContext, source: string, importer?: string, options?: any) => Promise<any> | any;
    load?: (this: RollupPluginContext, id: string) => Promise<any> | any;
    transform?: (this: RollupPluginContext, code: string, id: string) => Promise<any> | any;
    renderChunk?: (this: RollupPluginContext, code: string, chunk: any, options?: any) => Promise<any> | any;
    buildStart?: (this: RollupPluginContext, options?: any) => Promise<void> | void;
    buildEnd?: (this: RollupPluginContext, err?: any) => Promise<void> | void;
    [key: string]: any;
}

interface RollupPluginContext {
    meta: Record<string, any>;
    warn: (message: string) => void;
    error: (message: string) => void;
    emitFile: (file: { type: 'asset'; name?: string; source: string | Uint8Array }) => void;
    resolve: (source: string, importer?: string) => Promise<string | null>;
    getModuleInfo: (id: string) => Promise<any>;
    watchFile: (id: string) => void;
    [key: string]: any;
}

function createRollupContext(): RollupPluginContext {
    return {
        meta: {},
        warn: (message: string) => {
            console.warn(`[rollupAdapter] ${message}`);
        },
        error: (message: string) => {
            throw new Error(`[rollupAdapter] ${message}`);
        },
        emitFile: () => {
            // No-op: asset emission is not supported by the adapter yet
        },
        resolve: async () => null,
        getModuleInfo: async () => null,
        watchFile: () => {
            // no-op for compatibility
        }
    };
}

/**
 * Adapter to use Rollup plugins within Lunx
 * @param plugin The Rollup plugin instance
 * @returns A Lunx-compatible plugin
 */
export function rollupAdapter(plugin: RollupPlugin): Plugin {
    return {
        name: plugin.name,

        async resolveId(source: string, importer?: string) {
            if (!plugin.resolveId) return undefined;

            const ctx = createRollupContext();
            const res = await plugin.resolveId.call(ctx, source, importer);
            if (!res) return undefined;
            if (typeof res === 'string') return res;
            if (typeof res === 'object' && res.id) return res.id;
            return undefined;
        },

        async load(id: string) {
            if (!plugin.load) return undefined;

            const ctx = createRollupContext();
            const res = await plugin.load.call(ctx, id);
            if (!res) return undefined;
            if (typeof res === 'string') return res;
            if (typeof res === 'object' && res.code) return res.code;
            return undefined;
        },

        async transform(code: string, id: string) {
            if (!plugin.transform) return undefined;

            const ctx = createRollupContext();
            const res = await plugin.transform.call(ctx, code, id);

            if (!res) return undefined;
            if (typeof res === 'string') return res;
            if (typeof res === 'object' && res.code) return { code: res.code, map: res.map };
            return undefined;
        },

        async renderChunk(code: string, chunk: any) {
            if (!plugin.renderChunk) return undefined;

            const ctx = createRollupContext();
            const res = await plugin.renderChunk.call(ctx, code, chunk);

            if (!res) return undefined;
            if (typeof res === 'string') return res;
            if (typeof res === 'object' && res.code) return { code: res.code, map: res.map };
            return undefined;
        },

        async buildStart() {
            if (plugin.buildStart) {
                const ctx = createRollupContext();
                await plugin.buildStart.call(ctx);
            }
        },

        async buildEnd() {
            if (plugin.buildEnd) {
                const ctx = createRollupContext();
                await plugin.buildEnd.call(ctx);
            }
        }
    };
}

export const createRollupAdapter = rollupAdapter;
export const vitePluginAdapter = rollupAdapter;
export const viteToLunx = rollupAdapter;
