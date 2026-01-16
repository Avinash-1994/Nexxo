/**
 * @nexxo/plugin-svelte
 * Svelte component support
 * Ported from: vite-plugin-svelte
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createSveltePlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-svelte',
        originalPlugin: 'vite-plugin-svelte',
        
        async transform(code: string, id: string) {
            // svelte transformation
            if (id.endsWith('.svelte')) {
                // Add svelte runtime
                const transformed = `
// svelte HMR Runtime
if (import.meta.hot) {
    import.meta.hot.accept();
}

${code}
                `;
                return { code: transformed };
            }
            return { code };
        },

        async resolveId(source: string) {
            // Resolve svelte imports
            if (source.startsWith('svelte')) {
                return { id: source, external: false };
            }
            return null;
        }
    };
}

export default createSveltePlugin;
