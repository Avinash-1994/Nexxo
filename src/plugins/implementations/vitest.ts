/**
 * @nexxo/plugin-vitest
 * Vitest integration
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createVitestPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-vitest',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // Utility: Vitest integration
            return { code };
        }
    };
}

export default createVitestPlugin;
