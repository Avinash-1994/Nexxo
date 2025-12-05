import path from 'path';
import fs from 'fs/promises';
import esbuild from 'esbuild';
import { PipelineStep, PipelineContext } from './pipeline.js';
import { DiskCache } from '../cache/index.js';
import { createEsbuildPlugin } from '../plugins/esbuildAdapter.js';
import { AssetPlugin } from '../plugins/assets.js';
import { CssInJsPlugin } from '../plugins/css-in-js.js';
import { FederationPlugin } from '../plugins/federation.js';
import { EdgePlugin } from '../plugins/edge.js';
import { WasmPlugin } from '../plugins/wasm.js';
import { BuildReporterPlugin } from '../plugins/reporter.js';
import { log } from '../utils/logger.js';

export class ResolverStep implements PipelineStep {
    name = 'Resolver';

    async run(ctx: PipelineContext): Promise<void> {
        const { config } = ctx;
        ctx.entryPoints = {};
        config.entry.forEach((e: string, i: number) => {
            // Simple resolution for now, can be expanded
            ctx.entryPoints['entry' + i] = path.resolve(config.root, e);
        });

        if (Object.keys(ctx.entryPoints).length === 0) {
            throw new Error('No entry points found');
        }
    }
}

export class TransformerStep implements PipelineStep {
    name = 'Transformer';

    async run(ctx: PipelineContext): Promise<void> {
        // This step could run pre-bundling transforms on source files
        // For now, we rely on the BundlerStep's plugins to handle transforms during bundling
        // But we can use this slot for things like code generation or macro expansion

        // Example: Run 'buildStart' hook on plugins
        // ctx.pluginManager.plugins.forEach(p => p.buildStart?.());
    }
}

export class BundlerStep implements PipelineStep {
    name = 'Bundler';

    async run(ctx: PipelineContext): Promise<void> {
        const { config, entryPoints, pluginManager } = ctx;

        // Check cache first (Optimization: Move this to a separate CachingStep? 
        // For now, keep it close to the heavy work)
        const cache = new DiskCache(config.root);
        await cache.ensure();
        const key = await cache.keyFromFiles(Object.values(entryPoints));

        // Store cache key in context for OutputterStep
        (ctx as any).cacheKey = key;
        (ctx as any).cache = cache;

        if (await cache.has(key)) {
            log.info('Cache hit, skipping build...');
            (ctx as any).cacheHit = true;
            return;
        }

        // Register internal plugins
        const outdir = path.resolve(config.root, config.outDir);
        const internalPlugins = [
            createEsbuildPlugin(pluginManager),
            {
                name: 'asset-plugin-adapter',
                setup(build: any) {
                    new AssetPlugin(outdir).setup(build);
                }
            },
            {
                name: 'css-in-js-plugin-adapter',
                setup(build: any) {
                    new CssInJsPlugin().setup(build);
                }
            }
        ];

        // Register Reporter
        internalPlugins.push({
            name: 'build-reporter-adapter',
            setup(build: any) {
                new BuildReporterPlugin().setup(build);
            }
        });

        if (config.federation) {
            const { FederationPlugin } = await import('../plugins/federation.js');
            internalPlugins.push({
                name: 'federation-plugin-adapter',
                setup(build: any) {
                    new FederationPlugin(config.federation!, config.root).setup(build);
                }
            });
        }

        // Add Edge and WASM plugins
        internalPlugins.push({
            name: 'edge-plugin-adapter',
            setup(build: any) {
                new EdgePlugin(config).setup(build);
            }
        });
        internalPlugins.push({
            name: 'wasm-plugin-adapter',
            setup(build: any) {
                new WasmPlugin().setup(build);
            }
        });

        const targets = config.build?.targets || ['esm'];
        const isMultiTarget = targets.length > 1;

        for (const target of targets) {
            const format = target === 'cjs' ? 'cjs' : 'esm'; // 'ssr' might be cjs or esm depending on node version, assume esm for now or map 'ssr'->'cjs'
            const useSplitting = format === 'esm' && (config.build?.splitting ?? true);

            // If multi-target, use subdirectories. If single, use outDir directly.
            const targetOutDir = isMultiTarget
                ? path.resolve(config.root, config.outDir, target)
                : path.resolve(config.root, config.outDir);

            log.info(`Building target: ${target} (${format}) to ${targetOutDir}`, { category: 'build' } as any);

            await esbuild.build({
                entryPoints,
                bundle: true,
                splitting: useSplitting,
                format: format,
                outdir: targetOutDir,
                minify: config.build?.minify ?? config.mode === 'production',
                sourcemap: (() => {
                    const map = config.build?.sourcemap ?? (config.mode === 'production' ? 'hidden' : 'external');
                    if (map === 'hidden') return 'external';
                    if (map === 'external') return true;
                    if (map === 'none') return false;
                    return map;
                })() as any,
                target: ['es2022'],
                loader: { '.css': 'css' },
                metafile: true,
                logLevel: 'info',
                plugins: [
                    ...internalPlugins,
                    ...(config.esbuildPlugins || [])
                ],
            });
        }

        // In a real pipeline, we might capture the output files in memory here
        // instead of writing directly to disk, but esbuild writes to disk by default unless write: false
        // For this prototype, we let esbuild write, and OutputterStep will handle caching.
    }
}

export class OptimizerStep implements PipelineStep {
    name = 'Optimizer';

    async run(ctx: PipelineContext): Promise<void> {
        // Post-processing optimization
        // e.g. Image compression, further CSS minification not handled by esbuild
        if (ctx.config.mode === 'production') {
            // Placeholder for advanced optimizations
        }
    }
}

export class OutputterStep implements PipelineStep {
    name = 'Outputter';

    async run(ctx: PipelineContext): Promise<void> {
        const { config } = ctx;
        const cache = (ctx as any).cache as DiskCache;
        const key = (ctx as any).cacheKey;
        const isCacheHit = (ctx as any).cacheHit;

        const outdir = path.resolve(config.root, config.outDir);

        if (isCacheHit) {
            log.info('Restoring artifacts from cache...');
            await cache.restoreFiles(key, outdir);
        } else {
            // Build just finished (files are on disk from esbuild)
            // We need to cache them
            try {
                const files = (await fs.readdir(outdir)).map((f) => path.join(outdir, f));
                await cache.put({ key, outDir: outdir, files, created: Date.now() });
                await cache.putFiles(key, files);
                log.info('Cached build artifacts');
            } catch (e) {
                log.warn('Failed to cache build artifacts', { error: e } as any);
            }
        }
    }
}
