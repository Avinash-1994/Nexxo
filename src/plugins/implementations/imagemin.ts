/**
 * @nexxo/plugin-imagemin
 * Image optimization
 */

import { PluginAdapter } from '../ported/adapter.js';
import fs from 'fs';
import path from 'path';

export function createImageminPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-imagemin',
        originalPlugin: 'vite-plugin-imagemin',
        
        async load(id: string) {
            // Asset loading for imagemin
            const ext = path.extname(id);
            if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'].includes(ext)) {
                return await this.processAsset(id);
            }
            return null;
        },

        async processAsset(id: string): Promise<string> {
            // Image optimization
            const content = fs.readFileSync(id);
            const base64 = content.toString('base64');
            return `export default "data:image/${path.extname(id).slice(1)};base64,${base64}";`;
        }
    };
}

export default createImageminPlugin;
