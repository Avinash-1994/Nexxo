
/**
 * Lunx Environment API
 * Unified Runtime for Browser, Node, and Edge
 * Day 26: Environment API Lock
 */

export interface EnvConfig {
    mode: 'development' | 'production';
    ssr: boolean;
    base: string;
}

export class LunxEnv {
    private static instance: LunxEnv;
    public config: EnvConfig;
    private listeners: Function[] = [];

    private constructor(config: EnvConfig) {
        this.config = config;
    }

    static init(config: EnvConfig): LunxEnv {
        if (!LunxEnv.instance) {
            LunxEnv.instance = new LunxEnv(config);
        }
        return LunxEnv.instance;
    }

    static get(): LunxEnv {
        if (!LunxEnv.instance) {
            throw new Error('LunxEnv not initialized');
        }
        return LunxEnv.instance;
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
