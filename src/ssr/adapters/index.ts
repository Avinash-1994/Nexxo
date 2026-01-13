
/**
 * Nexxo SSR Adapters
 * Connects Universal Engine to React 19 / Vue 3
 * Day 23: Framework-Agnostic SSR Lock
 */

import { SSRAdapter, SSRContext, RenderResult } from '../universal-engine.js';
import { Readable } from 'stream';

// --- Types for mocked framework APIs ---
type ReactRenderToPipeableStream = (app: any, options: any) => { pipe: (res: any) => void, abort: () => void };
type VueRenderToWebStream = (app: any) => ReadableStream;

// --- Registry ---
export const adapters: Record<string, SSRAdapter> = {};

// --- React Adapter (v19 Streaming) ---
export class ReactAdapter {
    constructor(private renderFn: ReactRenderToPipeableStream) { }

    getAdapter(): SSRAdapter {
        return async (ctx: SSRContext): Promise<RenderResult> => {
            // In a real app, we'd import the App component based on ctx.url
            // Here we assume it's passed or loaded.
            const App = { type: 'div', props: { children: 'React App' } }; // Mock Component

            // We need to bridge React's PipeableStream (Node specific usually) 
            // to our Universal format.
            // React 19 supports Web Streams too, but renderToPipeableStream is standard for Node.

            // Create a PassThrough stream to capture output
            // But UniversalEngine expetcs 'stream' to be Readable or ReadableStream.

            // For Node.js Env:
            const { PassThrough } = await import('stream');
            const stream = new PassThrough();

            const { pipe, abort } = this.renderFn(App, {
                onShellReady() {
                    // ready to pipe
                },
                onError(err: any) {
                    console.error('React SSR Error', err);
                }
            });

            pipe(stream);

            return {
                stream, // Node Readable
                statusCode: 200,
                head: '<meta name="generator" content="Nexxo React">'
            };
        };
    }
}

// --- Vue Adapter (v3 Streaming) ---
export class VueAdapter {
    constructor(private renderFn: VueRenderToWebStream) { }

    getAdapter(): SSRAdapter {
        return async (ctx: SSRContext): Promise<RenderResult> => {
            const App = { template: '<div>Vue App</div>' };

            const stream = this.renderFn(App); // Returns ReadableStream (Web)

            return {
                stream, // Web ReadableStream
                statusCode: 200
            };
        };
    }
}
