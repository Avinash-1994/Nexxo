/**
 * @lunx/plugin-trpc
 * tRPC integration
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createTrpcPlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-trpc',
        originalPlugin: 'lunx-native',
        
        async transform(code: string, id: string) {
            // Utility: tRPC integration
            return { code };
        }
    };
}

export default createTrpcPlugin;
