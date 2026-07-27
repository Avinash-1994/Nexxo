/**
 * @lunx/plugin-inspect
 * Plugin inspection tool
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createInspectPlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-inspect',
        originalPlugin: 'vite-plugin-inspect',
        
        async transform(code: string, id: string) {
            // Utility: Plugin inspection tool
            return { code };
        }
    };
}

export default createInspectPlugin;
