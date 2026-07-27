/**
 * @lunx/plugin-visualizer
 * WebGPU dependency visualizer
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createVisualizerPlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-visualizer',
        originalPlugin: 'lunx-native',
        
        async transform(code: string, id: string) {
            // Utility: WebGPU dependency visualizer
            return { code };
        }
    };
}

export default createVisualizerPlugin;
