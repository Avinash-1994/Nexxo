/**
 * @nexxo/plugin-vue
 * Vue 3 SFC support
 * Ported from: @vitejs/plugin-vue
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createVuePlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-vue',
        originalPlugin: '@vitejs/plugin-vue',
        
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

export default createVuePlugin;
