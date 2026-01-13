
/**
 * Nexxo Edge Adapters
 * Wrappers for Cloudflare Workers, Vercel Edge, & Netlify Edge
 * Day 24: Edge Runtime Support Lock
 */

import { UniversalSSREngine, SSRAdapter } from '../universal-engine.js';

/**
 * Cloudflare Worker Entry Generator
 * Usage: import { createCloudflareHandler } from 'nexxo/edge';
 * export default createCloudflareHandler(myAdapter);
 */
export function createCloudflareHandler(adapter: SSRAdapter) {
    const engine = new UniversalSSREngine(adapter);

    return {
        async fetch(request: Request, env: any, ctx: any): Promise<Response> {
            const response = await engine.handleRequest(request);
            if (!response) return new Response('Not Found', { status: 404 });
            return response;
        }
    };
}

/**
 * Vercel Edge Function Entry Generator
 * Usage: export default createVercelHandler(myAdapter);
 */
export function createVercelHandler(adapter: SSRAdapter) {
    const engine = new UniversalSSREngine(adapter);

    return async function (request: Request): Promise<Response> {
        const response = await engine.handleRequest(request);
        if (!response) return new Response('Not Found', { status: 404 });
        return response;
    };
}

/**
 * Netlify Edge Function Entry Generator
 * Usage: export default createNetlifyHandler(myAdapter);
 */
export function createNetlifyHandler(adapter: SSRAdapter) {
    const engine = new UniversalSSREngine(adapter);

    return async function (request: Request, context: any): Promise<Response> {
        const response = await engine.handleRequest(request);
        if (!response) return new Response('Not Found', { status: 404 });
        return response;
    };
}
