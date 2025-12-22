/**
 * Remix Router
 * File-based routing with nested routes
 */

import path from 'path';
import { BaseRouter } from '../base-router.js';
import { Route, RouteManifest, RouterConfig } from '../types.js';
import { log } from '../../utils/logger.js';

export class RemixRouter extends BaseRouter {
    constructor(config: RouterConfig) {
        super({ ...config, framework: 'remix' });
    }

    async scanRoutes(): Promise<RouteManifest> {
        await this.validate();

        const routesDir = path.join(this.config.root, 'app', 'routes');
        const files = await this.scanDirectory(routesDir);

        const routes: Route[] = [];

        for (const filePath of files) {
            const route = this.createRemixRoute(filePath, routesDir);
            routes.push(route);
        }

        this.manifest = this.createManifest(routes);
        this.logRoutes(this.manifest);

        return this.manifest;
    }

    /**
     * Create Remix route from file
     * Remix uses special naming conventions:
     * - _index.tsx -> /
     * - about.tsx -> /about
     * - blog.$slug.tsx -> /blog/:slug
     * - blog._index.tsx -> /blog
     * - __layout.tsx -> pathless layout
     */
    private createRemixRoute(filePath: string, baseDir: string): Route {
        const fileName = path.basename(filePath, path.extname(filePath));

        // Handle special files
        if (fileName === '_index') {
            const dirPath = path.dirname(filePath);
            const routePath = this.fileToRoutePath(dirPath, baseDir);

            return {
                filePath,
                path: routePath || '/',
                name: this.generateRouteName(filePath, baseDir),
                isDynamic: false,
                params: [],
                type: 'page',
                children: [],
                meta: {
                    framework: 'remix',
                    isIndex: true
                }
            };
        }

        // Parse Remix route syntax
        let routePath = fileName;

        // Handle pathless layouts: __layout -> ignored in URL
        if (routePath.startsWith('__')) {
            return {
                filePath,
                path: '',
                name: this.generateRouteName(filePath, baseDir),
                isDynamic: false,
                params: [],
                type: 'layout',
                children: [],
                meta: {
                    framework: 'remix',
                    pathless: true
                }
            };
        }

        // Handle layout routes: _layout -> layout but no URL segment
        if (routePath.startsWith('_') && !routePath.includes('.')) {
            return {
                filePath,
                path: '',
                name: this.generateRouteName(filePath, baseDir),
                isDynamic: false,
                params: [],
                type: 'layout',
                children: [],
                meta: {
                    framework: 'remix',
                    layout: true
                }
            };
        }

        // Convert dots to slashes: blog.post -> /blog/post
        routePath = routePath.replace(/\./g, '/');

        // Handle dynamic segments: $slug -> :slug
        routePath = routePath.replace(/\$([a-zA-Z0-9_]+)/g, ':$1');

        // Handle splat routes: $.tsx -> *
        routePath = routePath.replace(/\$$/g, '*');

        // Add leading slash
        routePath = '/' + routePath;

        const params = this.extractParams(routePath);
        const isDynamic = this.isDynamicPath(routePath);

        return {
            filePath,
            path: routePath,
            name: this.generateRouteName(filePath, baseDir),
            isDynamic,
            params,
            type: 'page',
            children: [],
            meta: {
                framework: 'remix'
            }
        };
    }

    /**
     * Generate Remix route name
     */
    private generateRouteName(filePath: string, baseDir: string): string {
        const relativePath = path.relative(baseDir, filePath);
        return relativePath
            .replace(/\.(tsx?|jsx?)$/, '')
            .replace(/[\/\\]/g, '.')
            .replace(/\$/g, '')
            .replace(/^_/, '')
            .replace(/^\./, '');
    }

    /**
     * Validate Remix project structure
     */
    async validate(): Promise<void> {
        const routesDir = path.join(this.config.root, 'app', 'routes');

        try {
            const fs = await import('fs/promises');
            await fs.access(routesDir);
        } catch {
            log.warn('No Remix app/routes/ directory found');
        }
    }
}
