/**
 * @lunx/plugin-cypress
 * Cypress integration
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createCypressPlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-cypress',
        originalPlugin: 'lunx-native',
        
        async transform(code: string, id: string) {
            // Utility: Cypress integration
            return { code };
        }
    };
}

export default createCypressPlugin;
