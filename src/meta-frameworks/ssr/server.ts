/**
 * SSR Server Runtime
 * Universal server-side rendering for Next.js, Nuxt, and Remix
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { Route, RouteMatch } from '../types.js';
import { NextJsRouter } from '../nextjs/router.js';
import { NuxtRouter } from '../nuxt/router.js';
import { RemixRouter } from '../remix/router.js';
import { log } from '../../utils/logger.js';
import { ReactSSRRenderer } from './react-renderer.js';
import { VueSSRRenderer } from './vue-renderer.js';
import * as React from 'react';

// Polyfill React for SSR context where transforms might expect global React
(global as any).React = React;

export interface SSRConfig {
    /** Project root directory */
    root: string;

    /** Framework type */
    framework: 'nextjs' | 'nuxt' | 'remix';

    /** Build output directory */
    outDir: string;

    /** Server port */
    port: number;

    /** Enable production mode */
    production?: boolean;

    /** Custom HTML template */
    template?: string;
}

export interface RenderContext {
    /** Current route */
    route: Route;

    /** Request object */
    req: Request;

    /** Response object */
    res: Response;

    /** Route parameters */
    params: Record<string, string>;

    /** Query parameters */
    query: Record<string, string>;

    /** Data fetched for this route */
    data?: any;
}

export class SSRServer {
    private app: express.Application;
    private config: SSRConfig;
    private router: NextJsRouter | NuxtRouter | RemixRouter;

    constructor(config: SSRConfig) {
        this.config = config;
        this.app = express();

        // Initialize framework-specific router
        this.router = this.createRouter();
    }

    /**
     * Create framework-specific router
     */
    private createRouter() {
        const routerConfig = {
            root: this.config.root,
            framework: this.config.framework
        };

        switch (this.config.framework) {
            case 'nextjs':
                return new NextJsRouter(routerConfig);
            case 'nuxt':
                return new NuxtRouter(routerConfig);
            case 'remix':
                return new RemixRouter(routerConfig);
            default:
                throw new Error(`Unsupported framework: ${this.config.framework}`);
        }
    }

    /**
     * Start the SSR server
     */
    async start(): Promise<void> {
        console.log(`DEBUG: Running SSR Server from ${import.meta.url}`);
        console.log('DEBUG: EXECUTION-ID-999');
        log.info('🚀 Starting SSR Server...');

        // Scan routes
        const manifest = await this.router.scanRoutes();
        log.info(`📋 Found ${manifest.routes.length} routes`);

        // Serve static assets
        this.app.use('/assets', express.static(path.join(this.config.root, this.config.outDir)));
        this.app.use('/public', express.static(path.join(this.config.root, 'public')));

        // Handle API routes
        for (const route of manifest.apiRoutes) {
            let regexPath = route.path
                .replace(/:(\w+)/g, '[^/]+')
                .replace(/\*(\w+)/g, '.*');

            const routeRegex = new RegExp(`^${regexPath}$`);

            this.app.all(routeRegex, async (req, res) => {
                await this.handleAPIRoute(route, req, res);
            });
        }

        // Handle page routes
        for (const route of manifest.pageRoutes) {
            // Create a simple regex for Express that matches this route
            // NextJsRouter.match will handle the actual parameter extraction
            let regexPath = route.path
                .replace(/:(\w+)/g, '[^/]+') // Match dynamic segments
                .replace(/\*(\w+)/g, '.*');  // Match catch-all segments

            const routeRegex = new RegExp(`^${regexPath}$`);

            this.app.get(routeRegex, async (req, res) => {
                await this.handlePageRoute(route, req, res);
            });
        }

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).send(this.render404());
        });

        // Start listening
        this.app.listen(this.config.port, () => {
            log.info(`✅ SSR Server running on http://localhost:${this.config.port}`);
            log.info(`📦 Framework: ${this.config.framework}`);
            log.info(`📁 Root: ${this.config.root}`);
        });
    }


    /**
     * Handle API route request
     */
    private async handleAPIRoute(route: Route, req: Request, res: Response): Promise<void> {
        try {
            log.info(`🔌 API: ${req.method} ${req.path}`);

            // Import the API handler
            const handler = await this.importRoute(route.filePath);

            if (typeof handler.default === 'function') {
                await handler.default(req, res);
            } else if (typeof handler === 'function') {
                await handler(req, res);
            } else {
                res.status(500).json({ error: 'Invalid API handler' });
            }
        } catch (error: any) {
            log.error(`❌ API Error: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Handle page route request
     */
    private async handlePageRoute(route: Route, req: Request, res: Response): Promise<void> {
        try {
            log.info(`📄 Page: ${req.method} ${req.path}`);

            // Match route and extract params
            const match = this.router.match(req.path);

            if (!match) {
                res.status(404).send(this.render404());
                return;
            }

            // Create render context
            const context: RenderContext = {
                route: match.route,
                req,
                res,
                params: match.params,
                query: match.query,
            };

            // Fetch data for this route
            context.data = await this.fetchData(context);

            // Render the page
            const html = await this.renderPage(context);

            // Send response
            res.status(200).send(html);
        } catch (error: any) {
            log.error(`❌ Render Error: ${error.message}`);
            res.status(500).send(this.render500(error));
        }
    }

    /**
     * Fetch data for a route
     */
    private async fetchData(context: RenderContext): Promise<any> {
        try {
            const module = await this.importRoute(context.route.filePath);

            // Next.js data fetching
            if (this.config.framework === 'nextjs') {
                if (module.getServerSideProps) {
                    const result = await module.getServerSideProps({
                        req: context.req,
                        res: context.res,
                        params: context.params,
                        query: context.query,
                    });
                    return result.props;
                }

                if (module.getStaticProps) {
                    const result = await module.getStaticProps({
                        params: context.params,
                    });
                    return result.props;
                }
            }

            // Remix data fetching
            if (this.config.framework === 'remix') {
                if (context.req.method === 'GET' && module.loader) {
                    return await module.loader({
                        request: context.req,
                        params: context.params,
                    });
                }

                if (context.req.method === 'POST' && module.action) {
                    return await module.action({
                        request: context.req,
                        params: context.params,
                    });
                }
            }

            // Nuxt data fetching
            if (this.config.framework === 'nuxt') {
                // Nuxt uses composables, would need special handling
                // For now, return empty data
                return {};
            }

            return {};
        } catch (error: any) {
            log.warn(`⚠️ Data fetch failed: ${error.message}`);
            return {};
        }
    }

    /**
     * Render page to HTML
     */
    private async renderPage(context: RenderContext): Promise<string> {
        // Debug: confirm execution
        console.log('DEBUG: renderPage executed cleanly');
        try {
            // Import the component
            const Component = await this.importRoute(context.route.filePath);

            // Render based on framework
            let appHtml = '';

            if (this.config.framework === 'nextjs') {
                appHtml = await this.renderReact(Component, context);
            } else if (this.config.framework === 'nuxt') {
                appHtml = await this.renderVue(Component, context);
            } else if (this.config.framework === 'remix') {
                appHtml = await this.renderReact(Component, context);
            }

            // Wrap in HTML template
            return this.wrapInDocument(appHtml, context);
        } catch (error: any) {
            log.error(`❌ Render failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Render React component to HTML
     */
    private async renderReact(Component: any, context: RenderContext): Promise<string> {
        const renderer = new ReactSSRRenderer();
        return await renderer.render(Component, context);
    }

    /**
     * Render Vue component to HTML
     */
    private async renderVue(Component: any, context: RenderContext): Promise<string> {
        const renderer = new VueSSRRenderer();
        return await renderer.render(Component, context);
    }

    /**
     * Wrap rendered content in HTML document
     */
    private wrapInDocument(appHtml: string, context: RenderContext): string {
        const template = this.config.template || this.getDefaultTemplate();
        console.log(`DEBUG: Wrapping in document using template ID: PROD-READY-V1`);

        return template
            .replace('<!--app-html-->', appHtml)
            .replace('<!--app-data-->', `<script>window.__INITIAL_DATA__=${JSON.stringify(context.data)}</script>`)
            .replace('<!--app-title-->', `SSR App - ${context.route.name}`);
    }

    /**
     * Get default HTML template
     */
    private getDefaultTemplate(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="nexxo-version" content="PROD-READY-V1">
  <title><!--app-title--></title>
</head>
<body>
  <div id="nexxo-root"><!--app-html--></div>
  <!--app-data-->
  <script type="module" src="/assets/entry0.js"></script>
</body>
</html>`;
    }

    /**
     * Render 404 page
     */
    private render404(): string {
        return `<!DOCTYPE html>
<html>
<head><title>404 - Not Found</title></head>
<body>
  <h1>404 - Page Not Found</h1>
  <p>The requested page does not exist.</p>
</body>
</html>`;
    }

    /**
     * Render 500 error page
     */
    private render500(error: Error): string {
        return `<!DOCTYPE html>
<html>
<head><title>500 - Server Error</title></head>
<body>
  <h1>500 - Server Error</h1>
  <p>${this.config.production ? 'An error occurred.' : error.message}</p>
  ${this.config.production ? '' : `<pre>${error.stack}</pre>`}
</body>
</html>`;
    }

    /**
     * Import a route module
     */
    private async importRoute(filePath: string): Promise<any> {
        try {
            // In production, import from build output
            if (this.config.production) {
                const buildPath = path.join(this.config.root, this.config.outDir, path.basename(filePath, path.extname(filePath)) + '.js');
                return await import(buildPath);
            }

            // In development, import source file
            return await import(filePath);
        } catch (error: any) {
            log.error(`❌ Failed to import ${filePath}: ${error.message}`);
            throw error;
        }
    }
}
