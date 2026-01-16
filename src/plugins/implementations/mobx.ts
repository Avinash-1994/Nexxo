/**
 * @nexxo/plugin-mobx
 * MobX integration
 * Nexxo-native
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createMobxPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-mobx',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // mobx transformation
            if (id.endsWith('.js')) {
                // Add mobx runtime
                const transformed = `
// mobx HMR Runtime
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
            // Resolve mobx imports
            if (source.startsWith('mobx')) {
                return { id: source, external: false };
            }
            return null;
        }
    };
}

export default createMobxPlugin;
