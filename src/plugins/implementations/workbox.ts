/**
 * @nexxo/plugin-workbox
 * Service worker generation
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createWorkboxPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-workbox',
        originalPlugin: 'workbox-webpack-plugin',
        
        async transform(code: string, id: string) {
            // Utility: Service worker generation
            return { code };
        }
    };
}

export default createWorkboxPlugin;
