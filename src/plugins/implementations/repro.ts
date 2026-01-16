/**
 * @nexxo/plugin-repro
 * Reproduction case generator
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createReproPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-repro',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // Utility: Reproduction case generator
            return { code };
        }
    };
}

export default createReproPlugin;
