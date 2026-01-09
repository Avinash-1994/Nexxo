/* global HTMLLinkElement */
import './error-overlay.js';

let overlay: any;

function getOverlay() {
    if (!overlay) {
        overlay = document.createElement('nexxo-error-overlay');
        document.body.appendChild(overlay);
    }
    return overlay;
}

function showError(error: any) {
    const overlay = getOverlay();
    overlay.errors = [error];
}

function clearErrors() {
    if (overlay) {
        overlay.dismiss();
    }
}

// 1. Build Errors (WebSocket) & HMR
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
let ws: WebSocket;
let reconnectAttempts = 0;
const MAX_ATTEMPTS = 50;

// Secure Config Sync State
let config: any = null;
let sessionToken: string = '';

// HMR State
const hotModulesMap = new Map<string, {
    id: string;
    callbacks: {
        deps: string[];
        fn: ((modules: any[]) => void);
    }[];
    disposeCallbacks: ((data: any) => void)[];
    data: any;
}>();

const isHmrUpdating = false;

function connect() {
    // Determine host: if running in proxy, might need to respect forward headers?
    // Using window.location.host is safe for dev
    ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
        // console.log('[nexxo] Connected to dev server');
        reconnectAttempts = 0;
        // Notify server we are ready?
    };

    ws.onmessage = async (event) => {
        try {
            const message = JSON.parse(event.data);

            if (message.type === 'connected') {
                console.log('[nexxo] Connected.');
            }

            // Security: Config Sync
            if (message.type === 'config:init') {
                config = message.config;
                sessionToken = message.token;
            }

            if (message.type === 'config:changed') {
                config = message.config;
                // console.log('[nexxo] Config updated remotely:', message.update);
            }

            if (message.type === 'error') {
                console.error('[nexxo] Build Error:', message.error);
                showError({ type: 'build', ...message.error });
            }

            if (message.type === 'reload') {
                console.log('[nexxo] Reloading page...');
                window.location.reload();
            }

            if (message.type === 'update-css') {
                // message.path is relative path
                const path = message.path;
                const sheets = [].slice.call(document.getElementsByTagName('link'));
                const head = document.getElementsByTagName('head')[0];
                let handled = false;

                // Handle <link> tags
                for (let i = 0; i < sheets.length; ++i) {
                    const elem = sheets[i] as HTMLLinkElement;
                    if (elem.href && elem.href.includes(path)) {
                        const parent = elem.parentNode;
                        const newLink = document.createElement('link');
                        newLink.rel = 'stylesheet';
                        newLink.href = elem.href.split('?')[0] + '?t=' + Date.now();
                        newLink.onload = () => parent?.removeChild(elem);
                        parent?.appendChild(newLink);
                        handled = true;
                    }
                }

                // Handle <style> tags (CSS-in-JS or Vue/Angular injections)
                if (!handled) {
                    // This is harder without IDs. Nexxo's CSS plugin injects with IDs?
                    // Assuming global reload for now if not found
                    // Or trying to find style tag with data-vite-dev-id equivalent
                }

                if (handled) console.log(`[nexxo] CSS updated: ${path}`);
            }

            if (message.type === 'update') {
                // JS HMR Update
                const updates = message.updates || [];
                await applyUpdates(updates);
            }

        } catch (e) {
            console.error('[nexxo] Failed to parse WebSocket message', e);
        }
    };

    ws.onclose = () => {
        if (reconnectAttempts < MAX_ATTEMPTS) {
            const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 5000);
            console.log(`[nexxo] Disconnected. Reconnecting in ${timeout}ms...`);
            setTimeout(connect, timeout);
            reconnectAttempts++;
        }
    };
}

async function applyUpdates(updates: any[]) {
    // Simplified HMR propagation
    for (const update of updates) {
        const mod = hotModulesMap.get(update.path);
        if (mod) {
            console.log(`[nexxo] HMR Update: ${update.path}`);

            // 1. Call dispose
            const data = {};
            mod.disposeCallbacks.forEach(cb => cb(data));
            mod.data = data;
            mod.disposeCallbacks = []; // clear after call

            // 2. Import new module (causing re-execution)
            try {
                // Timestamp to bust cache
                const newMod = await import(update.path + '?t=' + Date.now());

                // 3. Notify acceptors
                mod.callbacks.forEach(cb => {
                    cb.fn([newMod]);
                });
            } catch (e) {
                console.error(`[nexxo] HMR Error in ${update.path}:`, e);
                window.location.reload(); // Fallback
            }
        } else {
            window.location.reload(); // Full reload if not accepted
        }
    }
}

// 2. Global API
(window as any).nexxo = {
    getConfig: () => config,
    updateConfig: (path: string, value: any, persist = false) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'config:update',
                token: sessionToken,
                persist,
                update: { path, value }
            }));
        }
    }
};

// 3. HMR API (Vite-compatible)
export function createHotContext(ownerPath: string) {
    if (!hotModulesMap.has(ownerPath)) {
        hotModulesMap.set(ownerPath, {
            id: ownerPath,
            callbacks: [],
            disposeCallbacks: [],
            data: {}
        });
    }

    const mod = hotModulesMap.get(ownerPath)!;

    return {
        get data() {
            return mod.data;
        },
        accept(deps: string | string[] | ((modules: any[]) => void), callback?: (modules: any[]) => void) {
            if (typeof deps === 'function' || !deps) {
                // Self-accept: accept(cb) or accept()
                mod.callbacks.push({
                    deps: [ownerPath],
                    fn: (modules: any[]) => {
                        if (typeof deps === 'function') deps(modules);
                        else if (callback) callback(modules);
                    }
                });
            } else {
                // Dep-accept: accept(['./foo'], cb)
                // Nexxo v1 simplified: treat as self-accept for now or reload
                // Proper dep support requires graph analysis on client or server sending graph
            }
        },
        dispose(cb: (data: any) => void) {
            mod.disposeCallbacks.push(cb);
        },
        decline() { },
        invalidate() {
            window.location.reload();
        },
        on(event: string, cb: Function) {
            // events like vite:beforeUpdate
        }
    };
}

connect();

// Runtime Errors
window.addEventListener('error', (event) => {
    showError({
        type: 'runtime',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
    });
});

window.addEventListener('unhandledrejection', (event) => {
    showError({
        type: 'runtime',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack
    });
});
