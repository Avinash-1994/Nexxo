/**
 * @nexxo/plugin-solid
 * SolidJS support
 * Ported from: vite-plugin-solid
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createSolidPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-solid',
        originalPlugin: 'vite-plugin-solid',
        
        async transform(code: string, id: string) {
            // solid transformation
            if (id.endsWith('.jsx')) {
                // Add solid runtime
                const transformed = `
// solid HMR Runtime
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
            // Resolve solid imports
            if (source.startsWith('solid')) {
                return { id: source, external: false };
            }
            return null;
        }
    };
}

export default createSolidPlugin;
