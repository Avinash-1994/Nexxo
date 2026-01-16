/**
 * @nexxo/plugin-robots
 * Robots.txt generation
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createRobotsPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-robots',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // Utility: Robots.txt generation
            return { code };
        }
    };
}

export default createRobotsPlugin;
