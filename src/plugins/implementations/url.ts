/**
 * @nexxo/plugin-url
 * URL/data URI assets
 */

import { PluginAdapter } from '../ported/adapter.js';
import fs from 'fs';
import path from 'path';

export function createUrlPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-url',
        originalPlugin: 'url-loader',
        
        async load(id: string) {
            // Asset loading for url
            const ext = path.extname(id);
            if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'].includes(ext)) {
                return await this.processAsset(id);
            }
            return null;
        },

        async processAsset(id: string): Promise<string> {
            // URL/data URI assets
            const content = fs.readFileSync(id);
            const base64 = content.toString('base64');
            return `export default "data:image/${path.extname(id).slice(1)};base64,${base64}";`;
        }
    };
}

export default createUrlPlugin;
