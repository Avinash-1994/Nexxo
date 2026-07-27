
import { UniversalSSREngine, SSRAdapter } from '../universal-engine.js';

/**
 * Lunx Vercel Edge / Cloudflare Workers Adapter
 * Day 54: SSR Power Locked
 */

export function createEdgeHandler(adapter: SSRAdapter) {
    const engine = new UniversalSSREngine(adapter);

    return async (request: Request) => {
        const response = await engine.handleRequest(request);
        if (response instanceof Response) {
            return response;
        }

        // Fallback for non-standard response
        return new Response('Edge runtime internal error', { status: 500 });
    };
}

/**
 * Cloudflare Workers entry point bridge
 */
export function exportToCloudflare(handler: any) {
    return {
        async fetch(request: Request, env: any, ctx: any) {
            return await handler(request);
        }
    };
}
