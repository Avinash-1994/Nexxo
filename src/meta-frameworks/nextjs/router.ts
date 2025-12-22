/**
 * Next.js Router
 * Supports both Pages Router and App Router
 */

import path from 'path';
import { BaseRouter } from '../base-router.js';
import { Route, RouteManifest, RouterConfig } from '../types.js';
import { log } from '../../utils/logger.js';

export class NextJsRouter extends BaseRouter {
    constructor(config: RouterConfig) {
        super({ ...config, framework: 'nextjs' });
    }

    async scanRoutes(): Promise<RouteManifest> {
        await this.validate();

        const routes: Route[] = [];

        // Scan Pages Router (pages/ directory)
        const pagesRoutes = await this.scanPagesRouter();
        routes.push(...pagesRoutes);

        // Scan App Router (app/ directory) - Next.js 13+
        const appRoutes = await this.scanAppRouter();
        routes.push(...appRoutes);

        this.manifest = this.createManifest(routes);
        this.logRoutes(this.manifest);

        return this.manifest;
    }

    /**
     * Scan Pages Router (pages/ directory)
     */
    private async scanPagesRouter(): Promise<Route[]> {
        const pagesDir = path.join(this.config.root, 'pages');
        const files = await this.scanDirectory(pagesDir);

        const routes: Route[] = [];

        for (const filePath of files) {
            const relativePath = path.relative(pagesDir, filePath);

            // Skip _app, _document, _error (special files)
            if (relativePath.startsWith('_')) {
                continue;
            }

            // Check if it's an API route
            const isApiRoute = relativePath.startsWith('api/') || relativePath.startsWith('api\\');

            const route = this.createPagesRoute(filePath, pagesDir, isApiRoute);
            routes.push(route);
        }

        return routes;
    }

    /**
     * Create route from Pages Router file
     */
    private createPagesRoute(filePath: string, baseDir: string, isApi: boolean): Route {
        let routePath = this.fileToRoutePath(filePath, baseDir);

        // Handle dynamic routes
        // [id].tsx -> :id
        // [...slug].tsx -> *slug (catch-all)
        // [[...slug]].tsx -> *slug? (optional catch-all)

        routePath = routePath.replace(/\[\.\.\.([^\]]+)\]/g, '*$1'); // catch-all
        routePath = routePath.replace(/\[\[\.\.\.([^\]]+)\]\]/g, '*$1?'); // optional catch-all
        routePath = routePath.replace(/\[([^\]]+)\]/g, ':$1'); // dynamic

        const params = this.extractParams(routePath);
        const isDynamic = this.isDynamicPath(routePath);

        // Generate route name
        const name = this.generateRouteName(filePath, baseDir);

        return {
            filePath,
            path: routePath,
            name,
            isDynamic,
            params,
            type: isApi ? 'api' : 'page',
            children: [],
            meta: {
                router: 'pages',
                framework: 'nextjs'
            }
        };
    }

    /**
     * Scan App Router (app/ directory)
     */
    private async scanAppRouter(): Promise<Route[]> {
        const appDir = path.join(this.config.root, 'app');
        const files = await this.scanDirectory(appDir);

        const routes: Route[] = [];

        for (const filePath of files) {
            const fileName = path.basename(filePath, path.extname(filePath));

            // Only process route files
            if (!['page', 'layout', 'loading', 'error', 'route'].includes(fileName)) {
                continue;
            }

            const route = this.createAppRoute(filePath, appDir);
            if (route) {
                routes.push(route);
            }
        }

        return routes;
    }

    /**
     * Create route from App Router file
     */
    private createAppRoute(filePath: string, baseDir: string): Route | null {
        const fileName = path.basename(filePath, path.extname(filePath));
        const dirPath = path.dirname(filePath);

        let routePath = this.fileToRoutePath(dirPath, baseDir);

        // Handle route groups: (group) -> ignored in URL
        routePath = routePath.replace(/\/\([^)]+\)/g, '');

        // Handle dynamic routes
        routePath = routePath.replace(/\[\.\.\.([^\]]+)\]/g, '*$1'); // catch-all
        routePath = routePath.replace(/\[([^\]]+)\]/g, ':$1'); // dynamic

        const params = this.extractParams(routePath);
        const isDynamic = this.isDynamicPath(routePath);

        // Determine route type
        let type: Route['type'] = 'page';
        if (fileName === 'layout') type = 'layout';
        else if (fileName === 'error') type = 'error';
        else if (fileName === 'route') type = 'api';

        // Generate route name
        const name = this.generateRouteName(filePath, baseDir);

        return {
            filePath,
            path: routePath,
            name,
            isDynamic,
            params,
            type,
            children: [],
            meta: {
                router: 'app',
                framework: 'nextjs',
                segment: fileName
            }
        };
    }

    /**
     * Generate unique route name
     */
    private generateRouteName(filePath: string, baseDir: string): string {
        const relativePath = path.relative(baseDir, filePath);
        return relativePath
            .replace(/\.(tsx?|jsx?)$/, '')
            .replace(/[\/\\]/g, '.')
            .replace(/\[|\]/g, '')
            .replace(/^\./, '');
    }

    /**
     * Validate Next.js project structure
     */
    async validate(): Promise<void> {
        const pagesDir = path.join(this.config.root, 'pages');
        const appDir = path.join(this.config.root, 'app');

        let found = false;

        try {
            await this.checkDirectory(pagesDir);
            found = true;
        } catch {
            // pages/ not found, try app/
        }

        if (!found) {
            try {
                await this.checkDirectory(appDir);
                found = true;
            } catch {
                // app/ not found either
            }
        }

        if (!found) {
            log.warn('No Next.js routing directories found (pages/ or app/)');
        }
    }

    private async checkDirectory(dir: string): Promise<void> {
        const fs = await import('fs/promises');
        await fs.access(dir);
    }
}
