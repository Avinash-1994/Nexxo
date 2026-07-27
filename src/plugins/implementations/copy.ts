/**
 * @lunx/plugin-copy
 * Static file copying
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createCopyPlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-copy',
        originalPlugin: 'copy-webpack-plugin',
        
        async transform(code: string, id: string) {
            // Utility: Static file copying
            return { code };
        }
    };
}

export default createCopyPlugin;
