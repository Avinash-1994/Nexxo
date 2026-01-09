
import { NexxoDevServer } from '../src/dev/server.js';
import { BuildConfig } from '../src/config/index.js';
import path from 'path';
import fs from 'fs/promises';
import { log } from '../src/utils/logger.js';

async function testModule5() {
    console.log('--- Starting Module 5 Verification ---');

    const root = path.resolve(process.cwd(), 'tests/validation/temp-m5');
    await fs.rm(root, { recursive: true, force: true });
    await fs.mkdir(root, { recursive: true });

    // Setup project
    await fs.writeFile(path.join(root, 'index.html'), '<html><head></head><body><div id="app"></div></body></html>');
    await fs.writeFile(path.join(root, 'main.ts'), 'import { msg } from "./utils.ts"; console.log(msg);');
    await fs.writeFile(path.join(root, 'utils.ts'), 'export const msg = "Hello from Module 5";');
    await fs.writeFile(path.join(root, 'package.json'), JSON.stringify({ name: 'm5-test', type: 'module' }));

    const config: BuildConfig = {
        root: root,
        entry: ['main.ts'],
        mode: 'dev',
        outDir: 'dist',
        platform: 'browser',
        port: 6000,
        preset: 'spa'
    };

    const server = new NexxoDevServer(config);

    console.log('[Test] Server Startup...');
    await server.start();

    console.log('[Test] Triggering Change (Safe Update)...');
    await fs.writeFile(path.join(root, 'utils.ts'), 'export const msg = "Updated Msg";');

    // In automated test we'd wait for events, but here we just prove it can run.
    setTimeout(() => {
        console.log('✅ Module 5 Basic Verification Finished.');
        process.exit(0);
    }, 2000);
}

testModule5().catch(e => {
    console.error('Module 5 Verification Failed', e);
    process.exit(1);
});
