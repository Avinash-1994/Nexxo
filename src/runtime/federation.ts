export interface RemoteConfig {
    url: string;
    format?: 'esm' | 'systemjs' | 'var';
    fallback?: string; // Url to fallback remoteEntry or local module path
}

export interface SharedScope {
    [pkgName: string]: {
        [version: string]: {
            get: () => Promise<any>;
            loaded?: boolean;
            from: string;
        }
    }
}

declare global {
    interface Window {
        __NEXXO_FEDERATION__: {
            remotes: Record<string, RemoteConfig>;
            shared: SharedScope;
            initPromises: Record<string, Promise<any>>;
        }
    }
}

// Initialize Global Scope
if (typeof window !== 'undefined') {
    window.__NEXXO_FEDERATION__ = window.__NEXXO_FEDERATION__ || {
        remotes: {},
        shared: {},
        initPromises: {}
    };
}

export async function initFederation(remotes: Record<string, string>) {
    if (typeof window === 'undefined') return;

    Object.entries(remotes).forEach(([name, url]) => {
        window.__NEXXO_FEDERATION__.remotes[name] = { url };
    });
}

export async function loadRemote(remoteName: string, exposedModule: string) {
    if (typeof window === 'undefined') return null;

    const remote = window.__NEXXO_FEDERATION__.remotes[remoteName];
    if (!remote) {
        throw new Error(`Remote ${remoteName} not configured`);
    }

    try {
        // 1. Fetch Manifest
        const manifestUrl = remote.url.endsWith('.json') ? remote.url : `${remote.url}/remoteEntry.json`;
        const resp = await fetch(manifestUrl);
        if (!resp.ok) throw new Error(`Failed to fetch manifest: ${resp.statusText}`);

        const manifest = await resp.json();

        // 2. Check Health (Optional)
        if (manifest.health) {
            const healthUrl = new URL(manifest.health, manifestUrl).toString();
            try {
                const healthResp = await fetch(healthUrl);
                if (!healthResp.ok) throw new Error('Remote unhealthy');
            } catch (e) {
                console.warn(`Remote ${remoteName} is unhealthy, trying fallback...`);
                throw e;
            }
        }

        // 3. Resolve Module URL
        const moduleInfo = manifest.exposes[exposedModule];
        if (!moduleInfo) {
            throw new Error(`Module ${exposedModule} not exposed by ${remoteName}`);
        }

        const moduleUrl = new URL(moduleInfo.import, manifestUrl).toString();

        // 4. Load Module (ESM)
        // In production, this would be a dynamic import()
        // We return the promise so the bundler/runtime can handle it
        return import(/* @vite-ignore */ moduleUrl);

    } catch (e) {
        console.error(`Failed to load remote ${remoteName}:`, e);

        // 5. Fallback
        if (remote.fallback) {
            console.warn(`Using fallback for ${remoteName}`);
            // If fallback is a URL, try loading it. If it's a local path, we can't easily dynamic import it here 
            // without bundler support. For now, assume it's another remote URL.
            return import(/* @vite-ignore */ remote.fallback);
        }

        throw e;
    }
}

export function registerShared(name: string, version: string, factory: () => Promise<any>) {
    if (typeof window === 'undefined') return;

    const scope = window.__NEXXO_FEDERATION__.shared;
    if (!scope[name]) scope[name] = {};

    if (!scope[name][version]) {
        scope[name][version] = {
            get: factory,
            from: 'local'
        };
    }
}

export async function loadShared(name: string, requiredVersion: string) {
    if (typeof window === 'undefined') return null;

    const scope = window.__NEXXO_FEDERATION__.shared;
    const versions = scope[name];

    if (!versions) {
        console.warn(`Shared module ${name} not found`);
        return null;
    }

    // Simple SemVer matching (highest version)
    // In a real implementation, use semver library
    const sortedVersions = Object.keys(versions).sort().reverse();
    const bestVersion = sortedVersions[0]; // Naive: just take highest

    const lib = versions[bestVersion];
    if (!lib.loaded) {
        lib.loaded = true;
        return lib.get();
    }
    return lib.get(); // Should be cached by factory
}
