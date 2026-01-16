/**
 * @nexxo/plugin-style
 * CSS injection
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createStylePlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-style',
        originalPlugin: 'style-loader',
        
        async transform(code: string, id: string) {
            // CSS transformation for style
            if (id.endsWith('.css') || id.endsWith('.scss') || id.endsWith('.sass')) {
                // Process CSS
                const processed = await this.processCSS(code, id);
                return { code: processed };
            }
            return { code };
        },

        async processCSS(code: string, id: string): Promise<string> {
            // CSS injection
            // Add autoprefixer, minification, etc.
            return code;
        }
    };
}

export default createStylePlugin;
