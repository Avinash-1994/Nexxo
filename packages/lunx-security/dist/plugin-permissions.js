/**
 * S2.1 — Plugin Permission Model
 * Wraps plugin hook calls in a permission-checked proxy.
 * Plugins must declare permissions in package.json under lunx.permissions.
 */
import fs from 'node:fs';
import path from 'node:path';
const DANGEROUS_PERMISSIONS = ['exec:spawn', 'net:fetch', 'config:modify'];
/** Safe env vars always visible (no env:read needed) */
const SAFE_ENV_PREFIXES = ['NUCLIE_', 'NODE_ENV', 'VITE_'];
const BLOCKED_ENV_PATTERNS = [/^AWS_/, /^SECRET_/, /^TOKEN_/, /^GH_/, /^NPM_TOKEN/];
function logViolation(pluginName, operation, logDir) {
    const msg = `[${new Date().toISOString()}] PLUGIN VIOLATION: ${pluginName} attempted ${operation} without permission`;
    console.warn(`[lunx:security] ${msg}`);
    if (logDir) {
        const logPath = path.join(logDir, 'plugin-violations.log');
        fs.mkdirSync(logDir, { recursive: true });
        fs.appendFileSync(logPath, msg + '\n', 'utf8');
    }
}
/**
 * Load a plugin's declared permissions from its package.json.
 */
export function loadPluginPermissions(pluginPkgJsonPath, pluginName) {
    try {
        const pkg = JSON.parse(fs.readFileSync(pluginPkgJsonPath, 'utf8'));
        const declared = pkg?.lunx?.permissions ?? [];
        return { declared, name: pluginName };
    }
    catch {
        return { declared: [], name: pluginName };
    }
}
/**
 * Create a permission-checked proxy wrapping a plugin's hook context.
 * In dev: warn + allow. In prod: error + abort for undeclared permissions.
 */
export function createPluginPermissionProxy(ctx, permissions, options) {
    const { declared, name } = permissions;
    const { mode, logDir } = options;
    return new Proxy(ctx, {
        get(target, prop, receiver) {
            const val = target[prop];
            // Guard env access
            if (prop === 'env' || prop === 'process') {
                if (!declared.includes('env:read')) {
                    logViolation(name, 'env:read', logDir);
                    if (mode === 'production') {
                        throw new Error(`[lunx:security] Plugin "${name}" requires env:read permission.`);
                    }
                    // dev: return filtered env
                    return buildFilteredEnv();
                }
            }
            if (typeof val === 'function') {
                // Bind to the proxy (receiver) so internal `this` accesses are still proxied
                return function (...args) {
                    return val.apply(receiver, args);
                };
            }
            return val;
        },
    });
}
function buildFilteredEnv() {
    const filtered = {};
    for (const [key, val] of Object.entries(process.env)) {
        const safe = SAFE_ENV_PREFIXES.some((prefix) => key.startsWith(prefix));
        const blocked = BLOCKED_ENV_PATTERNS.some((p) => p.test(key));
        if (safe && !blocked)
            filtered[key] = val;
    }
    // Always include NODE_ENV
    filtered['NODE_ENV'] = process.env['NODE_ENV'];
    return filtered;
}
/** List installed Lunx plugins with their declared permissions for audit. */
export function auditPluginPermissions(pluginPackagePaths) {
    return pluginPackagePaths.map((p) => {
        const perms = loadPluginPermissions(p, path.basename(path.dirname(p)));
        return {
            name: perms.name,
            permissions: perms.declared,
            dangerous: perms.declared.some((d) => DANGEROUS_PERMISSIONS.includes(d)),
        };
    });
}
