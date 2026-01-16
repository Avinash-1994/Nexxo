/**
 * @nexxo/plugin-react
 * React support with Fast Refresh
 * Ported from: @vitejs/plugin-react
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createReactPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-react',
        originalPlugin: '@vitejs/plugin-react',
        
        async transform(code: string, id: string) {
            // react transformation
            if (id.endsWith('.jsx')) {
                // Add react runtime
                const transformed = `
// react HMR Runtime
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
            // Resolve react imports
            if (source.startsWith('react')) {
                return { id: source, external: false };
            }
            return null;
        }
    };
}

export default createReactPlugin;
