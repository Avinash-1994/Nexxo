/**
 * @lunx/plugin-apollo
 * Apollo Client integration
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createApolloPlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-apollo',
        originalPlugin: 'lunx-native',
        
        async transform(code: string, id: string) {
            // Utility: Apollo Client integration
            return { code };
        }
    };
}

export default createApolloPlugin;
