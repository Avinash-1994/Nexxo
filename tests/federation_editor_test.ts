import { startDevServer } from '../src/dev/devServer.js';
import { BuildConfig } from '../src/config/index.js';
import http from 'http';
import fetch from 'node-fetch';

async function runTest() {
    console.log('🧪 Running Federation Editor Integration Test\n');

    const config: BuildConfig = {
        root: process.cwd(),
        entry: [],
        mode: 'development',
        outDir: 'dist',
        port: 3005, // Use different port
        platform: 'browser',
        preset: 'spa',
        federation: {
            name: 'app1',
            remotes: { 'remote1': 'http://localhost:3001' },
            shared: { 'react': { singleton: true } }
        }
    };

    // Mock console.log to avoid clutter
    const originalLog = console.log;
    console.log = () => { };

    try {
        // Start Server
        await startDevServer(config);

        // Wait for start
        await new Promise(r => setTimeout(r, 1000));

        // Test Editor Route
        console.log = originalLog;
        console.log('Fetching /__federation...');
        const res = await fetch('http://localhost:3005/__federation');

        if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
        const html = await res.text();

        if (!html.includes('Urja Federation Editor')) throw new Error('Title missing');
        if (!html.includes('remote1')) throw new Error('Remote not listed');
        if (!html.includes('react')) throw new Error('Shared dep not listed');

        console.log('✅ Editor served correctly');
        console.log('\n✨ All tests passed!');
        process.exit(0);

    } catch (e) {
        console.log = originalLog;
        console.error('❌ Test failed:', e);
        process.exit(1);
    }
}

runTest().catch(console.error);
