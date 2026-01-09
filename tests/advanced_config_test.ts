import { startDevServer } from '../src/dev/devServer.js';
import { BuildConfig } from '../src/config/index.js';
import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { rimraf } from 'rimraf';

async function runTest() {
    console.log('🧪 Running Advanced Config Integration Test\n');

    const testDir = path.resolve(process.cwd(), 'test_output_config');
    await rimraf(testDir);
    await fs.mkdir(testDir, { recursive: true });

    // Create .env file
    await fs.writeFile(path.join(testDir, '.env'), 'NEXXO_TEST_VAR=hello\nSECRET=hidden');

    // Create dummy index.html
    await fs.mkdir(path.join(testDir, 'public'), { recursive: true });
    await fs.writeFile(path.join(testDir, 'public', 'index.html'), '<h1>Hello</h1>');

    // Start a dummy upstream server for proxy testing
    const upstreamPort = 8081;
    const upstream = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'proxy_success' }));
    });
    await new Promise<void>(resolve => upstream.listen(upstreamPort, resolve));
    console.log(`Dummy upstream listening on ${upstreamPort}`);

    const config: BuildConfig = {
        root: testDir,
        entry: ['src/main.tsx'],
        mode: 'development',
        outDir: 'dist',
        port: 4000,
        platform: 'browser',
        preset: 'spa',
        server: {
            proxy: {
                '/api': `http://localhost:${upstreamPort}`
            },
            https: true, // This will trigger self-signed cert generation
            headers: {
                'X-Custom-Header': 'test'
            }
        }
    };

    try {
        // Start the dev server
        // We need to run this in a way that doesn't block forever, or we need to fetch from it.
        // startDevServer is async but doesn't return the server instance (void).
        // We can modify startDevServer to return the server, or just assume it starts and fetch.
        // But startDevServer awaits forever? No, it awaits setup and then listens. It returns void.
        // So we can await it, and then the server is running.

        await startDevServer(config);
        console.log('✅ Server started');

        // Check Env Vars
        if (process.env.NEXXO_TEST_VAR === 'hello') {
            console.log('✅ Environment variables loaded');
        } else {
            throw new Error('Environment variables failed to load');
        }

        // Verify HTTPS and Proxy
        // Since we are using self-signed certs, we need to allow insecure
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const fetch = (await import('node-fetch')).default;

        // Check Proxy
        console.log('Testing Proxy...');
        const proxyRes = await fetch('https://localhost:4000/api');
        const proxyData = await proxyRes.json();
        if ((proxyData as any).message === 'proxy_success') {
            console.log('✅ Proxy works');
        } else {
            throw new Error('Proxy failed');
        }

        // Check Headers
        console.log('Testing Headers...');
        const headerRes = await fetch('https://localhost:4000/');
        if (headerRes.headers.get('x-custom-header') === 'test') {
            console.log('✅ Custom headers present');
        } else {
            throw new Error('Custom headers missing');
        }

        // Cleanup
        upstream.close();
        await rimraf(testDir);
        console.log('\n✨ All tests passed!');
        process.exit(0);

    } catch (e) {
        console.error('❌ Test failed:', e);
        process.exit(1);
    }
}

runTest().catch(console.error);
