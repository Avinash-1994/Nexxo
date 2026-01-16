/**
 * @nexxo/plugin-md
 * Markdown as components
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createMdPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-md',
        originalPlugin: 'vite-plugin-md',
        
        async transform(code: string, id: string) {
            // Utility: Markdown as components
            return { code };
        }
    };
}

export default createMdPlugin;
