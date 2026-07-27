/**
 * @lunx/plugin-cloudflare
 * Cloudflare Pages adapter
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createCloudflarePlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-cloudflare',
        originalPlugin: 'lunx-native',
        
        async buildEnd() {
            console.log('[@lunx/plugin-cloudflare] Deployment adapter ready');
            // Generate deployment config
        }
    };
}

export default createCloudflarePlugin;
