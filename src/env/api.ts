
/**
 * Nexxo Environment API
 * Unified Runtime for Browser, Node, and Edge
 * Day 26: Environment API Lock
 */

export interface EnvConfig {
    mode: 'development' | 'production';
    ssr: boolean;
    base: string;
}

export class NexxoEnv {
    private static instance: NexxoEnv;
    public config: EnvConfig;
    private listeners: Function[] = [];

    private constructor(config: EnvConfig) {
        this.config = config;
    }

    static init(config: EnvConfig): NexxoEnv {
        if (!NexxoEnv.instance) {
            NexxoEnv.instance = new NexxoEnv(config);
        }
        return NexxoEnv.instance;
    }

    static get(): NexxoEnv {
        if (!NexxoEnv.instance) {
            throw new Error('NexxoEnv not initialized');
        }
        return NexxoEnv.instance;
    }

    /**
     * Unified HMR Listener
     * Works on Browser (WebSocket) or Server (EventBus/ProcessSignal)
     */
    onHMR(callback: (payload: any) => void) {
        this.listeners.push(callback);
    }

    /**
     * Trigger HMR (Called by Dev Server or WebSocket Client)
     */
    triggerHMR(payload: any) {
        this.listeners.forEach(fn => fn(payload));
    }
}
