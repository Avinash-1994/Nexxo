/**
 * @lunx/plugin-vercel
 * Vercel deployment adapter
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createVercelPlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-vercel',
        originalPlugin: 'lunx-native',
        
        async buildEnd() {
            console.log('[@lunx/plugin-vercel] Deployment adapter ready');
            // Generate deployment config
        }
    };
}

export default createVercelPlugin;
