
import { BuildArtifact, BuildContext } from './types.js';
import { explainReporter } from './events.js';
import { canonicalHash } from './hash.js';

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

        optimized.push({
            ...artifact,
            source: content,
            id: canonicalHash(content).substring(0, 16)
        });
    }

    explainReporter.report('optimize', 'complete', `Optimization finished. ${artifacts.length} artifacts processed.`);
    return optimized;
}
