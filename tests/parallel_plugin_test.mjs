import { startDevServer } from '../dist/dev/devServer.js';
import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';

const PORT = 6002;

async function waitForServer(port, maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const res = await fetch(`http://localhost:${port}/`);
            if (res.status === 200 || res.status === 404) {
                console.log('Server is ready');
                return true;
            }
        } catch (e) {
            console.log(`Waiting for server... attempt ${i + 1}/${maxAttempts}`);
            await new Promise(r => setTimeout(r, 500));
        }
    }
    throw new Error('Server failed to start');
}

async function test() {
    const root = process.cwd();
    const cfg = {
        root,
        entry: [],
        mode: 'development',
        outDir: 'dist',
        port: PORT
    };

    console.log('Starting dev server for Parallel Plugin test...');

    // Start server (non-blocking)
    startDevServer(cfg).catch(e => {
        console.error('Server error:', e);
        process.exit(1);
    });

    // Wait for server to be ready
    await waitForServer(PORT);

    // Give workers time to initialize
    await new Promise(r => setTimeout(r, 2000));

    try {
        // Create a test file
        const tempFile = path.join(root, 'src', 'temp_parallel.ts');
        await fs.writeFile(tempFile, 'console.log("Hello Parallel World");');

        console.log('Test file created, making request...');

        // Request the file
        const res = await fetch(`http://localhost:${PORT}/src/temp_parallel.ts`);
        console.log('Response status:', res.status);

        assert.strictEqual(res.status, 200, 'Server should return 200');
        const js = await res.text();

        console.log('Transformed JS:', js);

        // Check if samplePlugin transformed it (console.log -> console.debug)
        assert.ok(js.includes('console.debug'), 'Should contain console.debug');
        // Note: The plugin adds a comment, but esbuild strips it in the output
        // The comment is preserved in the sourcemap though

        console.log('✅ PASS: Parallel plugin execution works - console.log was transformed to console.debug!');

        // Cleanup and exit
        await fs.unlink(tempFile).catch(() => { });
        process.exit(0);
    } catch (e) {
        console.error('❌ FAIL:', e.message);
        console.error(e);
        process.exit(1);
    }
}

test();

