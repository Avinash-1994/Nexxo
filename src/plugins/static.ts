
import fs from 'fs/promises';
import path from 'path';
import { LunxPlugin } from '../core/plugins/types.js';
import { log } from '../utils/logger.js';

export function createStaticPlugin(rootDir: string, outDir: string): LunxPlugin {
    return {
        manifest: {
            name: 'lunx:static',
            version: '1.0.0',
            engineVersion: '1.0.0',
            type: 'js',
            hooks: ['buildEnd'],
            permissions: { fs: 'read' }
        },
        id: 'lunx:static',
        async runHook(hook, data) {
            if (hook !== 'buildEnd') return data;

            const publicDir = path.join(rootDir, 'public');
            try {
                const stats = await fs.stat(publicDir);
                if (stats.isDirectory()) {
                    log.info(`Copying public directory from ${publicDir} to ${outDir}`);
                    await fs.mkdir(outDir, { recursive: true });
                    await copyDir(publicDir, outDir);
                }
            } catch (e) {
                // Public dir doesn't exist, skip
            }

            return data;
        }
    };
}

async function copyDir(src: string, dest: string) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}
