
/**
 * Nexxo Error Overlay Client
 * Injected into the browser to capture Runtime & Build errors.
 * Day 15: Reliable Error Overlay Lock
 */

import './overlay-ui.js';

// Singleton instance management
let overlayInstance: HTMLElement | null = null;

function getOverlay() {
    if (!overlayInstance || !overlayInstance.isConnected) {
        overlayInstance = document.createElement('nexxo-error-overlay');
        document.body.appendChild(overlayInstance);
    }
    return overlayInstance as any;
}

function handleRuntimeError(event: ErrorEvent) {
    const overlay = getOverlay();
    overlay.showError({
        message: event.message,
        stack: event.error?.stack,
        file: event.filename,
        line: event.lineno
    });
}

function handleRejection(event: PromiseRejectionEvent) {
    const overlay = getOverlay();
    overlay.showError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack
    });
}

// Global API for HMR Client
(window as any).__NEXXO_OVERLAY__ = {
    reportBuildError(err: any) {
        const overlay = getOverlay();
        overlay.showError(err);
    },
    dismiss() {
        if (overlayInstance && overlayInstance.isConnected) {
            overlayInstance.remove();
        }
    }
};

// Activate Listeners
export function activateOverlay() {
    window.addEventListener('error', handleRuntimeError);
    window.addEventListener('unhandledrejection', handleRejection);
    console.log('[Nexxo] Error Overlay Active');
}

// Auto-activate if running in browser
if (typeof window !== 'undefined') {
    activateOverlay();
}
