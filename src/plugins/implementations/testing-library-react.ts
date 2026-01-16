/**
 * @nexxo/plugin-testing-library-react
 * React Testing Library
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createTestingLibraryReactPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-testing-library-react',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // Testing: React Testing Library
            if (id.includes('.test.') || id.includes('.spec.')) {
                // Add test utilities
                return { code };
            }
            return { code };
        }
    };
}

export default createTestingLibraryReactPlugin;
