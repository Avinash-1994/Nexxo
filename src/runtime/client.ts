import './error-overlay.js';

let overlay: any;

function getOverlay() {
    if (!overlay) {
        overlay = document.createElement('nextgen-error-overlay');
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

function connect() {
    ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
        console.log('[nextgen] Connected to dev server');
        reconnectAttempts = 0;
    };

    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);

            if (message.type === 'error') {
                console.error('[nextgen] Build Error:', message.error);
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
                // console.log('[nextgen] HMR Update');
                // HMR logic would go here
            }

        } catch (e) {
            console.error('[nextgen] Failed to parse WebSocket message', e);
        }
    };

    ws.onclose = () => {
        if (reconnectAttempts < MAX_ATTEMPTS) {
            const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 5000);
            console.log(`[nextgen] Disconnected. Reconnecting in ${timeout}ms...`);
            setTimeout(connect, timeout);
            reconnectAttempts++;
        } else {
            console.error('[nextgen] Failed to reconnect to dev server after multiple attempts.');
        }
    };
}

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

// console.log('[nextgen] Dev client connected');
