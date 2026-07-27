/**
 * @lunx/plugin-edge
 * Edge runtime adapter
 * Lunx-native
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createEdgePlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-edge',
        originalPlugin: 'lunx-native',
        
        async transform(code: string, id: string) {
            // edge transformation
            if (id.endsWith('.js')) {
                // Add edge runtime
                const transformed = `
// edge HMR Runtime
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
            // Resolve edge imports
            if (source.startsWith('edge')) {
                return { id: source, external: false };
            }
            return null;
        }
    };
}

export default createEdgePlugin;
