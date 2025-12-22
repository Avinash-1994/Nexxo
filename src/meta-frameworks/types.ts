/**
 * Core Route Types
 * Shared types for all meta-framework routers
 */

export interface Route {
    /** File system path to the route file */
    filePath: string;

    /** URL path pattern (e.g., /blog/:slug) */
    path: string;

    /** Route name/identifier */
    name: string;

    /** Whether this route has dynamic segments */
    isDynamic: boolean;

    /** Dynamic parameter names */
    params: string[];

    /** Route type */
    type: 'page' | 'layout' | 'api' | 'middleware' | 'error';

    /** Parent route (for nested routes) */
    parent?: Route;

    /** Child routes */
    children: Route[];

    /** Framework-specific metadata */
    meta: Record<string, any>;
}

export interface RouteManifest {
    /** All routes in the application */
    routes: Route[];

    /** Route lookup by path */
    byPath: Map<string, Route>;

    /** Route lookup by file path */
    byFile: Map<string, Route>;

    /** API routes */
    apiRoutes: Route[];

    /** Page routes */
    pageRoutes: Route[];
}

export interface RouterConfig {
    /** Project root directory */
    root: string;

    /** Framework type */
    framework: 'nextjs' | 'nuxt' | 'remix';

    /** Source directory (e.g., 'app', 'pages', 'src') */
    srcDir?: string;

    /** Custom route patterns */
    patterns?: RoutePattern[];
}

export interface RoutePattern {
    /** File pattern to match */
    pattern: RegExp;

    /** How to transform file path to URL path */
    transform: (filePath: string) => string;

    /** Route type */
    type: Route['type'];
}

export interface RouteMatch {
    /** Matched route */
    route: Route;

    /** Extracted parameters */
    params: Record<string, string>;

    /** Query parameters */
    query: Record<string, string>;
}

/**
 * Base Router Interface
 * All framework routers must implement this
 */
export interface IRouter {
    /** Scan and build route manifest */
    scanRoutes(): Promise<RouteManifest>;

    /** Match a URL to a route */
    match(url: string): RouteMatch | null;

    /** Generate URL from route name and params */
    generate(name: string, params?: Record<string, any>): string;

    /** Validate route configuration */
    validate(): Promise<void>;
}
