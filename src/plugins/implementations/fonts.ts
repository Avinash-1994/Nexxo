/**
 * @nexxo/plugin-fonts
 * Web font optimization
 */

import { PluginAdapter } from '../ported/adapter.js';
import fs from 'fs';
import path from 'path';

export function createFontsPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-fonts',
        originalPlugin: 'vite-plugin-fonts',
        
        async load(id: string) {
            // Asset loading for fonts
            const ext = path.extname(id);
            if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'].includes(ext)) {
                return await this.processAsset(id);
            }
            return null;
        },

        async processAsset(id: string): Promise<string> {
            // Web font optimization
            const content = fs.readFileSync(id);
            const base64 = content.toString('base64');
            return `export default "data:image/${path.extname(id).slice(1)};base64,${base64}";`;
        }
    };
}

export default createFontsPlugin;
