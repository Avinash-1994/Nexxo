/**
 * @nexxo/plugin-ssr
 * Universal SSR support
 * Nexxo-native
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createSsrPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-ssr',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // ssr transformation
            if (id.endsWith('.js')) {
                // Add ssr runtime
                const transformed = `
// ssr HMR Runtime
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
            // Resolve ssr imports
            if (source.startsWith('ssr')) {
                return { id: source, external: false };
            }
            return null;
        }
    };
}

export default createSsrPlugin;
