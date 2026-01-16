/**
 * @nexxo/plugin-graphql
 * GraphQL integration
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createGraphqlPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-graphql',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // Utility: GraphQL integration
            return { code };
        }
    };
}

export default createGraphqlPlugin;
