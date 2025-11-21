import { startDevServer } from '../dist/dev/devServer.js';
import fs from 'fs/promises';
import path from 'path';

const PORT = 6003; // Different port to avoid conflicts

async function test() {
    const root = process.cwd();

    // Create test file BEFORE starting server
    const tempFile = path.join(root, 'src', 'test_static.ts');
    await fs.writeFile(tempFile, 'console.log("Static test file");');
    console.log('Created test file:', tempFile);

    const cfg = {
        root,
        entry: [],
        mode: 'development',
        outDir: 'dist',
        port: PORT
    };

    console.log('Starting dev server...');
    startDevServer(cfg).catch(e => {
        console.error('Server error:', e);
        process.exit(1);
    });

    // Wait for server
    await new Promise(r => setTimeout(r, 3000));

    try {
        console.log('Making request to /src/test_static.ts...');
        const res = await fetch(`http://localhost:${PORT}/src/test_static.ts`);
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response (first 200 chars):', text.substring(0, 200));

        if (res.status === 200) {
            console.log('✅ Server can serve TypeScript files!');
        } else {
            console.log('❌ Got', res.status, 'instead of 200');
        }
    } catch (e) {
        console.error('Request failed:', e.message);
    } finally {
        await fs.unlink(tempFile).catch(() => { });
        process.exit(0);
    }
}

test();
