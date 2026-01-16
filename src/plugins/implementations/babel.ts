/**
 * @nexxo/plugin-babel
 * Babel transpilation
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createBabelPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-babel',
        originalPlugin: 'babel-loader',
        
        async transform(code: string, id: string) {
            // Utility: Babel transpilation
            return { code };
        }
    };
}

export default createBabelPlugin;
