import { BuildConfig, BuildConfigSchema } from './index.js';
import { log } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

export interface ConfigUpdate {
    path: string; // dot notation path, e.g. "server.port"
    value: any;
}

export class LiveConfigManager {
    private currentSessionToken: string = '';
    private currentConfig: BuildConfig;
    private cwd: string;
    private listeners: ((config: BuildConfig) => void)[] = [];
    private protectedPaths = new Set([
        'root',
        'plugins',
        'esbuildPlugins',
        'server.host',
        'server.https',
        'server.proxy'
    ]);

    private lastUpdateTimestamp: number = 0;
    private readonly RATE_LIMIT_MS: number = 500; // Max 2 updates per second

    constructor(initialConfig: BuildConfig, cwd: string) {
        this.currentConfig = initialConfig;
        this.cwd = cwd;
        // Generate a random token for this session
        this.currentSessionToken = Math.random().toString(36).substring(2, 15);
    }

    public getSessionToken(): string {
        return this.currentSessionToken;
    }

    public getConfig(): BuildConfig {
        return { ...this.currentConfig };
    }

    public updateConfig(update: ConfigUpdate, token?: string): boolean {
        // Security Gate 0: Rate Limiting
        const now = Date.now();
        if (now - this.lastUpdateTimestamp < this.RATE_LIMIT_MS) {
            log.warn('Config update rejected: Rate limit exceeded');
            return false;
        }

        // Security Gate 1: Session Token Verification
        if (token !== this.currentSessionToken) {
            log.error('Config update rejected: Invalid session token (CSRF Protection)');
            return false;
        }

        // Security Gate 2: Protected Path Check
        if (this.protectedPaths.has(update.path)) {
            log.error(`Config update rejected: Path "${update.path}" is protected for security reasons.`);
            return false;
        }

        try {
            const newConfig = { ...this.currentConfig };
            this.setDeepValue(newConfig, update.path, update.value);

            // Security Gate 3: Schema Validation
            // @ts-ignore - Schema matches BuildConfig
            const result = BuildConfigSchema.safeParse(newConfig);
            if (!result.success) {
                log.error(`Invalid config update for ${update.path}: ${result.error.message}`);
                return false;
            }

            this.currentConfig = result.data as BuildConfig;
            this.lastUpdateTimestamp = Date.now();
            this.notifyListeners();
            return true;
        } catch (e) {
            log.error(`Failed to update config: ${e instanceof Error ? e.message : String(e)}`);
            return false;
        }
    }

    public subscribe(callback: (config: BuildConfig) => void) {
        this.listeners.push(callback);
    }

    private notifyListeners() {
        this.listeners.forEach(cb => cb(this.currentConfig));
    }

    private setDeepValue(obj: any, path: string, value: any) {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    }

    public async persist(): Promise<void> {
        const configPath = path.join(this.cwd, 'urja.config.json');
        await fs.writeFile(configPath, JSON.stringify(this.currentConfig, null, 2), 'utf-8');
        log.info(`Live configuration persisted to ${configPath}`);
    }
}
