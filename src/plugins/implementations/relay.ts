/**
 * @nexxo/plugin-relay
 * Relay integration
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createRelayPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-relay',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // Utility: Relay integration
            return { code };
        }
    };
}

export default createRelayPlugin;
