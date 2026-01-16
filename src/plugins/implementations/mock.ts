/**
 * @nexxo/plugin-mock
 * API mocking
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createMockPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-mock',
        originalPlugin: 'vite-plugin-mock',
        
        async transform(code: string, id: string) {
            // Utility: API mocking
            return { code };
        }
    };
}

export default createMockPlugin;
