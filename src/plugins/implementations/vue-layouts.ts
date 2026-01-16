/**
 * @nexxo/plugin-vue-layouts
 * Vue layout system
 * Ported from: vite-plugin-vue-layouts
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createVueLayoutsPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-vue-layouts',
        originalPlugin: 'vite-plugin-vue-layouts',
        
        async transform(code: string, id: string) {
            // vue transformation
            if (id.endsWith('.vue')) {
                // Add vue runtime
                const transformed = `
// vue HMR Runtime
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
            // Resolve vue imports
            if (source.startsWith('vue')) {
                return { id: source, external: false };
            }
            return null;
        }
    };
}

export default createVueLayoutsPlugin;
