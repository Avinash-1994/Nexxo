import { BuildArtifact, BuildContext } from './types.js';
import { explainReporter } from './events.js';
import { canonicalHash } from './hash.js';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';

export async function optimizeArtifacts(artifacts: BuildArtifact[], ctx: BuildContext): Promise<BuildArtifact[]> {
    explainReporter.report('optimize', 'start', 'Starting optimization passes');

    const optimized: BuildArtifact[] = [];

    for (const artifact of artifacts) {
        if (!artifact.source) {
            optimized.push(artifact);
            continue;
        }

        let content = typeof artifact.source === 'string'
            ? artifact.source
            : new TextDecoder().decode(artifact.source);

        // 1. Minification (Production-grade via esbuild)
        if (ctx.config.minify) {
            explainReporter.report('optimize', 'minify', `Minifying ${artifact.fileName}`);
            try {
                const { transform } = await import('esbuild');
                const result = await transform(content, {
                    minify: true,
                    loader: artifact.type as any,
                    legalComments: 'none',
                    charset: 'utf8'
                });
                content = result.code;
            } catch (err: any) {
                explainReporter.report('optimize', 'error', `Minification failed for ${artifact.fileName}: ${err.message}`);
                // Fallback to slightly safer heuristic or keep as is
            }
        }

        // 2. Metadata Stripping
        content = content.replace(/\/\/# sourceMappingURL=.*/g, '');

        const optimizedArtifact = {
            ...artifact,
            source: content,
            id: canonicalHash(content).substring(0, 16)
        };
        optimized.push(optimizedArtifact);

        // 3. Compression (Gzip & Brotli)
        // Only compress text-based assets in production
        if ((ctx.mode === 'production' || ctx.mode === 'build') && /\.(js|css|html|svg|json)$/.test(artifact.fileName)) {
            const buffer = Buffer.from(content);

            // Gzip
            try {
                const gz = gzipSync(buffer, { level: constants.Z_BEST_COMPRESSION });
                optimized.push({
                    id: optimizedArtifact.id + '.gz',
                    fileName: optimizedArtifact.fileName + '.gz',
                    source: gz,
                    type: 'asset',
                    dependencies: []
                });
                explainReporter.report('optimize', 'gzip', `Generated ${artifact.fileName}.gz`);
            } catch (e) {
                explainReporter.report('optimize', 'warn', `Gzip failed for ${artifact.fileName}`);
            }

            // Brotli
            try {
                const br = brotliCompressSync(buffer, {
                    params: {
                        [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
                        [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
                    }
                });
                optimized.push({
                    id: optimizedArtifact.id + '.br',
                    fileName: optimizedArtifact.fileName + '.br',
                    source: br,
                    type: 'asset',
                    dependencies: []
                });
                explainReporter.report('optimize', 'brotli', `Generated ${artifact.fileName}.br`);
            } catch (e) {
                explainReporter.report('optimize', 'warn', `Brotli failed for ${artifact.fileName}`);
            }
        }
    }

    explainReporter.report('optimize', 'complete', `Optimization finished. ${optimized.length} artifacts generated.`);
    return optimized;
}
