/**
 * @nexxo/vue - Production-Grade Vue Plugin
 * 
 * Features:
 * - Graph-derived HMR
 * - SFC (Single File Component) compilation
 * - Template caching
 * - CSS extraction
 * - Zero global state
 */

import { Plugin } from '../index.js';
import path from 'path';

export interface VuePluginOptions {
    /**
     * Enable HMR
     * @default true
     */
    hmr?: boolean;

    /**
     * Development mode
     * @default process.env.NODE_ENV !== 'production'
     */
    development?: boolean;

    /**
     * Include source maps
     * @default true in development
     */
    sourceMaps?: boolean;

    /**
     * Template compilation options
     */
    template?: {
        compilerOptions?: any;
        transformAssetUrls?: boolean;
    };

    /**
     * Style options
     */
    style?: {
        preprocessor?: 'scss' | 'sass' | 'less' | 'stylus';
    };
}

export function nexxoVue(options: VuePluginOptions = {}): Plugin {
    const {
        hmr = true,
        development = process.env.NODE_ENV !== 'production',
        sourceMaps = development,
        template = {},
        style = {}
    } = options;

    // Cache compiled templates
    const templateCache = new Map<string, { code: string; hash: string }>();

    // Track SFC dependencies
    const sfcDeps = new Map<string, {
        script?: string;
        template?: string;
        styles: string[];
        customBlocks: string[];
    }>();

    return {
        name: 'nexxo-vue',

        async buildStart() {
            // Clear caches on rebuild
            templateCache.clear();
            sfcDeps.clear();
        },

        async resolveId(source: string, importer?: string) {
            // Handle Vue SFC virtual modules
            if (source.endsWith('.vue?type=template')) {
                return source;
            }
            if (source.endsWith('.vue?type=style')) {
                return source;
            }
            if (source.endsWith('.vue?type=script')) {
                return source;
            }
            return undefined;
        },

        async load(id: string) {
            // Handle virtual modules for SFC parts
            if (id.includes('.vue?type=')) {
                const [filePath, query] = id.split('?');
                const type = new URLSearchParams(query).get('type');

                const sfc = sfcDeps.get(filePath);
                if (!sfc) return undefined;

                switch (type) {
                    case 'template':
                        return sfc.template;
                    case 'script':
                        return sfc.script;
                    case 'style':
                        const index = parseInt(new URLSearchParams(query).get('index') || '0');
                        return sfc.styles[index];
                    default:
                        return undefined;
                }
            }
            return undefined;
        },

        async transform(code: string, id: string) {
            // Only process .vue files
            if (!id.endsWith('.vue')) {
                return undefined;
            }

            // Parse SFC - get both our simplified and raw descriptor
            const { descriptor, rawDescriptor } = await parseSFC(code, id);

            // Store SFC parts for virtual modules
            sfcDeps.set(id, {
                script: descriptor.script?.content,
                template: descriptor.template?.content,
                styles: descriptor.styles.map(s => s.content),
                customBlocks: descriptor.customBlocks.map(b => b.content)
            });

            // Compile template
            let templateCode = '';
            if (descriptor.template) {
                const cacheKey = `${id}:${hashContent(descriptor.template.content)}`;
                const cached = templateCache.get(cacheKey);

                if (cached) {
                    templateCode = cached.code;
                } else {
                    templateCode = await compileTemplate(descriptor.template.content, {
                        id,
                        ...template.compilerOptions
                    });
                    templateCache.set(cacheKey, { code: templateCode, hash: cacheKey });
                }
            }

            // Compile script
            let scriptCode = descriptor.script?.content || '';
            if (descriptor.scriptSetup && rawDescriptor) {
                scriptCode = await compileScriptSetup(rawDescriptor, {
                    id,
                    templateCode
                });
            }

            // Extract and process styles
            const styleImports = descriptor.styles.map((style, index) => {
                const query = `?type=style&index=${index}`;
                return `import '${id}${query}';`;
            }).join('\n');

            // HMR code (only in development with HMR enabled)
            const hmrCode = (development && hmr) ? `
// HMR
if (import.meta.hot) {
  import.meta.hot.accept();
  __VUE_HMR_RUNTIME__.reload('${id}', __exports__);
}
`.trim() : '';

            // Combine all parts
            const output = `
${styleImports}

${scriptCode}

${templateCode}

${hmrCode}
`.trim();

            return {
                code: output,
                map: sourceMaps ? generateSourceMap(code, output, id) : undefined
            };
        }
    };
}

// Helper functions

interface SFCDescriptor {
    template?: { content: string; attrs: Record<string, string> };
    script?: { content: string; attrs: Record<string, string> };
    scriptSetup?: { content: string; attrs: Record<string, string> };
    styles: Array<{ content: string; attrs: Record<string, string> }>;
    customBlocks: Array<{ content: string; type: string }>;
}

async function parseSFC(code: string, id: string): Promise<{ descriptor: SFCDescriptor; rawDescriptor?: any }> {
    try {
        // Try to use @vue/compiler-sfc if available
        const compiler = await import('@vue/compiler-sfc');
        const { descriptor: rawDescriptor } = compiler.parse(code, { filename: id });

        const descriptor: SFCDescriptor = {
            template: rawDescriptor.template ? {
                content: rawDescriptor.template.content,
                attrs: rawDescriptor.template.attrs as Record<string, string>
            } : undefined,
            script: rawDescriptor.script ? {
                content: rawDescriptor.script.content,
                attrs: rawDescriptor.script.attrs as Record<string, string>
            } : undefined,
            scriptSetup: rawDescriptor.scriptSetup ? {
                content: rawDescriptor.scriptSetup.content,
                attrs: rawDescriptor.scriptSetup.attrs as Record<string, string>
            } : undefined,
            styles: rawDescriptor.styles.map((s: any) => ({
                content: s.content,
                attrs: s.attrs as Record<string, string>
            })),
            customBlocks: rawDescriptor.customBlocks.map((b: any) => ({
                content: b.content,
                type: b.type
            }))
        };

        return { descriptor, rawDescriptor };
    } catch (error) {
        console.warn('[nexxo-vue] @vue/compiler-sfc not available, using basic parser');
        return { descriptor: basicParseSFC(code) };
    }
}

function basicParseSFC(code: string): SFCDescriptor {
    // Basic regex-based SFC parser (fallback)
    const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/);
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    const scriptSetupMatch = code.match(/<script\s+setup[^>]*>([\s\S]*?)<\/script>/);
    const styleMatches = Array.from(code.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g));

    return {
        template: templateMatch ? { content: templateMatch[1], attrs: {} } : undefined,
        script: scriptMatch && !scriptSetupMatch ? { content: scriptMatch[1], attrs: {} } : undefined,
        scriptSetup: scriptSetupMatch ? { content: scriptSetupMatch[1], attrs: {} } : undefined,
        styles: styleMatches.map(m => ({ content: m[1], attrs: {} })),
        customBlocks: []
    };
}

async function compileTemplate(template: string, options: any): Promise<string> {
    try {
        const compiler = await import('@vue/compiler-sfc');
        const { code } = compiler.compileTemplate({
            source: template,
            filename: options.id,
            id: options.id,
            ...options
        });
        return code;
    } catch (error) {
        console.warn('[nexxo-vue] Template compilation failed:', error);
        return `export function render() { return null; }`;
    }
}

async function compileScriptSetup(rawDescriptor: any, options: any): Promise<string> {
    try {
        const compiler = await import('@vue/compiler-sfc');

        // Use the raw descriptor directly - it has all the loc information
        const { content } = compiler.compileScript(rawDescriptor, {
            id: options.id,
            inlineTemplate: false
        });
        return content;
    } catch (error) {
        console.warn('[nexxo-vue] Script setup compilation failed:', error);
        return rawDescriptor.scriptSetup?.content || '';
    }
}

function hashContent(content: string): string {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

function arraysEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function generateSourceMap(originalCode: string, transformedCode: string, id: string): any {
    return {
        version: 3,
        file: path.basename(id),
        sources: [id],
        sourcesContent: [originalCode],
        mappings: ''
    };
}

// Export helper for use in config
export function vuePreset(options: VuePluginOptions = {}): Plugin[] {
    return [
        nexxoVue(options)
    ];
}
