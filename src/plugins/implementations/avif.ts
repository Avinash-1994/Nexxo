/**
 * @nexxo/plugin-avif
 * AVIF image support
 */

import { PluginAdapter } from '../ported/adapter.js';
import fs from 'fs';
import path from 'path';

export function createAvifPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-avif',
        originalPlugin: 'nexxo-native',
        
        async load(id: string) {
            // Asset loading for avif
            const ext = path.extname(id);
            if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'].includes(ext)) {
                return await this.processAsset(id);
            }
            return null;
        },

        async processAsset(id: string): Promise<string> {
            // AVIF image support
            const content = fs.readFileSync(id);
            const base64 = content.toString('base64');
            return `export default "data:image/${path.extname(id).slice(1)};base64,${base64}";`;
        }
    };
}

export default createAvifPlugin;
