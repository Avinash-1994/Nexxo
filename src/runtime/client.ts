import './error-overlay.js';

let overlay: any;

function getOverlay() {
    if (!overlay) {
        overlay = document.createElement('urja-error-overlay');
        document.body.appendChild(overlay);
    }
    return overlay;
}

function showError(error: any) {
    const overlay = getOverlay();
    // Append to existing errors or replace? For now, let's just show the new list
    // In a real app we might manage state better
    overlay.errors = [error];
}

function clearErrors() {
    if (overlay) {
        overlay.dismiss();
    }
}

// 1. Build Errors (WebSocket)
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
let ws: WebSocket;
let reconnectAttempts = 0;
const MAX_ATTEMPTS = 50;

// Secure Config Sync State
let config: any = null;
let sessionToken: string = '';

function connect() {
    ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
        // console.log('[urja] Connected to dev server');
        reconnectAttempts = 0;
    };

    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);

            // Security: Config Sync Handlers
            if (message.type === 'config:init') {
                config = message.config;
                sessionToken = message.token;
                // console.log('[urja] Live config initialized');
            }

            if (message.type === 'config:changed') {
                config = message.config;
                // console.log('[urja] Config updated remotely:', message.update);
            }

            if (message.type === 'config:error') {
                console.error('[urja] Config Error:', message.message);
            }

            if (message.type === 'error') {
                console.error('[urja] Build Error:', message.error);
                showError({
                    type: 'build',
                    ...message.error
                });
            }

            if (message.type === 'reload') {
                clearErrors();
                window.location.reload();
            }

            if (message.type === 'update') {
                clearErrors();
            }

        } catch (e) {
            console.error('[urja] Failed to parse WebSocket message', e);
        }
    };

    ws.onclose = () => {
        if (reconnectAttempts < MAX_ATTEMPTS) {
            const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 5000);
            console.log(`[urja] Disconnected. Reconnecting in ${timeout}ms...`);
            setTimeout(connect, timeout);
            reconnectAttempts++;
        } else {
            console.error('[urja] Failed to reconnect to dev server after multiple attempts.');
        }
    };
}

// 2. Global API for Developer/Tooling Interaction (Secure)
(window as any).urja = {
    getConfig: () => config,
    updateConfig: (path: string, value: any, persist = false) => {
        if (!ws || ws.readyState !== ws.OPEN) {
            console.error('[urja] WebSocket not connected');
            return;
        }
        ws.send(JSON.stringify({
            type: 'config:update',
            token: sessionToken,
            persist,
            update: { path, value }
        }));
    }
};

connect();

// 2. Runtime Errors
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

// console.log('[urja] Dev client connected');
