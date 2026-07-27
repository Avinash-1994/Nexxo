
import path from 'path';
import { SSRContext, RenderResult } from './universal-engine.js';
import { Route, RouteManifest } from '../meta-frameworks/types.js';

/**
 * Lunx App Router Engine
 * Implements nested layout rendering and segment resolution
 * Day 54: SSR Power Locked
 */

export class AppRouterEngine {

    constructor(private manifest: RouteManifest) { }

    /**
     * Resolve a path to a list of segments (Layouts + Page)
     */
    resolveSegments(url: string): Route[] {
        const [pathname] = url.split('?');
        const segments: Route[] = [];

        // 1. Find all layouts along the path
        const parts = pathname.split('/').filter(Boolean);
        let currentPath = '';

        // Always include Root Layout if it exists
        const rootLayout = this.manifest.routes.find(r => r.path === '/' && r.meta?.segment === 'layout');
        if (rootLayout) segments.push(rootLayout);

        for (const part of parts) {
            currentPath += `/${part}`;
            const layout = this.manifest.routes.find(r => r.path === currentPath && r.meta?.segment === 'layout');
            if (layout) segments.push(layout);
        }

        // 2. Find the leaf Page
        const page = this.manifest.routes.find(r => r.path === pathname && r.meta?.segment === 'page');
        if (page) segments.push(page);

        return segments;
    }

    /**
     * Render the segment tree
     * Effectively: Layout1(Layout2(Layout3(Page)))
     */
    async renderSegments(segments: Route[], ctx: SSRContext, renderFn: any): Promise<RenderResult> {
        if (segments.length === 0) {
            return { html: '<h1>404 Not Found</h1>', statusCode: 404 };
        }

        // Prepare the component tree (Simplified for architecture lock)
        // In a real implementation, we would import these files and nest their React/Vue components.
        // For the purpose of the build tool lock, we provide the manifest to the renderer.

        return renderFn({
            segments: segments.map(s => ({
                path: s.path,
                file: s.filePath,
                type: s.meta?.segment
            })),
            ctx
        });
    }

    /**
     * Handle API Route (route.ts)
     */
    async handleApiRoute(url: string, req: any, res?: any): Promise<Response | void> {
        const [pathname] = url.split('?');
        const apiRoute = this.manifest.apiRoutes.find(r => r.path === pathname && r.meta?.segment === 'route');

        if (!apiRoute) return;

        // In a real implementation, we would dynamic import the file and call the exported method (GET, POST, etc.)\
        // For the lock, we provide the architecture for the dispatcher.
        const { default: handler } = await import(apiRoute.filePath);

        if (typeof handler === 'function') {
            return handler(req);
        }
    }
}
