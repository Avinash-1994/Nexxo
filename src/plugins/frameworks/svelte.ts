/**
 * @urja/svelte - Production-Grade Svelte Plugin
 * 
 * Features:
 * - Svelte component compilation
 * - HMR support
 * - CSS extraction
 * - Preprocessor support
 * - Zero global state
 */

import { Plugin } from '../index.js';
import path from 'path';

export interface SveltePluginOptions {
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
     * Svelte compiler options
     */
    compilerOptions?: {
        dev?: boolean;
        css?: boolean;
        hydratable?: boolean;
        customElement?: boolean;
    };

    /**
     * Preprocessor options
     */
    preprocess?: any;
}

export function urjaSvelte(options: SveltePluginOptions = {}): Plugin {
    const {
        hmr = true,
        development = process.env.NODE_ENV !== 'production',
        sourceMaps = development,
        compilerOptions = {},
        preprocess
    } = options;

    // Cache compiled components
    const componentCache = new Map<string, { code: string; css: string; hash: string }>();

    return {
        name: 'urja-svelte',

        async buildStart() {
            // Clear cache on rebuild
            componentCache.clear();
        },

        async transform(code: string, id: string) {
            // Only process .svelte files
            if (!id.endsWith('.svelte')) {
                return undefined;
            }

            // Check cache
            const cacheKey = `${id}:${hashContent(code)}`;
            const cached = componentCache.get(cacheKey);

            if (cached) {
                return {
                    code: cached.code,
                    map: sourceMaps ? generateSourceMap(code, cached.code, id) : undefined
                };
            }

            // Compile Svelte component
            const compiled = await compileSvelte(code, {
                filename: id,
                dev: development,
                css: 'external', // Svelte 5 API: 'external' instead of false
                hydratable: false,
                ...compilerOptions
            }, preprocess);

            if (!compiled) {
                return undefined;
            }

            // Generate output with HMR
            const hmrCode = (development && hmr) ? `
// Svelte HMR
if (import.meta.hot) {
  import.meta.hot.accept();
  
  if (import.meta.hot.data.component) {
    // Preserve component state
    const state = import.meta.hot.data.component.$capture_state();
    component = new Component({ target: import.meta.hot.data.target, props: import.meta.hot.data.props });
    component.$inject_state(state);
  }
  
  import.meta.hot.dispose(() => {
    if (component) {
      import.meta.hot.data.component = component;
      import.meta.hot.data.target = component.$$.ctx[0];
      import.meta.hot.data.props = component.$$.props;
    }
  });
}
`.trim() : '';

            const output = `
${compiled.js.code}

${compiled.css.code ? `
// Inject CSS
const style = document.createElement('style');
style.textContent = ${JSON.stringify(compiled.css.code)};
document.head.appendChild(style);
` : ''}

${hmrCode}

export default Component;
`.trim();

            // Cache result
            componentCache.set(cacheKey, {
                code: output,
                css: compiled.css.code || '',
                hash: cacheKey
            });

            return {
                code: output,
                map: sourceMaps ? compiled.js.map : undefined
            };
        }
    };
}

// Helper functions

async function compileSvelte(
    source: string,
    options: any,
    preprocess?: any
): Promise<{ js: { code: string; map?: any }; css: { code: string } } | null> {
    try {
        // Try to use svelte/compiler if available
        const svelte = await import('svelte/compiler');

        let code = source;

        // Run preprocessor if provided
        if (preprocess) {
            const preprocessed = await svelte.preprocess(source, preprocess, {
                filename: options.filename
            });
            code = preprocessed.code;
        }

        // Compile component
        const result = svelte.compile(code, options);

        return {
            js: result.js,
            css: result.css || { code: '' }
        };
    } catch (error) {
        console.warn('[urja-svelte] Compilation failed:', error);
        return null;
    }
}

function hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
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
export function sveltePreset(options: SveltePluginOptions = {}): Plugin[] {
    return [
        urjaSvelte(options)
    ];
}
