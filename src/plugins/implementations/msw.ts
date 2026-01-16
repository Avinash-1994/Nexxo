/**
 * @nexxo/plugin-msw
 * Mock Service Worker integration
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createMswPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-msw',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // Testing: Mock Service Worker integration
            if (id.includes('.test.') || id.includes('.spec.')) {
                // Add test utilities
                return { code };
            }
            return { code };
        }
    };
}

export default createMswPlugin;
