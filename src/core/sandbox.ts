import vm from 'vm';
import fs from 'fs';
import path from 'path';
import { PermissionManager } from './permissions.js';


function normalizePathForPermission(filePath: fs.PathOrFileDescriptor): string {
    if (typeof filePath === 'string') return filePath;
    if (filePath instanceof URL) return filePath.pathname;
    if (Buffer.isBuffer(filePath)) return filePath.toString();
    throw new Error('File descriptor access is not allowed in sandbox.');
}

export class PluginSandbox {
    private context: vm.Context;
    private permissionManager: PermissionManager;

    constructor(permissionManager: PermissionManager) {
        this.permissionManager = permissionManager;
        this.context = this.createContext();
    }

    private createContext(): vm.Context {
        const sandbox = {
            console: {
                log: (...args: any[]) => console.log('[Plugin]', ...args),
                error: (...args: any[]) => console.error('[Plugin Error]', ...args),
                warn: (...args: any[]) => console.warn('[Plugin Warn]', ...args),
                info: (...args: any[]) => console.info('[Plugin Info]', ...args),
            },
            process: {
                env: new Proxy({}, {
                    get: (_target, prop) => {
                        const key = String(prop);
                        if (this.permissionManager.canAccessEnv(key)) {
                            return process.env[key];
                        }
                        return undefined;
                    }
                }),
                cwd: () => process.cwd(),
            },
            require: (moduleName: string) => {
                if (moduleName === 'fs') {
                    return this.createFsProxy();
                }
                if (moduleName === 'path') {
                    return path;
                }
                throw new Error(`Access to module '${moduleName}' is denied.`);
            },
            module: { exports: {} },
            exports: {},
            Buffer,
            URL,
            TextEncoder,
            TextDecoder,
            setTimeout,
            clearTimeout,
            setInterval,
            clearInterval,
            // Explicitly remove network globals from plugin context
            fetch: undefined,
            XMLHttpRequest: undefined,
            WebSocket: undefined,
            EventSource: undefined,
            WebAssembly,
        };

        const context = vm.createContext(sandbox);
        context.globalThis = context;
        return context;
    }

    private createFsProxy() {
        return {
            readFileSync: (...args: Parameters<typeof fs.readFileSync>) => {
                const [filePath] = args;
                const normalizedPath = normalizePathForPermission(filePath);
                if (!this.permissionManager.canRead(normalizedPath)) {
                    throw new Error(`Read access denied: ${normalizedPath}`);
                }
                return fs.readFileSync(...args);
            },
            writeFileSync: (...args: Parameters<typeof fs.writeFileSync>) => {
                const [filePath] = args;
                const normalizedPath = normalizePathForPermission(filePath);
                if (!this.permissionManager.canWrite(normalizedPath)) {
                    throw new Error(`Write access denied: ${normalizedPath}`);
                }
                return fs.writeFileSync(...args);
            },
            // Add other fs methods as needed
        };
    }

    run(code: string, filename: string = 'plugin.js'): any {
        const script = new vm.Script(code, { filename });
        try {
            script.runInContext(this.context, { timeout: 1000 });
        } catch (error) {
            throw new Error(`Sandbox execution failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        return this.context.module.exports;
    }
}
