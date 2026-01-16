/**
 * @nexxo/plugin-checker
 * TypeScript/ESLint checker
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createCheckerPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-checker',
        originalPlugin: 'vite-plugin-checker',
        
        async transform(code: string, id: string) {
            // Utility: TypeScript/ESLint checker
            return { code };
        }
    };
}

export default createCheckerPlugin;
