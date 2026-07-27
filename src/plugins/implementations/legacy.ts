/**
 * @lunx/plugin-legacy
 * Legacy browser support
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createLegacyPlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-legacy',
        originalPlugin: '@vitejs/plugin-legacy',
        
        async transform(code: string, id: string) {
            // Utility: Legacy browser support
            return { code };
        }
    };
}

export default createLegacyPlugin;
