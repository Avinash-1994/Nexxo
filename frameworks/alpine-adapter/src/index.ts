import * as vite from 'vite';
import type { InlineConfig, ViteDevServer } from 'vite';
import { FrameworkAdapter, AdapterOptions, AdapterOutput, HMREvent } from './types.js';
import path from 'path';

const { build: viteBuild, createServer } = vite;

export class AlpineAdapter implements FrameworkAdapter {
    name = 'alpine-adapter';
    private options!: AdapterOptions;
    private devServer: ViteDevServer | null = null;

    async init(options: AdapterOptions): Promise<void> {
        this.options = options;
        if (!options.entryPoints || options.entryPoints.length === 0) {
            throw new Error('AlpineAdapter: No entry points provided');
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
                    // Alpine is usually a dependency in node_modules. We want to BUNDLE it.
                    // Vite/Rollup defaults to bundling dependencies if they are imported.
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
            logLevel: 'silent'
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
                appType: 'custom'
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
            // Alpine HMR is tricky. Often easier to reload if state isn't preserved.
            // But we must support neutral interface.
            return { type: 'update', modules: Array.from(mods).map((m: any) => m.url) };
        }
        return { type: 'reload', modules: [] };
    }
}
