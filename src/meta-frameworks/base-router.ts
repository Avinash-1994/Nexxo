/**
 * Base Router Implementation
 * Shared utilities for all meta-framework routers
 */

import fs from 'fs/promises';
import path from 'path';
import { Route, RouteManifest, RouteMatch, IRouter, RouterConfig } from './types.js';
import { log } from '../utils/logger.js';

export abstract class BaseRouter implements IRouter {
    protected config: RouterConfig;
    protected manifest: RouteManifest | null = null;

    constructor(config: RouterConfig) {
        this.config = config;
    }

    abstract scanRoutes(): Promise<RouteManifest>;

    /**
     * Match a URL to a route
     */
    match(url: string): RouteMatch | null {
        if (!this.manifest) {
            throw new Error('Routes not scanned. Call scanRoutes() first.');
        }

        const [pathname, search] = url.split('?');
        const query = this.parseQuery(search);

        // Try exact match first
        const exactMatch = this.manifest.byPath.get(pathname);
        if (exactMatch) {
            return { route: exactMatch, params: {}, query };
        }

        // Try dynamic routes
        for (const route of this.manifest.routes) {
            if (!route.isDynamic) continue;

            const params = this.matchDynamicRoute(pathname, route);
            if (params) {
                return { route, params, query };
            }
        }

        return null;
    }

    /**
     * Generate URL from route name and params
     */
    generate(name: string, params: Record<string, any> = {}): string {
        if (!this.manifest) {
            throw new Error('Routes not scanned. Call scanRoutes() first.');
        }

        const route = this.manifest.routes.find(r => r.name === name);
        if (!route) {
            throw new Error(`Route not found: ${name}`);
        }

        let path = route.path;

        // Replace dynamic segments
        for (const [key, value] of Object.entries(params)) {
            path = path.replace(`:${key}`, String(value));
            path = path.replace(`[${key}]`, String(value));
            path = path.replace(`$${key}`, String(value));
        }

        return path;
    }

    /**
     * Validate route configuration
     */
    async validate(): Promise<void> {
        const srcDir = path.join(this.config.root, this.config.srcDir || '');

        try {
            await fs.access(srcDir);
        } catch {
            throw new Error(`Source directory not found: ${srcDir}`);
        }
    }

    /**
     * Recursively scan directory for route files
     */
    protected async scanDirectory(
        dir: string,
        extensions: string[] = ['.tsx', '.ts', '.jsx', '.js', '.vue']
    ): Promise<string[]> {
        const files: string[] = [];

        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    // Skip node_modules and hidden directories
                    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
                        continue;
                    }

                    const subFiles = await this.scanDirectory(fullPath, extensions);
                    files.push(...subFiles);
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name);
                    if (extensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (error: any) {
            // Directory doesn't exist, return empty array
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }

        return files;
    }

    /**
     * Convert file path to route path
     */
    protected fileToRoutePath(filePath: string, baseDir: string): string {
        let routePath = path.relative(baseDir, filePath);

        // Remove extension
        routePath = routePath.replace(/\.(tsx?|jsx?|vue)$/, '');

        // Handle index files
        routePath = routePath.replace(/\/index$/, '');
        routePath = routePath.replace(/^index$/, '');

        // Convert to URL path
        routePath = '/' + routePath.replace(/\\/g, '/');

        // Normalize
        routePath = routePath.replace(/\/+/g, '/');
        if (routePath === '/') return '/';

        return routePath;
    }

    /**
     * Extract dynamic parameters from route path
     */
    protected extractParams(routePath: string): string[] {
        const params: string[] = [];

        // Next.js/Nuxt style: [param] or [...param]
        const bracketMatches = routePath.matchAll(/\[\.\.\.?([^\]]+)\]/g);
        for (const match of bracketMatches) {
            params.push(match[1]);
        }

        // Remix style: $param
        const dollarMatches = routePath.matchAll(/\$([a-zA-Z0-9_]+)/g);
        for (const match of dollarMatches) {
            params.push(match[1]);
        }

        // Express style: :param
        const colonMatches = routePath.matchAll(/:([a-zA-Z0-9_]+)/g);
        for (const match of colonMatches) {
            params.push(match[1]);
        }

        return [...new Set(params)]; // Remove duplicates
    }

    /**
     * Check if route path has dynamic segments
     */
    protected isDynamicPath(routePath: string): boolean {
        return /[\[\]:$]/.test(routePath);
    }

    /**
     * Match dynamic route against pathname
     */
    protected matchDynamicRoute(pathname: string, route: Route): Record<string, string> | null {
        const pattern = this.routeToRegex(route.path);
        const match = pathname.match(pattern);

        if (!match) return null;

        const params: Record<string, string> = {};
        route.params.forEach((param, index) => {
            params[param] = match[index + 1];
        });

        return params;
    }

    /**
     * Convert route path to regex pattern
     */
    protected routeToRegex(routePath: string): RegExp {
        let pattern = routePath;

        // Next.js/Nuxt catch-all: [...slug] -> (.*)
        pattern = pattern.replace(/\[\.\.\.([^\]]+)\]/g, '(.*)');

        // Next.js/Nuxt dynamic: [slug] -> ([^/]+)
        pattern = pattern.replace(/\[([^\]]+)\]/g, '([^/]+)');

        // Remix dynamic: $slug -> ([^/]+)
        pattern = pattern.replace(/\$([a-zA-Z0-9_]+)/g, '([^/]+)');

        // Express dynamic: :slug -> ([^/]+)
        pattern = pattern.replace(/:([a-zA-Z0-9_]+)/g, '([^/]+)');

        return new RegExp(`^${pattern}$`);
    }

    /**
     * Parse query string
     */
    protected parseQuery(search?: string): Record<string, string> {
        if (!search) return {};

        const params = new URLSearchParams(search);
        const query: Record<string, string> = {};

        params.forEach((value, key) => {
            query[key] = value;
        });

        return query;
    }

    /**
     * Build route tree from flat list
     */
    protected buildRouteTree(routes: Route[]): Route[] {
        const routeMap = new Map<string, Route>();
        const rootRoutes: Route[] = [];

        // First pass: create map
        for (const route of routes) {
            routeMap.set(route.filePath, route);
        }

        // Second pass: build tree
        for (const route of routes) {
            const parentPath = path.dirname(route.filePath);
            const parent = routeMap.get(parentPath);

            if (parent && parent !== route) {
                parent.children.push(route);
                route.parent = parent;
            } else {
                rootRoutes.push(route);
            }
        }

        return rootRoutes;
    }

    /**
     * Create route manifest
     */
    protected createManifest(routes: Route[]): RouteManifest {
        const byPath = new Map<string, Route>();
        const byFile = new Map<string, Route>();
        const apiRoutes: Route[] = [];
        const pageRoutes: Route[] = [];

        for (const route of routes) {
            byPath.set(route.path, route);
            byFile.set(route.filePath, route);

            if (route.type === 'api') {
                apiRoutes.push(route);
            } else if (route.type === 'page') {
                pageRoutes.push(route);
            }
        }

        return {
            routes,
            byPath,
            byFile,
            apiRoutes,
            pageRoutes
        };
    }

    /**
     * Log route scanning results
     */
    protected logRoutes(manifest: RouteManifest): void {
        log.info(`Found ${manifest.routes.length} routes`);
        log.info(`  - ${manifest.pageRoutes.length} page routes`);
        log.info(`  - ${manifest.apiRoutes.length} API routes`);

        if (manifest.routes.length > 0) {
            log.info('Route paths:');
            for (const route of manifest.pageRoutes.slice(0, 10)) {
                log.info(`  ${route.path} -> ${path.relative(this.config.root, route.filePath)}`);
            }
            if (manifest.pageRoutes.length > 10) {
                log.info(`  ... and ${manifest.pageRoutes.length - 10} more`);
            }
        }
    }
}
