/**
 * @nexxo/plugin-html
 * HTML generation
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createHtmlPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-html',
        originalPlugin: 'html-webpack-plugin',
        
        async transform(code: string, id: string) {
            // Utility: HTML generation
            return { code };
        }
    };
}

export default createHtmlPlugin;
