import { Plugin } from '../index.js';

/**
 * URJA TIER C PLUGINS (Graph-Aware / HMR)
 * 
 * Since Urja v1.0 handles HMR natively via UniversalTransformer for React, Vue, and Svelte,
 * these plugins act as compatibility wrappers or configuration providers.
 * 
 * They ensure that if a user migrates from Vite, they can map existing plugins to these
 * without breaking the build, while Urja's core engine handles the heavy lifting.
 */

interface ReactOptions {
    include?: string | RegExp | (string | RegExp)[];
    exclude?: string | RegExp | (string | RegExp)[];
    fastRefresh?: boolean;
    babel?: any;
}

/**
 * Urja React Plugin
 * Compatible with @vitejs/plugin-react
 */
export function urjaReact(options: ReactOptions = {}): Plugin {
    return {
        name: 'urja-react',
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
 * Urja Vue Plugin
 * Compatible with @vitejs/plugin-vue
 */
export function urjaVue(options: VueOptions = {}): Plugin {
    return {
        name: 'urja-vue',
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
 * Urja Svelte Plugin
 * Compatible with @sveltejs/vite-plugin-svelte
 */
export function urjaSvelte(options: SvelteOptions = {}): Plugin {
    return {
        name: 'urja-svelte',
        setup() {
            // Svelte support is built-in
        }
    };
}

/**
 * Compatibility aliases
 */
export const urjaReactRefresh = urjaReact;
export const urjaVueHmr = urjaVue;
export const urjaSvelteHmr = urjaSvelte;
