/**
 * @nexxo/plugin-vercel
 * Vercel deployment adapter
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createVercelPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-vercel',
        originalPlugin: 'nexxo-native',
        
        async buildEnd() {
            console.log('[@nexxo/plugin-vercel] Deployment adapter ready');
            // Generate deployment config
        }
    };
}

export default createVercelPlugin;
