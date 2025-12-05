import { PipelineStep, PipelineContext } from '../pipeline.js';
import { log } from '../../utils/logger.js';
import { purgeUnusedCSS, splitCSSBundle, extractCriticalCSS } from '../../plugins/css/css-optimizer.js';
import path from 'path';

export class CSSOptimizationStep implements PipelineStep {
    name = 'CSS Optimization';

    async run(context: PipelineContext): Promise<void> {
        const { config, files } = context;

        // Skip if optimization is disabled
        if (!config.build?.minify && !config.css?.purge && !config.css?.critical) {
            return;
        }

        log.info('🎨 Optimizing CSS assets...');

        // Find all CSS files in the virtual file system
        const cssFiles = Object.keys(files).filter(f => f.endsWith('.css'));

        // Find all HTML/JS files to analyze usage
        const contentFiles = Object.keys(files).filter(f =>
            f.endsWith('.html') || f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.tsx')
        );

        // Collect all content for purging analysis
        let allContent = '';
        for (const file of contentFiles) {
            allContent += files[file];
        }

        // Extract potential class names from content (simple regex approach)
        // In a real implementation, we might use a proper parser or PurgeCSS
        const usedClasses = new Set<string>();
        const classMatches = allContent.match(/class=["']([^"']+)["']/g) || [];
        for (const match of classMatches) {
            const classes = match.replace(/class=["']|["']/g, '').split(/\s+/);
            classes.forEach(c => usedClasses.add(c));
        }
        // Also look for className=... in JS
        const jsClassMatches = allContent.match(/className=["']([^"']+)["']/g) || [];
        for (const match of jsClassMatches) {
            const classes = match.replace(/className=["']|["']/g, '').split(/\s+/);
            classes.forEach(c => usedClasses.add(c));
        }

        for (const cssFile of cssFiles) {
            let css = files[cssFile];
            const originalSize = css.length;

            // 1. Purge Unused CSS
            if (config.css?.purge) {
                // Detect framework from config or assume none/generic
                const framework = config.css.framework || 'none';
                css = await purgeUnusedCSS(css, usedClasses, { framework });
                files[cssFile] = css;
            }

            // 2. Critical CSS Splitting
            if (config.css?.critical) {
                // We need an HTML entry point to determine critical CSS
                // For now, we'll assume index.html or similar
                const htmlFile = contentFiles.find(f => f.endsWith('index.html'));

                if (htmlFile) {
                    const html = files[htmlFile];
                    const critical = await extractCriticalCSS(html, css);

                    if (critical) {
                        const criticalFile = cssFile.replace('.css', '.critical.css');
                        files[criticalFile] = critical;
                        log.info(`   Generated critical CSS: ${criticalFile} (${critical.length} bytes)`);

                        // Remove critical CSS from main bundle? 
                        // Usually we keep it or load the rest async. 
                        // For this prototype, we'll just create the critical file.
                    }
                } else {
                    // Fallback: Split by size/rule boundary if no HTML found
                    const { critical, async } = await splitCSSBundle(css);
                    if (async) {
                        files[cssFile] = critical; // Main file becomes critical/initial
                        const asyncFile = cssFile.replace('.css', '.async.css');
                        files[asyncFile] = async;
                        log.info(`   Split CSS bundle: ${asyncFile} created`);
                    }
                }
            }

            if (css.length < originalSize) {
                log.info(`   Optimized ${path.basename(cssFile)}: ${originalSize} -> ${css.length} bytes`);
            }
        }
    }
}
