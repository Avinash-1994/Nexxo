/**
 * Microfrontend Runtime Loader
 * Handles loading remote modules and managing shared dependencies.
 */

// Global scope for shared dependencies
const shareScope = {
    default: {}
};

// Map of loaded remotes
const containerMap = {};

// Map of loading promises
const loadingMap = {};

/**
 * Initialize a remote container
 */
async function initRemote(container, scope) {
    if (!container.__initialized && !container.__initializing) {
        container.__initializing = true;
        if (!container.init) {
            console.warn('Remote container does not have init method');
            return;
        }
        await container.init(scope);
        container.__initialized = true;
    }
}

/**
 * Load a remote module
 * @param {string} url - URL of the remoteEntry.js
 * @param {string} scope - Name of the remote container
 * @param {string} module - Path of the module to load
 */
export async function loadRemote(url, scope, module) {
    // 1. Load the remote entry script if not already loaded
    if (!window[scope]) {
        if (!loadingMap[url]) {
            loadingMap[url] = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.type = 'module';
                script.src = url;
                script.async = true;

                script.onload = () => {
                    resolve(window[scope]);
                };

                script.onerror = (e) => {
                    reject(new Error(`Failed to load remote script: ${url}`));
                };

                document.head.appendChild(script);
            });
        }

        await loadingMap[url];
    }

    const container = window[scope];
    if (!container) {
        throw new Error(`Remote container '${scope}' not found after loading script`);
    }

    // 2. Initialize the container with shared scope
    await initRemote(container, shareScope.default);

    // 3. Get the module factory
    const factory = await container.get(module);

    // 4. Return the module exports
    return factory();
}

/**
 * Register a shared module
 */
export function registerShared(name, version, factory) {
    if (!shareScope.default[name]) {
        shareScope.default[name] = {};
    }

    shareScope.default[name][version] = {
        loaded: false,
        get: factory
    };
}
