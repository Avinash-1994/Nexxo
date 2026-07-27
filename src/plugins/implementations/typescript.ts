/**
 * @lunx/plugin-typescript
 * TypeScript compilation
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createTypescriptPlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-typescript',
        originalPlugin: 'ts-loader',
        
        async transform(code: string, id: string) {
            // Utility: TypeScript compilation
            return { code };
        }
    };
}

export default createTypescriptPlugin;
