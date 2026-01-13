
/**
 * Module 4: Adapters Test
 * Validates Day 23 React/Vue Integration Logic
 */

import { ReactAdapter, VueAdapter } from '../src/ssr/adapters/index.js';
import { UniversalSSREngine } from '../src/ssr/universal-engine.js';
import { Readable } from 'stream';

async function runAdapterTest() {
    console.log('🧪 Testing SSR Adapters...');

    // 1. Test React Adapter
    console.log('  Scenario 1: React Streaming...');
    const mockReactRender = (app: any, opts: any) => {
        // Simulate React outputting to the pipe
        return {
            pipe: (writable: any) => {
                opts.onShellReady(); // Signal ready
                writable.write('<h1>React</h1>');
                writable.end();
            },
            abort: () => { }
        };
    };

    const reactAdapter = new ReactAdapter(mockReactRender).getAdapter();
    const resultReact = await reactAdapter({ url: '/', headers: {}, manifest: {} });

    // Check Result
    if (!resultReact.stream) throw new Error('React stream missing');
    // Verify stream content
    // Convert Node Readable to string for check
    const chunks = [];
    for await (const chunk of resultReact.stream as any) {
        chunks.push(chunk.toString());
    }
    if (chunks.join('') !== '<h1>React</h1>') throw new Error('React Output Mismatch');
    console.log('  ✅ React Adapter Verified');


    // 2. Test Vue Adapter
    console.log('  Scenario 2: Vue Web Streaming...');
    const mockVueRender = (app: any) => {
        // Return a Web ReadableStream
        return new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode('<h1>Vue</h1>'));
                controller.close();
            }
        });
    };

    const vueAdapter = new VueAdapter(mockVueRender).getAdapter();
    const resultVue = await vueAdapter({ url: '/', headers: {}, manifest: {} });

    if (!resultVue.stream) throw new Error('Vue stream missing');
    if (!(resultVue.stream instanceof ReadableStream)) throw new Error('Vue did not return Web Stream');

    console.log('  ✅ Vue Adapter Verified');

    console.log('---------------------------');
    console.log('🎉 Day 23 Adapters Verified!');
}

runAdapterTest().catch(e => {
    console.error('❌ Adapter Test Failed:', e);
    process.exit(1);
});
