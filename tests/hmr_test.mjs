import { startDevServer } from '../dist/dev/devServer.js';
import http from 'http';
import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';

const PORT = 6001;

async function test() {
    const root = process.cwd();
    const cfg = {
        root,
        entry: [],
        mode: 'development',
        outDir: 'dist',
        port: PORT
    };

    console.log('Starting dev server for HMR test...');
    try {
        await startDevServer(cfg);
    } catch (e) {
        console.error('Failed to start server:', e);
        process.exit(1);
    }

    await new Promise(r => setTimeout(r, 1000));

    try {
        // 1. Check Runtime
        const res1 = await fetch(`http://localhost:${PORT}/@react-refresh`);
        assert.strictEqual(res1.status, 200);
        const runtime = await res1.text();
        assert.ok(runtime.includes('react-refresh'), 'Should contain react-refresh runtime');
        console.log('PASS: Runtime served');

        // 2. Check Component Transformation
        const tempTsx = path.join(root, 'src', 'temp_hmr.tsx');
        await fs.writeFile(tempTsx, 'import React, { useState } from "react"; export const App = () => { const [v] = useState(0); return <div>{v}</div>; };');

        try {
            const res2 = await fetch(`http://localhost:${PORT}/src/temp_hmr.tsx`);
            assert.strictEqual(res2.status, 200);
            const js = await res2.text();

            console.log('Transformed JS:', js);

            assert.ok(js.includes('$RefreshReg$'), 'Should contain $RefreshReg$');
            assert.ok(js.includes('$RefreshSig$'), 'Should contain $RefreshSig$');
            console.log('PASS: Component instrumented');
        } finally {
            await fs.unlink(tempTsx).catch(() => { });
        }

        process.exit(0);
    } catch (e) {
        console.error('FAIL:', e);
        process.exit(1);
    }
}

test();
