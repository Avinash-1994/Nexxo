/**
 * @lunx/plugin-pinia
 * Pinia (Vue) integration
 * Lunx-native
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createPiniaPlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-pinia',
        originalPlugin: 'lunx-native',
        
        async transform(code: string, id: string) {
            // pinia transformation
            if (id.endsWith('.js')) {
                // Add pinia runtime
                const transformed = `
// pinia HMR Runtime
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
            // Resolve pinia imports
            if (source.startsWith('pinia')) {
                return { id: source, external: false };
            }
            return null;
        }
    };
}

export default createPiniaPlugin;
