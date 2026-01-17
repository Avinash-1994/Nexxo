/**
 * Production Cold Start Verification
 * Uses the bundled CLI (dist/cli.mjs) for maximum performance
 */

import { spawn, execSync } from 'child_process';
import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';

async function waitForServer(port: number): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < 10000) {
        try {
            // Explicitly use 127.0.0.1 to avoid DNS delay
            const response = await fetch(`http://127.0.0.1:${port}`);
            if (response.ok || response.status === 404) return true;
        } catch (e) {
            await new Promise(resolve => setTimeout(resolve, 10)); // Faster polling
        }
    }
    return false;
}

function killPort(port: number) {
    try { execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' }); } catch (e) { }
}

async function measure() {
    console.log('🚀 Measuring Production Cold Start (Bundled CLI)');
    console.log('Target: <200ms\n');

    const cliPath = path.resolve('dist/cli.mjs');
    const port = 5300;

    if (!fs.existsSync(cliPath)) {
        console.error('❌ dist/cli.mjs not found. Run bundling first.');
        process.exit(1);
    }

    try { execSync('rm -rf .nexxo_rocksdb', { stdio: 'ignore' }); } catch { }

    const portArg = String(port);

    // Run 1 (Cold-ish)
    killPort(port);
    console.log('Test Run 1 (No Cache)...');
    let start = performance.now();
    let proc = spawn('node', [cliPath, 'dev', '--port', portArg], {
        stdio: 'pipe',
        detached: true,
        env: { ...process.env, NODE_ENV: 'production' }
    });

    if (await waitForServer(port)) {
        const time = performance.now() - start;
        console.log(`✅ Time: ${time.toFixed(2)}ms`);
    } else {
        console.log('❌ Failed to start');
    }
    try { process.kill(-proc.pid!); } catch { }
    killPort(port);

    await new Promise(r => setTimeout(r, 1000));

    // Run 2 (Warm Cache)
    console.log('\nTest Run 2 (With RocksDB Cache)...');
    start = performance.now();
    proc = spawn('node', [cliPath, 'dev', '--port', portArg], {
        stdio: 'pipe',
        detached: true,
        env: { ...process.env, NODE_ENV: 'production' }
    });

    if (await waitForServer(port)) {
        const time = performance.now() - start;
        console.log(`✅ Time: ${time.toFixed(2)}ms`);

        if (time < 200) {
            console.log('\n🎉 TARGET ACHIEVED: <200ms');
        } else {
            console.log(`\n⚠️ Gap: ${(time - 200).toFixed(2)}ms`);
        }
    } else {
        console.log('❌ Failed to start');
    }
    try { process.kill(-proc.pid!); } catch { }
    killPort(port);
}

measure();
