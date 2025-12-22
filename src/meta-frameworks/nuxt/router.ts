/**
 * Nuxt 3 Router
 * Auto-routing from pages/ directory
 */

import path from 'path';
import { BaseRouter } from '../base-router.js';
import { Route, RouteManifest, RouterConfig } from '../types.js';
import { log } from '../../utils/logger.js';

export class NuxtRouter extends BaseRouter {
    constructor(config: RouterConfig) {
        super({ ...config, framework: 'nuxt' });
    }

    async scanRoutes(): Promise<RouteManifest> {
        await this.validate();

        const pagesDir = path.join(this.config.root, 'pages');
        const files = await this.scanDirectory(pagesDir, ['.vue']);

        const routes: Route[] = [];

        for (const filePath of files) {
            const route = this.createNuxtRoute(filePath, pagesDir);
            routes.push(route);
        }

        this.manifest = this.createManifest(routes);
        this.logRoutes(this.manifest);

        return this.manifest;
    }

    /**
     * Create Nuxt route from file
     */
    private createNuxtRoute(filePath: string, baseDir: string): Route {
        let routePath = this.fileToRoutePath(filePath, baseDir);

        // Handle dynamic routes
        // [id].vue -> :id
        // [...slug].vue -> :slug(.*) (catch-all)
        // [[slug]].vue -> :slug? (optional)

        routePath = routePath.replace(/\[\.\.\.([^\]]+)\]/g, ':$1(.*)'); // catch-all
        routePath = routePath.replace(/\[\[([^\]]+)\]\]/g, ':$1?'); // optional
        routePath = routePath.replace(/\[([^\]]+)\]/g, ':$1'); // dynamic

        const params = this.extractParams(routePath);
        const isDynamic = this.isDynamicPath(routePath);

        // Generate route name (Nuxt uses kebab-case)
        const name = this.generateRouteName(filePath, baseDir);

        // Check if it's a middleware or layout
        const fileName = path.basename(filePath, '.vue');
        const isMiddleware = fileName.startsWith('middleware.');
        const isLayout = fileName.startsWith('layout.');

        return {
            filePath,
            path: routePath,
            name,
            isDynamic,
            params,
            type: isMiddleware ? 'middleware' : isLayout ? 'layout' : 'page',
            children: [],
            meta: {
                framework: 'nuxt',
                fileName
            }
        };
    }

    /**
     * Generate Nuxt route name (kebab-case)
     */
    private generateRouteName(filePath: string, baseDir: string): string {
        const relativePath = path.relative(baseDir, filePath);
        return relativePath
            .replace(/\.vue$/, '')
            .replace(/[\/\\]/g, '-')
            .replace(/\[|\]/g, '')
            .replace(/^-/, '')
            .toLowerCase();
    }

    /**
     * Validate Nuxt project structure
     */
    async validate(): Promise<void> {
        const pagesDir = path.join(this.config.root, 'pages');

        try {
            const fs = await import('fs/promises');
            await fs.access(pagesDir);
        } catch {
            log.warn('No Nuxt pages/ directory found');
        }
    }
}
