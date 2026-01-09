import { Plugin } from '../index.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * NEXXO TIER B PLUGINS (IO / ASSETS)
 * 
 * Includes:
 * - nexxoCopy (copy-webpack-plugin)
 * - nexxoHtml (html-webpack-plugin)
 */

export interface CopyTarget {
    src: string;
    dest: string;
}

export interface CopyOptions {
    targets: CopyTarget[];
    verbose?: boolean;
}

/**
 * Copy Plugin (nexxo-copy)
 * Copies files or directories from src to dest at build end.
 */
export function nexxoCopy(options: CopyOptions): Plugin {
    return {
        name: 'nexxo-copy',
        async buildEnd() {
            if (!options.targets || options.targets.length === 0) return;

            for (const target of options.targets) {
                try {
                    // Resolve paths (naive resolution relative to CWD if not absolute)
                    const srcPath = path.isAbsolute(target.src) ? target.src : path.resolve(process.cwd(), target.src);
                    const destPath = path.isAbsolute(target.dest) ? target.dest : path.resolve(process.cwd(), 'dist', target.dest);

                    await fs.cp(srcPath, destPath, { recursive: true, force: true });

                    if (options.verbose) {
                        console.log(`[nexxo-copy] Copied ${target.src} -> ${target.dest}`);
                    }
                } catch (e: any) {
                    console.warn(`[nexxo-copy] Failed to copy ${target.src}: ${e.message}`);
                }
            }
        }
    };
}

export interface HtmlOptions {
    title?: string;
    filename?: string;
    template?: string;
    inject?: boolean;
    templateParameters?: Record<string, string>; // Advanced: Custom data injection
}

/**
 * HTML Plugin (nexxo-html)
 * Generates an index.html file in the output directory.
 * Advanced: Supports variable interpolation (e.g., %PUBLIC_URL%, %TITLE%)
 */
export function nexxoHtml(options: HtmlOptions = {}): Plugin {
    return {
        name: 'nexxo-html',
        stability: 'stable',
        async buildEnd() {
            const filename = options.filename || 'index.html';
            const title = options.title || 'Nexxo App';
            const destPath = path.resolve(process.cwd(), 'dist', filename);

            let content = '';

            if (options.template) {
                try {
                    const templatePath = path.resolve(process.cwd(), options.template);
                    content = await fs.readFile(templatePath, 'utf-8');
                } catch (e) {
                    console.warn(`[nexxo-html] Template not found: ${options.template}`);
                    content = getDefaultHtml(title);
                }
            } else {
                content = getDefaultHtml(title);
            }

            // Advanced: Template Interpolation
            const data: Record<string, string> = {
                PUBLIC_URL: '.',
                TITLE: title,
                ...options.templateParameters
            };

            // Replace %VAR% patterns
            Object.entries(data).forEach(([key, value]) => {
                content = content.replace(new RegExp(`%${key}%`, 'g'), value);
            });

            try {
                await fs.mkdir(path.dirname(destPath), { recursive: true });
                await fs.writeFile(destPath, content);
            } catch (e: any) {
                console.error(`[nexxo-html] Failed to generate HTML: ${e.message}`);
            }
        }
    };
}

function getDefaultHtml(title: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/index.js"></script>
</body>
</html>`;
}
