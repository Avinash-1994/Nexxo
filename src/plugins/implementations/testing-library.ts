/**
 * @lunx/plugin-testing-library
 * Testing Library integration
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createTestingLibraryPlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-testing-library',
        originalPlugin: 'lunx-native',
        
        async transform(code: string, id: string) {
            // Utility: Testing Library integration
            return { code };
        }
    };
}

export default createTestingLibraryPlugin;
