/**
 * @nexxo/plugin-pages
 * File-based routing
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createPagesPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-pages',
        originalPlugin: 'vite-plugin-pages',
        
        async transform(code: string, id: string) {
            // Utility: File-based routing
            return { code };
        }
    };
}

export default createPagesPlugin;
