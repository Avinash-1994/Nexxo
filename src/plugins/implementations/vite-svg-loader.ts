/**
 * vite-svg-loader
 * SVG as React components
 */

import { PluginAdapter } from '../ported/adapter.js';
import fs from 'fs';
import path from 'path';

export function createViteSvgLoaderPlugin(): PluginAdapter {
    return {
        name: 'vite-svg-loader',
        originalPlugin: 'vite-svg-loader',
        
        async load(id: string) {
            // Asset loading for vite-svg-loader
            const ext = path.extname(id);
            if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'].includes(ext)) {
                return await this.processAsset(id);
            }
            return null;
        },

        async processAsset(id: string): Promise<string> {
            // SVG as React components
            const content = fs.readFileSync(id);
            const base64 = content.toString('base64');
            return `export default "data:image/${path.extname(id).slice(1)};base64,${base64}";`;
        }
    };
}

export default createViteSvgLoaderPlugin;
