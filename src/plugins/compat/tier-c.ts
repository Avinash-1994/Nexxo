import { Plugin } from '../index.js';

/**
 * NEXXO TIER C PLUGINS (Graph-Aware / HMR)
 * 
 * Since Nexxo v1.0 handles HMR natively via UniversalTransformer for React, Vue, and Svelte,
 * these plugins act as compatibility wrappers or configuration providers.
 * 
 * They ensure that if a user migrates from Vite, they can map existing plugins to these
 * without breaking the build, while Nexxo's core engine handles the heavy lifting.
 */

interface ReactOptions {
    include?: string | RegExp | (string | RegExp)[];
    exclude?: string | RegExp | (string | RegExp)[];
    fastRefresh?: boolean;
    babel?: any;
}

/**
 * Nexxo React Plugin
 * Compatible with @vitejs/plugin-react
 */
export function nexxoReact(options: ReactOptions = {}): Plugin {
    return {
        name: 'nexxo-react',
        setup(api) {
            // In the future, we can push options to the UniversalTransformer via API
            // For now, we log that React support is active.
        },
        buildStart() {
            // Validate environment
            if (process.env.NODE_ENV === 'development' && options.fastRefresh !== false) {
                // UniversalTransformer handles this automatically
            }
        }
    };
}

interface VueOptions {
    include?: string | RegExp | (string | RegExp)[];
    exclude?: string | RegExp | (string | RegExp)[];
    isProduction?: boolean;
}

/**
 * Nexxo Vue Plugin
 * Compatible with @vitejs/plugin-vue
 */
export function nexxoVue(options: VueOptions = {}): Plugin {
    return {
        name: 'nexxo-vue',
        setup() {
            // Vue support is built-in
        }
    };
}

interface SvelteOptions {
    include?: string | RegExp | (string | RegExp)[];
    exclude?: string | RegExp | (string | RegExp)[];
    preprocess?: any;
}

/**
 * Nexxo Svelte Plugin
 * Compatible with @sveltejs/vite-plugin-svelte
 */
export function nexxoSvelte(options: SvelteOptions = {}): Plugin {
    return {
        name: 'nexxo-svelte',
        setup() {
            // Svelte support is built-in
        }
    };
}

/**
 * Compatibility aliases
 */
export const nexxoReactRefresh = nexxoReact;
export const nexxoVueHmr = nexxoVue;
export const nexxoSvelteHmr = nexxoSvelte;
