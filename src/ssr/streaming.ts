
import { Readable } from 'stream';
import type { SSRContext, RenderResult } from './universal-engine.js';

/**
 * Lunx Streaming Engine
 * Implements React 18+ Streaming SSR with Progressive Hydration
 * Day 54: SSR Power Locked
 */

export interface StreamingOptions {
    onShellReady?: () => void;
    onShellError?: (error: unknown) => void;
    onAllReady?: () => void;
    onError?: (error: unknown) => void;
    bootstrapScripts?: string[];
    bootstrapModules?: string[];
    namespace?: string;
}

export class LunxStreamingEngine {

    /**
     * Create a Shell-First Stream
     * This allows immediate TTFB while heavy components load
     */
    static createStreamingResponse(
        renderFn: (options: any) => any,
        ctx: SSRContext,
        options: StreamingOptions = {}
    ): Promise<RenderResult> {
        return new Promise((resolve, reject) => {
            let didError = false;
            let caughtError: any = null;

            // React renderToPipeableStream style for Node.js
            const { pipe, abort } = renderFn({
                onShellReady() {
                    options.onShellReady?.();

                    // The shell is ready. We can start the response.
                    const passThrough = new (require('stream').PassThrough)();

                    // Inject hydration script before piping
                    if (ctx.manifest) {
                        passThrough.write(LunxStreamingEngine.getHydrationScript(ctx.manifest));
                    }

                    // Wrap the passThrough to detect errors and finish
                    pipe(passThrough);

                    resolve({
                        stream: passThrough,
                        statusCode: didError ? 500 : 200
                    });
                },
                onShellError(err: any) {
                    didError = true;
                    options.onShellError?.(err);
                    reject(err);
                },
                onAllReady() {
                    options.onAllReady?.();
                },
                onError(err: any) {
                    didError = true;
                    caughtError = err;
                    options.onError?.(err);
                    console.error('Streaming SSR Error:', err);
                },
                bootstrapScripts: options.bootstrapScripts,
                bootstrapModules: options.bootstrapModules
            });

            // Timeout to prevent hanging
            setTimeout(() => {
                abort();
            }, 10000);
        });
    }

    /**
     * Web Standard ReadableStream version (for Edge/Cloudflare)
     */
    static async createWebStreamingResponse(
        renderToReadableStream: any,
        ctx: SSRContext,
        options: any = {}
    ): Promise<RenderResult> {
        try {
            const stream = await renderToReadableStream(options);

            // Wait for shell if required, or return immediately
            // renderToReadableStream returns a promise that resolves when the shell is ready
            return {
                stream,
                statusCode: 200
            };
        } catch (e) {
            console.error('Web Streaming Error:', e);
            return {
                html: '<h1>Streaming Error</h1>',
                statusCode: 500
            };
        }
    }

    /**
     * Inject Progressive Hydration Scripts
     * This allows the client to know which chunks are coming
     */
    static getHydrationScript(manifest: any): string {
        return `<script>window.__LUNX_HYDRATION__ = ${JSON.stringify(manifest)};</script>`;
    }
}
