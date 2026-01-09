/**
 * Nexxo Native Federation Runtime
 * 100% self-contained, zero external dependencies
 * Loads and manages federated modules using native ESM
 * With advanced fallback strategies and circuit breaker pattern
 */

import { fallbackManager, CircuitState } from './federation-fallback.js';

class FederationRuntime {
    constructor() {
        this.remotes = new Map();
        this.sharedModules = new Map();
        this.manifestCache = new Map();
        this.moduleCache = new Map();
    }

    /**
     * Register a remote application
     * @param {string} name - Remote name
     * @param {string} url - Base URL or manifest URL
     */
    async registerRemote(name, url) {
        try {
            // Fetch and parse manifest
            const manifestUrl = url.endsWith('.json') ? url : `${url}/remoteEntry.json`;
            const response = await fetch(manifestUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch manifest from ${manifestUrl}: ${response.statusText}`);
            }

            const manifest = await response.json();
            this.manifestCache.set(name, manifest);

            // Store remote configuration
            this.remotes.set(name, {
                name: manifest.name || name,
                url: url.endsWith('.json') ? url.replace('/remoteEntry.json', '') : url,
                manifest,
                loaded: true
            });

            console.log(`[Federation] Registered remote: ${name}`, manifest);
            return manifest;
        } catch (error) {
            console.error(`[Federation] Failed to register remote ${name}:`, error);
            throw error;
        }
    }

    /**
     * Load a module from a remote
     * @param {string} remoteName - Name of the remote
     * @param {string} modulePath - Path to the module (e.g., './Button')
     * @returns {Promise<any>} The loaded module
     */
    async loadRemoteModule(remoteName, modulePath) {
        const cacheKey = `${remoteName}:${modulePath}`;

        // Check cache first
        if (this.moduleCache.has(cacheKey)) {
            return this.moduleCache.get(cacheKey);
        }

        const remote = this.remotes.get(remoteName);
        if (!remote) {
            throw new Error(`Remote "${remoteName}" not registered. Call registerRemote() first.`);
        }

        const manifest = remote.manifest;
        const exposed = manifest.exposes?.[modulePath];

        if (!exposed) {
            throw new Error(`Module "${modulePath}" not exposed by remote "${remoteName}"`);
        }

        try {
            // Construct full URL
            const moduleUrl = this.resolveModuleUrl(remote.url, exposed.import);

            console.log(`[Federation] Loading module: ${remoteName}${modulePath} from ${moduleUrl}`);

            // Dynamic import
            const module = await import(/* @vite-ignore */ moduleUrl);

            // Cache the module
            this.moduleCache.set(cacheKey, module);

            return module;
        } catch (error) {
            console.error(`[Federation] Failed to load module ${remoteName}${modulePath}:`, error);
            throw error;
        }
    }

    /**
     * Resolve module URL from base URL and import path
     * @private
     */
    resolveModuleUrl(baseUrl, importPath) {
        // Handle absolute URLs
        if (importPath.startsWith('http://') || importPath.startsWith('https://')) {
            return importPath;
        }

        // Handle relative paths
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
            return `${baseUrl}/${importPath.replace(/^\.\//, '')}`;
        }

        // Default: treat as relative
        return `${baseUrl}/${importPath}`;
    }

    /**
     * Register a shared module (for singleton dependencies like React)
     * @param {string} name - Module name (e.g., 'react')
     * @param {any} module - The actual module
     * @param {string} version - Version string
     */
    registerShared(name, module, version) {
        this.sharedModules.set(name, {
            module,
            version,
            singleton: true
        });
        console.log(`[Federation] Registered shared module: ${name}@${version}`);
    }

    /**
     * Get a shared module
     * @param {string} name - Module name
     * @returns {any} The shared module or undefined
     */
    getShared(name) {
        return this.sharedModules.get(name)?.module;
    }

    /**
     * Prefetch remote manifests for faster loading
     * @param {Array<{name: string, url: string}>} remotes
     */
    async prefetchRemotes(remotes) {
        const promises = remotes.map(({ name, url }) =>
            this.registerRemote(name, url).catch(err => {
                console.warn(`[Federation] Prefetch failed for ${name}:`, err);
            })
        );
        await Promise.all(promises);
    }

    /**
     * Health check for a remote
     * @param {string} remoteName
     * @returns {Promise<boolean>}
     */
    async healthCheck(remoteName) {
        const remote = this.remotes.get(remoteName);
        if (!remote) return false;

        const manifest = remote.manifest;
        if (manifest.health) {
            try {
                const response = await fetch(`${remote.url}${manifest.health}`);
                return response.ok;
            } catch {
                return false;
            }
        }

        // Default: check if manifest is accessible
        return remote.loaded;
    }

    /**
     * Clear module cache (useful for HMR)
     * @param {string} [remoteName] - Optional: clear only specific remote
     */
    clearCache(remoteName) {
        if (remoteName) {
            for (const [key] of this.moduleCache) {
                if (key.startsWith(`${remoteName}:`)) {
                    this.moduleCache.delete(key);
                }
            }
        } else {
            this.moduleCache.clear();
        }
    }
}

// Global singleton instance
if (typeof window !== 'undefined') {
    window.__NEXXO_FEDERATION__ = window.__NEXXO_FEDERATION__ || new FederationRuntime();
}

// Export for module usage
export default typeof window !== 'undefined' ? window.__NEXXO_FEDERATION__ : new FederationRuntime();

// Helper function for easier usage
export async function loadRemote(remoteName, modulePath) {
    const runtime = typeof window !== 'undefined' ? window.__NEXXO_FEDERATION__ : new FederationRuntime();
    return runtime.loadRemoteModule(remoteName, modulePath);
}

export async function registerRemote(name, url) {
    const runtime = typeof window !== 'undefined' ? window.__NEXXO_FEDERATION__ : new FederationRuntime();
    return runtime.registerRemote(name, url);
}
