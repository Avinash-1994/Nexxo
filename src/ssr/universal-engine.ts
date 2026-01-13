
/**
 * Nexxo Universal SSR Runtime
 * Framework-Agnostic, Environment-Agnostic Dispatcher
 * Day 22: Universal SSR Runtime Lock
 */

import { Readable } from 'stream';

export type SSRContext = {
    url: string;
    manifest: any; // Build manifest
    headers: Record<string, string>;
};

export type RenderResult = {
    html?: string;
    stream?: ReadableStream | NodeJS.ReadableStream;
    head?: string;
    statusCode?: number;
};

export type SSRAdapter = (ctx: SSRContext) => Promise<RenderResult>;

// Optimization: Shared TextEncoder
const encoder = new TextEncoder();

export class UniversalSSREngine {

    constructor(private adapter: SSRAdapter) { }

    /**
     * Universal Request Handler
     * Normalize Node/Edge/Bun requests into a common Context
     */
    async handleRequest(req: any, res?: any): Promise<Response | void> {
        let context: SSRContext;

        // 1. Detect Environment & Normalize 
        if (req instanceof Request) {
            // Web Standard (Edge/Bun)
            context = {
                url: req.url,
                manifest: {},
                headers: Object.fromEntries(req.headers.entries())
            };
        } else {
            // Node.js (IncomingMessage)
            context = {
                url: req.url || '/',
                manifest: {},
                headers: req.headers
            };
        }

        try {
            // 2. Render
            const result = await this.adapter(context);

            // 3. Send Response
            if (res && res.write) {
                // Node.js Response
                res.statusCode = result.statusCode || 200;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');

                if (result.stream) {
                    // Pipe Stream
                    if (Symbol.asyncIterator in result.stream) {
                        // Web Stream or modern Node Stream
                        if (result.stream instanceof Readable) {
                            result.stream.pipe(res);
                        } else {
                            // ReadableStream -> Node Writable
                            for await (const chunk of (result.stream as any)) {
                                res.write(chunk);
                            }
                            res.end();
                        }
                    }
                } else if (result.html) {
                    res.end(result.html);
                } else {
                    res.end('');
                }
            } else {
                // Web Standard Response
                if (result.stream) {
                    return new Response(result.stream as ReadableStream, {
                        headers: { 'Content-Type': 'text/html; charset=utf-8' },
                        status: result.statusCode || 200
                    });
                }
                return new Response(result.html || '', {
                    headers: { 'Content-Type': 'text/html; charset=utf-8' },
                    status: result.statusCode || 200
                });
            }

        } catch (e: any) {
            console.error('SSR Error:', e);
            if (res && res.end) {
                res.statusCode = 500;
                res.end('<h1>500 Internal Server Error</h1>');
            } else {
                return new Response('Error', { status: 500 });
            }
        }
    }

    /**
     * Create a Mock Stream for testing
     * Simulates React Suspense Streaming
     */
    static createMockStream(chunks: string[]): ReadableStream {
        let i = 0;
        return new ReadableStream({
            async pull(controller) {
                if (i < chunks.length) {
                    // Simulate delay
                    await new Promise(r => setTimeout(r, 10));
                    controller.enqueue(encoder.encode(chunks[i]));
                    i++;
                } else {
                    controller.close();
                }
            }
        });
    }

    /**
     * Hydration Mismatch Detector
     * Simplified diff for performance
     */
    static checkMismatch(serverHtml: string, clientHtml: string): string[] {
        if (serverHtml.trim() !== clientHtml.trim()) {
            return ['Mismatch Detected: DOM Structure or Text differs'];
        }
        return [];
    }
}
