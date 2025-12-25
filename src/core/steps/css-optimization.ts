import fs from 'fs/promises';
import path from 'path';
import { log } from '../../utils/logger.js';

export interface CSSOptimizationConfig {
    purge?: boolean;
    critical?: boolean;
    minify?: boolean;
    safelist?: string[];
    content?: string[];
}

/**
 * Production-grade CSS Optimization
 * - Removes unused CSS
 * - Extracts critical CSS
 * - Minifies CSS
 */
export class CSSOptimizer {
    private config: CSSOptimizationConfig;
    private root: string;

    constructor(root: string, config: CSSOptimizationConfig = {}) {
        this.root = root;
        this.config = {
            purge: config.purge ?? true,
            critical: config.critical ?? true,
            minify: config.minify ?? true,
            safelist: config.safelist || [],
            content: config.content || ['**/*.html', '**/*.jsx', '**/*.tsx', '**/*.vue', '**/*.svelte']
        };
    }

    /**
     * Optimize all CSS files in output directory
     */
    async optimize(outDir: string): Promise<void> {
        const cssFiles = await this.findCSSFiles(outDir);

        if (cssFiles.length === 0) {
            log.debug('No CSS files found to optimize', { category: 'css' });
            return;
        }

        log.info(`Optimizing ${cssFiles.length} CSS files...`, { category: 'css' });

        for (const cssFile of cssFiles) {
            await this.optimizeFile(cssFile, outDir);
        }

        log.success(`CSS optimization complete`, { category: 'css' });
    }

    /**
     * Optimize a single CSS file
     */
    private async optimizeFile(cssFile: string, outDir: string): Promise<void> {
        let css = await fs.readFile(cssFile, 'utf-8');
        const originalSize = css.length;

        // 1. Remove unused CSS
        if (this.config.purge) {
            css = await this.removeUnusedCSS(css, outDir);
        }

        // 2. Minify CSS
        if (this.config.minify) {
            css = this.minifyCSS(css);
        }

        // 3. Extract critical CSS
        if (this.config.critical) {
            await this.extractCriticalCSS(cssFile, css, outDir);
        }

        // Write optimized CSS
        await fs.writeFile(cssFile, css);

        const newSize = css.length;
        const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);
        log.info(`${path.basename(cssFile)}: ${originalSize}B → ${newSize}B (${reduction}% reduction)`, {
            category: 'css'
        });
    }

    /**
     * Remove unused CSS using simple regex-based purging
     * (Production version would use PurgeCSS library, but we're zero-dependency)
     */
    private async removeUnusedCSS(css: string, outDir: string): Promise<string> {
        // Get all content files
        const contentFiles = await this.getContentFiles(outDir);
        const usedClasses = new Set<string>();
        const usedIds = new Set<string>();

        // Extract all class names and IDs from content
        for (const file of contentFiles) {
            try {
                const content = await fs.readFile(file, 'utf-8');

                // Extract class names
                const classMatches = content.matchAll(/class(?:Name)?=["']([^"']+)["']/g);
                for (const match of classMatches) {
                    match[1].split(/\s+/).forEach(cls => usedClasses.add(cls));
                }

                // Extract IDs
                const idMatches = content.matchAll(/id=["']([^"']+)["']/g);
                for (const match of idMatches) {
                    usedIds.add(match[1]);
                }
            } catch (e) {
                // Skip files that can't be read
            }
        }

        // Add safelist
        this.config.safelist?.forEach(cls => usedClasses.add(cls));

        // Remove unused selectors
        const lines = css.split('\n');
        const optimizedLines: string[] = [];
        let inRule = false;
        let currentRule = '';
        let keepRule = false;

        for (const line of lines) {
            // Check if this is a selector line
            if (line.trim().endsWith('{')) {
                inRule = true;
                currentRule = line;

                // Check if selector is used
                const selector = line.substring(0, line.lastIndexOf('{')).trim();
                keepRule = this.isSelectorUsed(selector, usedClasses, usedIds);

                if (keepRule) {
                    optimizedLines.push(line);
                }
            } else if (line.trim() === '}') {
                if (keepRule) {
                    optimizedLines.push(line);
                }
                inRule = false;
                currentRule = '';
            } else if (inRule && keepRule) {
                optimizedLines.push(line);
            } else if (!inRule) {
                // Keep comments, @rules, etc.
                optimizedLines.push(line);
            }
        }

        return optimizedLines.join('\n');
    }

    /**
     * Check if a CSS selector is used in the content
     */
    private isSelectorUsed(selector: string, usedClasses: Set<string>, usedIds: Set<string>): boolean {
        // Always keep @rules, keyframes, etc.
        if (selector.startsWith('@') || selector.startsWith(':root')) {
            return true;
        }

        // Check class selectors
        const classMatch = selector.match(/\.([a-zA-Z0-9_-]+)/);
        if (classMatch && usedClasses.has(classMatch[1])) {
            return true;
        }

        // Check ID selectors
        const idMatch = selector.match(/#([a-zA-Z0-9_-]+)/);
        if (idMatch && usedIds.has(idMatch[1])) {
            return true;
        }

        // Keep element selectors, pseudo-classes, etc.
        if (!selector.includes('.') && !selector.includes('#')) {
            return true;
        }

        return false;
    }

    /**
     * Minify CSS (simple version)
     */
    private minifyCSS(css: string): string {
        return css
            // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove whitespace
            .replace(/\s+/g, ' ')
            // Remove space around special characters
            .replace(/\s*([{}:;,])\s*/g, '$1')
            // Remove trailing semicolons
            .replace(/;}/g, '}')
            .trim();
    }

    /**
     * Extract critical CSS (above-the-fold styles)
     */
    private async extractCriticalCSS(cssFile: string, css: string, outDir: string): Promise<void> {
        // Find HTML files
        const htmlFiles = await this.findHTMLFiles(outDir);

        if (htmlFiles.length === 0) return;

        // Extract selectors that are likely critical (simple heuristic)
        const criticalSelectors = [
            'html', 'body', 'header', 'nav', 'main', 'footer',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'a', 'button', 'input', 'form'
        ];

        const criticalCSS: string[] = [];
        const lines = css.split('\n');
        let inCriticalRule = false;
        let currentRule = '';

        for (const line of lines) {
            if (line.trim().endsWith('{')) {
                const selector = line.substring(0, line.lastIndexOf('{')).trim();
                inCriticalRule = criticalSelectors.some(crit => selector.includes(crit));
                currentRule = line;

                if (inCriticalRule) {
                    criticalCSS.push(line);
                }
            } else if (line.trim() === '}') {
                if (inCriticalRule) {
                    criticalCSS.push(line);
                }
                inCriticalRule = false;
            } else if (inCriticalRule) {
                criticalCSS.push(line);
            }
        }

        // Write critical CSS file
        const criticalCSSPath = cssFile.replace('.css', '.critical.css');
        await fs.writeFile(criticalCSSPath, criticalCSS.join('\n'));

        log.info(`Extracted critical CSS: ${path.basename(criticalCSSPath)}`, { category: 'css' });

        // Inject critical CSS into HTML files
        for (const htmlFile of htmlFiles) {
            await this.injectCriticalCSS(htmlFile, criticalCSS.join('\n'));
        }
    }

    /**
     * Inject critical CSS inline into HTML
     */
    private async injectCriticalCSS(htmlFile: string, criticalCSS: string): Promise<void> {
        let html = await fs.readFile(htmlFile, 'utf-8');

        // Check if already has critical CSS
        if (html.includes('<style data-critical>')) {
            return;
        }

        // Inject before closing </head>
        const criticalTag = `<style data-critical>${this.minifyCSS(criticalCSS)}</style>`;
        html = html.replace('</head>', `${criticalTag}\n</head>`);

        await fs.writeFile(htmlFile, html);
        log.debug(`Injected critical CSS into ${path.basename(htmlFile)}`, { category: 'css' });
    }

    /**
     * Find all CSS files in directory
     */
    private async findCSSFiles(dir: string): Promise<string[]> {
        const files: string[] = [];

        async function scan(currentDir: string) {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);

                if (entry.isDirectory()) {
                    await scan(fullPath);
                } else if (entry.isFile() && entry.name.endsWith('.css') && !entry.name.includes('.critical.')) {
                    files.push(fullPath);
                }
            }
        }

        await scan(dir);
        return files;
    }

    /**
     * Find all HTML files in directory
     */
    private async findHTMLFiles(dir: string): Promise<string[]> {
        const files: string[] = [];

        async function scan(currentDir: string) {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);

                if (entry.isDirectory()) {
                    await scan(fullPath);
                } else if (entry.isFile() && entry.name.endsWith('.html')) {
                    files.push(fullPath);
                }
            }
        }

        await scan(dir);
        return files;
    }

    /**
     * Get content files for purging
     */
    private async getContentFiles(outDir: string): Promise<string[]> {
        const files: string[] = [];
        const extensions = ['.html', '.js', '.mjs', '.jsx', '.tsx'];

        async function scan(currentDir: string) {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);

                if (entry.isDirectory()) {
                    await scan(fullPath);
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name);
                    if (extensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        }

        await scan(outDir);
        return files;
    }
}
