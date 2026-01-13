
/**
 * Module 4: Universal SSR - Runtime Test
 * Validates Day 22 Engine Logic (Node/Edge + Streaming)
 */

import { UniversalSSREngine, SSRContext, RenderResult } from '../src/ssr/universal-engine.js';
import { Readable } from 'stream';

// Mock Web Globals if missing (Node environment)
if (typeof Response === 'undefined') {
    (global as any).Response = class Response {
        constructor(public body: any, public init: any) { }
    };
    (global as any).Request = class Request {
        constructor(public url: string, public headers: any) { }
    };
    (global as any).ReadableStream = class ReadableStream {
        constructor(public strategies: any) { }
    };
}

async function runSSRTest() {
    console.log('🧪 Testing Universal SSR Engine...');

    // 1. Setup Mock Adapter (streaming)
    const mockAdapter = async (ctx: SSRContext): Promise<RenderResult> => {
        return {
            stream: UniversalSSREngine.createMockStream(['<head>', '<title>SSR</title>', '</head>', '<body>Hello</body>']),
            statusCode: 200
        };
    };

    const engine = new UniversalSSREngine(mockAdapter);

    // 2. Test Node.js Interface (req/res)
    console.log('  Scenario 1: Node.js Request...');

    // Mock Node Response
    const mockRes = {
        statusCode: 0,
        headers: {} as any,
        chunks: [] as string[],
        setHeader(k: string, v: string) { this.headers[k] = v; },
        write(chunk: any) {
            if (chunk instanceof Uint8Array || Buffer.isBuffer(chunk)) {
                this.chunks.push(new TextDecoder().decode(chunk));
            } else {
                this.chunks.push(chunk.toString());
            }
        },
        end(chunk?: any) { if (chunk) this.chunks.push(chunk.toString()); }
    };

    await engine.handleRequest({ url: '/test', headers: {} }, mockRes);

    // Wait for stream to finish (handleRequest usually finishes when stream pipes? 
    // Actually handleRequest awaits adapter, but piping happens async if not awaited?
    // In our impl, we loop `for await` which awaits the stream. Good.)

    if (mockRes.statusCode !== 200) throw new Error('Status code mismatch');
    const fullBody = mockRes.chunks.join('');
    if (fullBody !== '<head><title>SSR</title></head><body>Hello</body>') {
        throw new Error(`Body mismatch: ${fullBody}`);
    }
    console.log('  ✅ Node.js Streaming Response Verified');


    // 3. Test Web Standard Interface (Request -> Response)
    console.log('  Scenario 2: Edge/Web Request...');
    // We mock Request if needed, but our polyfill above mocks it for TypeScript.
    // However, createMockStream uses TextEncoder. Ensure it exists.
    if (typeof TextEncoder === 'undefined') (global as any).TextEncoder = require('util').TextEncoder;

    const req = new Request('http://localhost/test', { headers: {} });

    const response = await engine.handleRequest(req) as Response;

    if (response.status !== 200) throw new Error('Web Response status mismatch');
    if (!response.body) throw new Error('Web Stream missing');

    // In a real env, we'd read the stream.
    console.log('  ✅ Web/Edge Response Object Verified');


    // 4. Test Mismatch Detection
    console.log('  Scenario 3: Hydration Mismatch...');
    const diffs = UniversalSSREngine.checkMismatch('<div>Server</div>', '<div>Client</div>');
    if (diffs.length === 0) throw new Error('Failed to detect mismatch');
    console.log('  ✅ Mismatch Logic Verified');

    console.log('---------------------------');
    console.log('🎉 Day 22 Universal Runtime Verified!');
}

runSSRTest().catch(e => {
    console.error('❌ SSR Test Failed:', e);
    process.exit(1);
});
