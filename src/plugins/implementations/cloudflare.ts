/**
 * @nexxo/plugin-cloudflare
 * Cloudflare Pages adapter
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createCloudflarePlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-cloudflare',
        originalPlugin: 'nexxo-native',
        
        async buildEnd() {
            console.log('[@nexxo/plugin-cloudflare] Deployment adapter ready');
            // Generate deployment config
        }
    };
}

export default createCloudflarePlugin;
