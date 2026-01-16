/**
 * @nexxo/plugin-meta-tags
 * SEO meta tags
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createMetaTagsPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-meta-tags',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // Utility: SEO meta tags
            return { code };
        }
    };
}

export default createMetaTagsPlugin;
