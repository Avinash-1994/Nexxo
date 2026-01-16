/**
 * @nexxo/plugin-trpc
 * tRPC integration
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createTrpcPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-trpc',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // Utility: tRPC integration
            return { code };
        }
    };
}

export default createTrpcPlugin;
