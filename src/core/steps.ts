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

        // Register internal plugins
        const outdir = path.resolve(config.root, config.outDir);
        const internalPlugins = [
            createEsbuildPlugin(pluginManager, config.root),
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
            const format = target === 'cjs' ? 'cjs' : 'esm';
            const useSplitting = format === 'esm' && (config.build?.splitting ?? true);

            const targetOutDir = isMultiTarget
                ? path.resolve(config.root, config.outDir, target)
                : path.resolve(config.root, config.outDir);

            log.info(`Building target: ${target} (${format}) to ${targetOutDir}`, { category: 'build' } as any);

            const result = await esbuild.build({
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
    }
}

export class OptimizerStep implements PipelineStep {
    name = 'Optimizer';

    async run(ctx: PipelineContext): Promise<void> {
        const { config } = ctx;

        if (config.mode !== 'production') {
            log.debug('Skipping optimization in development mode', { category: 'build' });
            return;
        }

        const outdir = path.resolve(config.root, config.outDir);

        log.info('Running production optimizations...', { category: 'build' });

        // 1. Compress assets (Brotli + Gzip)
        await this.compressAssets(outdir);

        // 2. Optimize CSS
        await this.optimizeCSS(outdir, config);

        // 3. Generate integrity hashes
        await this.generateIntegrityHashes(outdir);

        log.success('Production optimizations complete', { category: 'build' });
    }

    /**
     * Optimize CSS files
     */
    private async optimizeCSS(outdir: string, config: any): Promise<void> {
        const { CSSOptimizer } = await import('./steps/css-optimization.js');
        const optimizer = new CSSOptimizer(config.root, {
            purge: true,
            critical: true,
            minify: true
        });

        await optimizer.optimize(outdir);
    }

    /**
     * Compress all JS/CSS/HTML files with Brotli and Gzip
     */
    private async compressAssets(outdir: string): Promise<void> {
        const zlib = await import('zlib');
        const { promisify } = await import('util');

        const brotliCompress = promisify(zlib.brotliCompress);
        const gzipCompress = promisify(zlib.gzip);

        try {
            const files = await this.getCompressibleFiles(outdir);

            log.info(`Compressing ${files.length} files...`, { category: 'build' });

            // Compress in parallel
            const compressionPromises = files.map(async (file) => {
                const content = await fs.readFile(file);
                const stats = await fs.stat(file);

                // Only compress if file is > 1KB
                if (stats.size < 1024) return;

                // Brotli compression (best compression)
                try {
                    const brotliData = await brotliCompress(content, {
                        params: {
                            [zlib.constants.BROTLI_PARAM_QUALITY]: 11, // Max quality
                            [zlib.constants.BROTLI_PARAM_SIZE_HINT]: stats.size
                        }
                    });
                    await fs.writeFile(`${file}.br`, brotliData);

                    const brotliRatio = ((1 - brotliData.length / stats.size) * 100).toFixed(1);
                    log.debug(`Brotli: ${path.basename(file)} (${brotliRatio}% reduction)`, { category: 'build' });
                } catch (e) {
                    log.warn(`Failed to brotli compress ${file}`, { category: 'build' });
                }

                // Gzip compression (wider compatibility)
                try {
                    const gzipData = await gzipCompress(content, {
                        level: 9 // Max compression
                    });
                    await fs.writeFile(`${file}.gz`, gzipData);

                    const gzipRatio = ((1 - gzipData.length / stats.size) * 100).toFixed(1);
                    log.debug(`Gzip: ${path.basename(file)} (${gzipRatio}% reduction)`, { category: 'build' });
                } catch (e) {
                    log.warn(`Failed to gzip compress ${file}`, { category: 'build' });
                }
            });

            await Promise.all(compressionPromises);

            log.success(`Compressed ${files.length} files (Brotli + Gzip)`, { category: 'build' });
        } catch (error) {
            log.error('Compression failed', { category: 'build', error });
        }
    }

    /**
     * Get list of files that should be compressed
     */
    private async getCompressibleFiles(dir: string): Promise<string[]> {
        const compressibleExtensions = ['.js', '.mjs', '.css', '.html', '.svg', '.json'];
        const files: string[] = [];

        async function scan(currentDir: string) {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);

                if (entry.isDirectory()) {
                    await scan(fullPath);
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name);
                    if (compressibleExtensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        }

        await scan(dir);
        return files;
    }

    /**
     * Generate SHA-256 integrity hashes for all assets
     */
    private async generateIntegrityHashes(outdir: string): Promise<void> {
        const crypto = await import('crypto');
        const files = await this.getCompressibleFiles(outdir);
        const manifest: Record<string, string> = {};

        for (const file of files) {
            const content = await fs.readFile(file);
            const hash = crypto.createHash('sha256').update(content).digest('base64');
            const relativePath = path.relative(outdir, file);
            manifest[relativePath] = `sha256-${hash}`;
        }

        const manifestPath = path.join(outdir, 'integrity-manifest.json');
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

        log.info(`Generated integrity hashes for ${files.length} files`, { category: 'build' });
    }
}

export class OutputterStep implements PipelineStep {
    name = 'Outputter';

    async run(ctx: PipelineContext): Promise<void> {
        const { config } = ctx;
        const outdir = path.resolve(config.root, config.outDir);

        // Simplified: Just verify the output directory exists
        // Skip caching for now to prevent hanging
        try {
            const stats = await fs.stat(outdir);
            if (stats.isDirectory()) {
                const files = await fs.readdir(outdir);
                log.info(`Output directory contains ${files.length} files`);
                log.success(`Build artifacts written to: ${outdir}`);
            }
        } catch (e) {
            log.warn('Output directory not found, esbuild may have failed');
        }

        // TODO: Re-enable caching after build stability is confirmed
        // const cache = (ctx as any).cache as DiskCache;
        // const key = (ctx as any).cacheKey;
        // await cache.putFiles(key, files);
    }
}
