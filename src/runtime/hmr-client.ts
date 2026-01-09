
/**
 * Nexxo HMR Client Runtime
 * Provides the `import.meta.hot` API and handles WebSocket updates.
 */

class HMRClient {
    private socket: WebSocket;
    private registry: Map<string, any> = new Map();
    private boundaries: Map<string, any> = new Map();

    constructor() {
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.socket = new WebSocket(`${protocol}//${location.host}`);
        this.socket.onmessage = (e) => this.handleMessage(JSON.parse(e.data));
    }

    private handleMessage(msg: any) {
        console.log('[Nexxo] HMR Message:', msg);
        switch (msg.type) {
            case 'connected':
                console.log('[Nexxo] Connected to Dev Server');
                break;
            case 'update':
                this.applyUpdate(msg.payload.updates);
                break;
            case 'reload':
                console.warn('[Nexxo] Reload triggered:', msg.payload.reason);
                location.reload();
                break;
            case 'error':
                console.error('[Nexxo] Build Error:', msg.payload.message);
                // Show Error Overlay (Phase 5.11)
                break;
        }
    }

    private async applyUpdate(updates: any[]) {
        for (const update of updates) {
            console.log(`[Nexxo] Hot Updating: ${update.moduleId}`);
            try {
                // 1. Dispose old module
                const old = this.registry.get(update.moduleId);
                if (old && old.hot && old.hot._dispose) {
                    old.hot._dispose();
                }

                // 2. Import new module (with cache buster)
                const newModule = await import(update.url + '?t=' + Date.now());
                this.registry.set(update.moduleId, newModule);

                // 3. Re-execute boundary or notify parents
                // This requires a dependency map on the client
            } catch (err) {
                console.error('[Nexxo] Update Failed:', err);
                location.reload();
            }
        }
    }

    // API provided to modules
    createHotContext(moduleId: string) {
        return {
            accept: (cb?: Function) => {
                this.boundaries.set(moduleId, cb || true);
            },
            dispose: (cb: Function) => {
                const mod = this.registry.get(moduleId);
                if (mod && mod.hot) mod.hot._dispose = cb;
            },
            invalidate: () => location.reload(),
            data: {}
        };
    }
}

(window as any).__NEXXO_HMR__ = new HMRClient();
