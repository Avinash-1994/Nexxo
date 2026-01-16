/**
 * @nexxo/plugin-inspect
 * Plugin inspection tool
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createInspectPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-inspect',
        originalPlugin: 'vite-plugin-inspect',
        
        async transform(code: string, id: string) {
            // Utility: Plugin inspection tool
            return { code };
        }
    };
}

export default createInspectPlugin;
