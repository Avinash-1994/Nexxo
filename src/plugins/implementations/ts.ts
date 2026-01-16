/**
 * @nexxo/plugin-ts
 * TypeScript compilation
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createTsPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-ts',
        originalPlugin: 'ts-loader',
        
        async transform(code: string, id: string) {
            // Utility: TypeScript compilation
            return { code };
        }
    };
}

export default createTsPlugin;
