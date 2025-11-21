import { Plugin as EsbuildPlugin } from 'esbuild';
import { PluginManager } from './index.js';
import path from 'path';
import fs from 'fs/promises';

export function createEsbuildPlugin(pm: PluginManager): EsbuildPlugin {
    return {
        name: 'nextgen-adapter',
        setup(build) {
            build.onLoad({ filter: /.*/ }, async (args) => {
                // Skip node_modules
                if (args.path.includes('node_modules')) return;

                const ext = path.extname(args.path);
                // Only handle supported extensions
                if (!['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(ext)) return;

                let raw = await fs.readFile(args.path, 'utf-8');
                const transformed = await pm.transform(raw, args.path);

                return {
                    contents: transformed,
                    loader: ext.slice(1) as any,
                };
            });
        },
    };
}
