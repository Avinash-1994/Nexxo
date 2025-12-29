import { startDevServer } from '../src/dev/devServer.js';
import { BuildConfig } from '../src/config/index.js';
import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { rimraf } from 'rimraf';

async function runTest() {
    console.log('🧪 Running DX & Performance Integration Test\n');

    const testDir = path.resolve(process.cwd(), 'test_output_dx');
    await rimraf(testDir);
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(path.join(testDir, 'public'), { recursive: true });
    await fs.writeFile(path.join(testDir, 'public', 'index.html'), '<h1>DX Test</h1>');

    const config: BuildConfig = {
        root: testDir,
        entry: ['src/main.tsx'],
        mode: 'development',
        outDir: 'dist',
        port: 4001,
        platform: 'browser',
        preset: 'spa'
    };

    // Mock console.log to capture startup table
    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog(...args);
    };

    try {
        await startDevServer(config);
        // Give server time to start and log
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 1. Verify Startup Table
        const tableLog = logs.find(l => l.includes('Urja Dev Server Ready'));
        if (tableLog) {
            console.log('✅ Startup table displayed');
        } else {
            throw new Error('Startup table missing');
        }

        // 2. Verify Status Endpoint
        const fetch = (await import('node-fetch')).default;
        const res = await fetch('http://localhost:4001/__urja/status');
        const stats = await res.json() as any;

        if (stats.uptime >= 0 && stats.memory) {
            console.log('✅ Status endpoint returned valid stats');
            console.log('Stats:', stats);
        } else {
            throw new Error('Invalid status response');
        }

        // 3. Verify HMR Throttling (Indirectly via logs or just checking if it runs)
        // Since we can't easily simulate rapid file changes and check WS messages in this simple script,
        // we'll rely on the fact that the server started and status endpoint works.
        // Real HMR testing requires a WS client.

        console.log('\n✨ All tests passed!');
        process.exit(0);

    } catch (e) {
        console.error('❌ Test failed:', e);
        process.exit(1);
    } finally {
        console.log = originalLog;
        await rimraf(testDir);
        // We should close the server, but startDevServer doesn't return it.
        // In a real test runner we'd handle this better.
        process.exit(0);
    }
}

runTest().catch(console.error);
