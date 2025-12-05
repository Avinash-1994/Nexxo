import { FederationDev } from '../src/dev/federation-dev.js';
import { BuildConfig } from '../src/config/index.js';
import http from 'http';

async function runTest() {
    console.log('🧪 Running Federation Dev Integration Test\n');

    // Mock Config
    const config: BuildConfig = {
        root: process.cwd(),
        entry: [],
        mode: 'development',
        outDir: 'dist',
        port: 3000,
        platform: 'browser',
        preset: 'spa',
        federation: {
            name: 'app1',
            remotes: {
                'remote1': 'http://localhost:3001'
            },
            mock: true
        }
    };

    // Mock Broadcast
    let broadcastMsg: string | null = null;
    const broadcast = (msg: string) => {
        broadcastMsg = msg;
    };

    const dev = new FederationDev(config, broadcast);

    try {
        // Test 1: Mock Endpoint
        console.log('Test 1: Mock Endpoint');
        const req = { url: '/__mock/remote1/Button' } as http.IncomingMessage;
        const res = {
            writeHead: (status: number, headers: any) => {
                if (status !== 200) throw new Error('Expected 200 OK');
            },
            end: (body: string) => {
                if (!body.includes('Mock: Button')) throw new Error('Expected mock body');
                console.log('✅ Mock response verified');
            }
        } as http.ServerResponse;

        if (!dev.handleRequest(req, res)) {
            throw new Error('Mock request not handled');
        }

        // Test 2: Hot Federation (Polling)
        console.log('\nTest 2: Hot Federation');

        // Mock global fetch
        let fetchCount = 0;
        global.fetch = async (url: RequestInfo | URL) => {
            fetchCount++;
            const urlStr = url.toString();
            if (urlStr.includes('remoteEntry.json')) {
                // Return different hash on second call
                const hash = fetchCount > 1 ? 'hash2' : 'hash1';
                return {
                    ok: true,
                    json: async () => ({ manifestHash: hash })
                } as Response;
            }
            return { ok: false } as Response;
        };

        dev.start();

        // Wait for polling (interval is 2000ms)
        // We'll manually trigger checkRemotes to speed up test if possible, 
        // but since it's private, we wait or use any cast.

        console.log('Waiting for polling...');
        // Force check immediately
        await (dev as any).checkRemotes(); // hash1

        if (broadcastMsg) throw new Error('Should not broadcast on first check');

        await (dev as any).checkRemotes(); // hash2 -> should broadcast

        if (broadcastMsg && (broadcastMsg as string).includes('federation-update') && (broadcastMsg as string).includes('remote1')) {
            console.log('✅ Hot update broadcast verified');
        } else {
            throw new Error('Hot update not broadcast');
        }

        dev.stop();
        console.log('\n✨ All tests passed!');
        process.exit(0);

    } catch (e) {
        console.error('❌ Test failed:', e);
        if (dev) dev.stop();
        process.exit(1);
    }
}

runTest().catch(e => {
    console.error('Unhandled error:', e);
    process.exit(1);
});
