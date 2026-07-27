/**
 * @lunx/plugin-relay
 * Relay integration
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createRelayPlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-relay',
        originalPlugin: 'lunx-native',
        
        async transform(code: string, id: string) {
            // Utility: Relay integration
            return { code };
        }
    };
}

export default createRelayPlugin;
