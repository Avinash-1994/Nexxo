/**
 * @nexxo/plugin-jest
 * Jest testing framework
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createJestPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-jest',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // Testing: Jest testing framework
            if (id.includes('.test.') || id.includes('.spec.')) {
                // Add test utilities
                return { code };
            }
            return { code };
        }
    };
}

export default createJestPlugin;
