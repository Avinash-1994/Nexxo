/**
 * @nexxo/plugin-mdx
 * MDX support
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createMdxPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-mdx',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // Utility: MDX support
            return { code };
        }
    };
}

export default createMdxPlugin;
