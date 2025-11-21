import { startDevServer } from '../dist/dev/devServer.js';
import http from 'http';
import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';

const PORT = 5999;

async function test() {
    const root = process.cwd();
    const cfg = {
        root,
        entry: [],
        mode: 'development',
        outDir: 'dist',
        port: PORT
    };

    // Start server
    // Note: startDevServer is async but doesn't return the server instance in the current implementation
    // It just listens. We need to modify it to return the server or just rely on it listening.
    // The current implementation: server.listen(port, ...)
    // We can't easily stop it if we don't get the instance.
    // I'll assume it starts and I'll just exit the process to stop it.

    console.log('Starting dev server...');
    // We need to import the TS version if we are running TS? No, we run the built JS.
    // But I just modified src/dev/devServer.ts. I need to build it first!

    // Wait, I can't import from dist if I haven't built.
    // I will run the build command in the test wrapper or before running this.

    try {
        await startDevServer(cfg);
    } catch (e) {
        console.error('Failed to start server:', e);
        process.exit(1);
    }

    // Give it a moment
    await new Promise(r => setTimeout(r, 1000));

    try {
        // Test index.html
        const res1 = await fetch(`http://localhost:${PORT}/`);
        assert.strictEqual(res1.status, 200);
        const html = await res1.text();
        assert.ok(html.includes('<title>NextGen Build Tool'), 'Index.html served');

        // Test main.tsx transformation
        // Use a temp file to avoid overwriting user's main.tsx
        const tempTsx = path.join(root, 'src', 'temp_test.tsx');
        await fs.writeFile(tempTsx, 'import React from "react"; export const App = () => <div>Hello</div>;');

        try {
            const res2 = await fetch(`http://localhost:${PORT}/src/temp_test.tsx`);
            assert.strictEqual(res2.status, 200);
            assert.strictEqual(res2.headers.get('content-type'), 'application/javascript');
            const js = await res2.text();

            console.log('Transformed JS:', js);

            assert.ok(!js.includes('<div>'), 'JSX should be transformed');
            assert.ok(js.includes('React.createElement') || js.includes('jsx'), 'Should contain React.createElement or jsx');
        } finally {
            await fs.unlink(tempTsx).catch(() => { });
        }

        console.log('PASS: Dev server serves transformed files');
        process.exit(0);
    } catch (e) {
        console.error('FAIL:', e);
        process.exit(1);
    }
}

test();
