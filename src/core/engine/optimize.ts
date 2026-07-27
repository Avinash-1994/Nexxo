import { BuildArtifact, BuildContext } from './types.js';
import { explainReporter } from './events.js';
import { canonicalHash } from './hash.js';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';

export async function optimizeArtifacts(artifacts: BuildArtifact[], ctx: BuildContext): Promise<BuildArtifact[]> {
    explainReporter.report('optimize', 'start', 'Starting parallel optimization passes');

    const optimizationTasks = artifacts.map(async (artifact) => {
        if (!artifact.source) {
            return [artifact];
        }

        let content = typeof artifact.source === 'string'
            ? artifact.source
            : new TextDecoder().decode(artifact.source);

        const tasks: BuildArtifact[] = [];

        // 1. Minification (Concurrent)
        if (ctx.config.minify) {
            explainReporter.report('optimize', 'minify', `Minifying ${artifact.fileName}`);
            try {
                const { transform } = await import('esbuild');

                // Day 52: Advanced CSS Purging (Heuristic)
                if (artifact.type === 'css' && (ctx.mode === 'production' || ctx.mode === 'build')) {
                    const jsArtifacts = artifacts.filter(a => a.type === 'js');
                    const allJsContent = jsArtifacts.map(a => typeof a.source === 'string' ? a.source : new TextDecoder().decode(a.source)).join('\n');

                    if (allJsContent.length > 0) {
                        content = content.replace(/([^{}]*)\{([^}]*)\}/g, (match, selector, rules) => {
                            const cleanSelector = selector.trim().split(/[ ,>+]/)[0].replace(/[.#]/, '');
                            if (cleanSelector === '' || cleanSelector === 'body' || cleanSelector === 'html' || cleanSelector === '*' ||
                                allJsContent.includes(cleanSelector) || allJsContent.includes(selector.trim())) {
                                return match;
                            }
                            return ''; // Purged!
                        });
                    }
                }

                const result = await transform(content, {
                    minify: true,
                    keepNames: true,
                    loader: artifact.type as any,
                    legalComments: 'none',
                    charset: 'utf8',
                    define: (ctx.mode === 'production' || ctx.mode === 'build') 
                        ? { 'process.env.NODE_ENV': '"production"' } 
                        : {}
                });
                content = result.code;
            } catch (err: any) {
                explainReporter.report('optimize', 'error', `Minification failed for ${artifact.fileName}: ${err.message}`);
            }
        }

        // 2. Metadata Stripping
        if (ctx.config.sourceMaps === false) {
            content = content.replace(/\/\/# sourceMappingURL=.*/g, '');
        }

        const optimizedArtifact: BuildArtifact = {
            ...artifact,
            id: canonicalHash(content).substring(0, 16),
            source: content
        };
        tasks.push(optimizedArtifact);

        // 3. Compression (Parallel)
        if ((ctx.mode === 'production' || ctx.mode === 'build') && /\.(js|css|html|svg|json)$/.test(artifact.fileName)) {
            const buffer = Buffer.from(content);

            // Gzip
            try {
                const gz = gzipSync(buffer, { level: constants.Z_BEST_COMPRESSION });
                tasks.push({
                    id: optimizedArtifact.id + '.gz',
                    fileName: optimizedArtifact.fileName + '.gz',
                    source: gz,
                    type: 'asset',
                    dependencies: []
                });
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
                tasks.push({
                    id: optimizedArtifact.id + '.br',
                    fileName: optimizedArtifact.fileName + '.br',
                    source: br,
                    type: 'asset',
                    dependencies: []
                });
            } catch (e) {
                explainReporter.report('optimize', 'warn', `Brotli failed for ${artifact.fileName}`);
            }
        }

        return tasks;
    });

    const results = await Promise.all(optimizationTasks);
    const flattenedResults = results.flat();

    explainReporter.report('optimize', 'complete', `Optimization finished. ${flattenedResults.length} artifacts generated.`);
    return flattenedResults;
}
