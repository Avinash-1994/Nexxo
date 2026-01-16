/**
 * @nexxo/plugin-netlify
 * Netlify deployment adapter
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createNetlifyPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-netlify',
        originalPlugin: 'nexxo-native',
        
        async buildEnd() {
            console.log('[@nexxo/plugin-netlify] Deployment adapter ready');
            // Generate deployment config
        }
    };
}

export default createNetlifyPlugin;
