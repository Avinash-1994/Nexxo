/**
 * @nexxo/plugin-unocss
 * UnoCSS integration
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createUnocssPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-unocss',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // CSS transformation for unocss
            if (id.endsWith('.css') || id.endsWith('.scss') || id.endsWith('.sass')) {
                // Process CSS
                const processed = await this.processCSS(code, id);
                return { code: processed };
            }
            return { code };
        },

        async processCSS(code: string, id: string): Promise<string> {
            // UnoCSS integration
            // Add autoprefixer, minification, etc.
            return code;
        }
    };
}

export default createUnocssPlugin;
