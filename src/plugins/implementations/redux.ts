/**
 * @nexxo/plugin-redux
 * Redux integration
 * Nexxo-native
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createReduxPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-redux',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // redux transformation
            if (id.endsWith('.js')) {
                // Add redux runtime
                const transformed = `
// redux HMR Runtime
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
            // Resolve redux imports
            if (source.startsWith('redux')) {
                return { id: source, external: false };
            }
            return null;
        }
    };
}

export default createReduxPlugin;
