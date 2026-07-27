import fs from 'fs';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import crypto from 'crypto';
import { getFetch } from '../utils/fetch.js';

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
        __LUNX_FEDERATION__: {
            remotes: Record<string, RemoteConfig>;
            shared: SharedScope;
            initPromises: Record<string, Promise<any>>;
        }
    }
}

function isBrowserEnv() {
    return typeof window !== 'undefined' || !!(globalThis as any).window;
}

function getFederationGlobal(): any {
    if (typeof window !== 'undefined') {
        return window as any;
    }
    if ((globalThis as any).window) {
        return (globalThis as any).window;
    }
    return globalThis as any;
}

function ensureFederationGlobal() {
    const root = getFederationGlobal();
    if (!root.__LUNX_FEDERATION__) {
        root.__LUNX_FEDERATION__ = {
            remotes: {},
            shared: {},
            initPromises: {}
        };
    }
    return root;
}

export async function initFederation(remotes: Record<string, string>) {
    const root = ensureFederationGlobal();
    Object.entries(remotes).forEach(([name, url]) => {
        root.__LUNX_FEDERATION__.remotes[name] = { url };
    });
}

function isRemoteUrl(value: string) {
    return /^https?:\/\//.test(value) || /^file:\/\//.test(value);
}

function isLocalPath(value: string) {
    try {
        const url = new URL(value);
        return url.protocol !== 'http:' && url.protocol !== 'https:';
    } catch {
        return true;
    }
}

async function importRemoteModule(moduleUrl: string) {
    if (isBrowserEnv()) {
        return import(/* @vite-ignore */ moduleUrl);
    }

    if (isLocalPath(moduleUrl)) {
        const resolvedPath = path.isAbsolute(moduleUrl)
            ? moduleUrl
            : path.resolve(moduleUrl);

        if (!fs.existsSync(resolvedPath)) {
            throw new Error(`Local fallback module not found: ${resolvedPath}`);
        }

        return import(pathToFileURL(resolvedPath).href);
    }

    // Node.js server-side federation support for remote URLs.
    // Use a deterministic temp path so repeated loads can reuse the same cache.
    const digest = crypto.createHash('sha256').update(moduleUrl).digest('hex').slice(0, 16);
    const tempDir = path.join(os.tmpdir(), 'lunx-mf', digest);
    fs.mkdirSync(tempDir, { recursive: true });
    const moduleFile = path.join(tempDir, 'remote-module.mjs');

    const fetch = await getFetch();
    const response = await fetch(moduleUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch remote module at ${moduleUrl}: ${response.status} ${response.statusText}`);
    }

    const source = await response.text();
    fs.writeFileSync(moduleFile, source, 'utf8');
    return import(pathToFileURL(moduleFile).href);
}

export async function loadRemote(remoteName: string, exposedModule: string) {
    const root = ensureFederationGlobal();
    const remote = root.__LUNX_FEDERATION__.remotes[remoteName];
    if (!remote) {
        throw new Error(`Remote ${remoteName} not configured`);
    }

    try {
        // 1. Resolve Manifest
        const manifestUrl = remote.url.endsWith('.json')
            ? remote.url
            : remote.url.endsWith('.js')
                ? remote.url.replace(/\.js$/, '.json')
                : `${remote.url.replace(/\/$/, '')}/remoteEntry.json`;
        let manifest: any;

        if (isLocalPath(manifestUrl)) {
            const localManifestPath = path.isAbsolute(manifestUrl) ? manifestUrl : path.resolve(manifestUrl);
            if (!fs.existsSync(localManifestPath)) {
                throw new Error(`Failed to read local manifest: ${localManifestPath}`);
            }
            manifest = JSON.parse(fs.readFileSync(localManifestPath, 'utf8'));
        } else {
            const fetch = await getFetch();
            const resp = await fetch(manifestUrl);
            if (!resp.ok) throw new Error(`Failed to fetch manifest: ${resp.statusText}`);
            manifest = await resp.json();
        }

        // 2. Check Health (Optional)
        if (manifest.health) {
            const healthUrl = isLocalPath(manifest.health)
                ? path.resolve(path.dirname(manifestUrl), manifest.health)
                : new URL(manifest.health, manifestUrl).toString();

            if (isLocalPath(healthUrl)) {
                const resolvedHealthPath = path.isAbsolute(healthUrl) ? healthUrl : path.resolve(healthUrl);
                if (!fs.existsSync(resolvedHealthPath)) {
                    throw new Error('Remote unhealthy');
                }
            } else {
                const fetch = await getFetch();
                const healthResp = await fetch(healthUrl);
                if (!healthResp.ok) throw new Error('Remote unhealthy');
            }
        }

        // 3. Resolve Module URL
        const moduleInfo = manifest.exposes[exposedModule];
        if (!moduleInfo) {
            throw new Error(`Module ${exposedModule} not exposed by ${remoteName}`);
        }

        const moduleUrl = new URL(moduleInfo.import, manifestUrl).toString();

        // 4. Load Module
        return importRemoteModule(moduleUrl);

    } catch (e) {
        console.error(`Failed to load remote ${remoteName}:`, e);

        // 5. Fallback
        if (remote.fallback) {
            console.warn(`Using fallback for ${remoteName}`);
            return importRemoteModule(remote.fallback);
        }

        throw e;
    }
}

export function registerShared(name: string, version: string, factory: () => Promise<any>) {
    const root = ensureFederationGlobal();
    const scope = root.__LUNX_FEDERATION__.shared;
    if (!scope[name]) scope[name] = {};

    if (!scope[name][version]) {
        scope[name][version] = {
            get: factory,
            from: 'local'
        };
    }
}

export async function loadShared(name: string, requiredVersion: string) {
    const root = ensureFederationGlobal();
    const scope = root.__LUNX_FEDERATION__.shared;
    const versions = scope[name];

    if (!versions) {
        console.warn(`Shared module ${name} not found`);
        return null;
    }

    const sortedVersions = Object.keys(versions).sort().reverse();
    const bestVersion = sortedVersions[0];
    const lib = versions[bestVersion];

    if (!lib.loaded) {
        lib.loaded = true;
        return lib.get();
    }
    return lib.get();
}

