import * as vite from 'vite';
import type { InlineConfig, ViteDevServer } from 'vite';
import { FrameworkAdapter, AdapterOptions, AdapterOutput, HMREvent } from './types.js';
import path from 'path';
import fs from 'fs/promises';

const { build: viteBuild, createServer } = vite;

export class LitAdapter implements FrameworkAdapter {
    name = 'lit-adapter';
    private options!: AdapterOptions;
    private devServer: ViteDevServer | null = null;

    async init(options: AdapterOptions): Promise<void> {
        this.options = options;
        // Validation
        if (!options.entryPoints || options.entryPoints.length === 0) {
            throw new Error('LitAdapter: No entry points provided');
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
                    external: [], // Lit should be bundled? Or external? Usually bundled for apps.
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

        const output: AdapterOutput = {
            assets: [],
            manifest: {}
        };

        for (const res of outputs) {
            if ('close' in res) {
                // It's a watcher?? Should not happen.
                continue;
            }
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
        // In Dev, we might just use Vite's transformMiddleware or a simple build
        // For the purpose of "Adapter acts as data producer", we might want a fast in-memory build 
        // OR we start the server and let Nexxo proxy requests?
        // Module 8 says: "Orchestrate the framework's own toolchain... produce a normalized output graph"
        // "Nexxo treats outputs as inert data"

        // For complexity simplicity in this "Adapter" model, let's run a Vite build in 'development' mode
        // But keep the server instance for HMR if needed.
        // Actually, if Nexxo serves the files, we need the CONTENT. 
        // Vite's `createServer` is best for this.

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

        // For "build:dev", we essentially want to transform the entry points.
        const output: AdapterOutput = {
            assets: [],
            manifest: {}
        };

        for (const entry of this.options.entryPoints) {
            // Transform entry point
            const url = '/' + path.relative(this.options.root, entry);
            const result = await this.devServer.transformRequest(url);
            if (result) {
                output.assets.push({
                    fileName: path.basename(entry).replace(/\.ts$/, '.js'), // Simple mapping
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

        // Map Nexxo HMR event to Vite's internal module graph
        const mods = this.devServer.moduleGraph.getModulesByFile(event.file);
        if (mods && mods.size > 0) {
            // Vite handles HMR internally via WS usually.
            // If Nexxo handles the WS connection, we need to generate the HMR payload.
            // But Module 8 says "Expose neutral HMR boundaries: invalidate(module)".

            // For now, we return 'update' and assume Nexxo will re-request the file or trigger client update.
            return { type: 'update', modules: Array.from(mods).map((m: any) => m.url) };
        }

        return { type: 'reload', modules: [] };
    }
}
