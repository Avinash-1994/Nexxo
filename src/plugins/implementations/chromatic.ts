/**
 * @lunx/plugin-chromatic
 * Chromatic visual testing
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createChromaticPlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-chromatic',
        originalPlugin: 'lunx-native',
        
        async transform(code: string, id: string) {
            // Utility: Chromatic visual testing
            return { code };
        }
    };
}

export default createChromaticPlugin;
