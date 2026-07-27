/**
 * @lunx/plugin-storybook
 * Storybook integration
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createStorybookPlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-storybook',
        originalPlugin: 'lunx-native',
        
        async transform(code: string, id: string) {
            // Utility: Storybook integration
            return { code };
        }
    };
}

export default createStorybookPlugin;
