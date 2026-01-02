import * as vite from 'vite';
import type { InlineConfig, ViteDevServer } from 'vite';
import { FrameworkAdapter, AdapterOptions, AdapterOutput, HMREvent } from './types.js';
import path from 'path';

const { build: viteBuild, createServer } = vite;

export class MithrilAdapter implements FrameworkAdapter {
    name = 'mithril-adapter';
    private options!: AdapterOptions;
    private devServer: ViteDevServer | null = null;

    async init(options: AdapterOptions): Promise<void> {
        this.options = options;
        if (!options.entryPoints || options.entryPoints.length === 0) {
            throw new Error('MithrilAdapter: No entry points provided');
        }
    }

    async build(): Promise<AdapterOutput> {
        if (this.options.mode === 'dev') {
            return this.buildDev();
        } else {
            return this.buildProd();
        }
    }

    private async buildProd(): Promise<AdapterOutput> {
        const config: InlineConfig = {
            root: this.options.root,
            mode: 'production',
            build: {
                assetsInlineLimit: 0,
                outDir: this.options.outputDir,
                emptyOutDir: true,
                lib: {
                    entry: this.options.entryPoints,
                    formats: ['es'],
                    fileName: (format: string, entryName: string) => `${entryName}.${format}.js`
                },
                rollupOptions: {
                    external: [],
                    output: {
                        assetFileNames: (assetInfo: any) => {
                            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                                return 'assets/[name]-[hash][extname]';
                            }
                            return 'assets/[name]-[hash][extname]';
                        }
                    }
                }
            },
            logLevel: 'silent',
            esbuild: {
                jsxFactory: 'm',
                jsxFragment: 'm.Fragment'
            }
        };

        const result = await viteBuild(config);

        const outputs = Array.isArray(result) ? result : [result];
        const output: AdapterOutput = { assets: [], manifest: {} };

        for (const res of outputs) {
            if ('close' in res) continue;
            if (!('output' in res)) continue;

            for (const chunk of res.output) {
                if (chunk.type === 'chunk') {
                    output.assets.push({
                        fileName: chunk.fileName,
                        source: chunk.code,
                        type: 'js'
                    });
                    if (chunk.facadeModuleId) {
                        output.manifest[chunk.facadeModuleId] = chunk.fileName;
                    }
                } else if (chunk.type === 'asset') {
                    output.assets.push({
                        fileName: chunk.fileName,
                        source: chunk.source,
                        type: chunk.fileName.endsWith('.css') ? 'css' : 'asset'
                    });
                }
            }
        }
        return output;
    }

    private async buildDev(): Promise<AdapterOutput> {
        if (!this.devServer) {
            this.devServer = await createServer({
                root: this.options.root,
                mode: 'development',
                server: {
                    middlewareMode: true,
                    hmr: true
                },
                appType: 'custom',
                esbuild: {
                    jsxFactory: 'm',
                    jsxFragment: 'm.Fragment'
                }
            });
        }

        const output: AdapterOutput = { assets: [], manifest: {} };

        for (const entry of this.options.entryPoints) {
            const url = '/' + path.relative(this.options.root, entry);
            const result = await this.devServer.transformRequest(url);
            if (result) {
                output.assets.push({
                    fileName: path.basename(entry).replace(/\.ts$/, '.js'),
                    source: result.code,
                    type: 'js'
                });
                output.manifest[entry] = path.basename(entry).replace(/\.ts$/, '.js');
            }
        }
        return output;
    }

    async handleHmr(event: HMREvent): Promise<{ type: 'reload' | 'update', modules: string[] }> {
        if (!this.devServer) return { type: 'reload', modules: [] };

        const mods = this.devServer.moduleGraph.getModulesByFile(event.file);
        if (mods && mods.size > 0) {
            // Mithril HMR: Usually requires logic to tear down and re-mount.
            // For now, we return 'update' and leave it to the runtime (if configured) or Urja handles it.
            // But realistically, Mithril often needs a reload/redraw.
            return { type: 'update', modules: Array.from(mods).map((m: any) => m.url) };
        }
        return { type: 'reload', modules: [] };
    }
}
