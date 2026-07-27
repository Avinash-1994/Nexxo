/**
 * S2.1 — Plugin Permission Model
 * Wraps plugin hook calls in a permission-checked proxy.
 * Plugins must declare permissions in package.json under lunx.permissions.
 */
export type PluginPermission = 'fs:read' | 'fs:write' | 'net:fetch' | 'env:read' | 'exec:spawn' | 'config:modify';
export interface PluginPermissions {
    declared: PluginPermission[];
    name: string;
}
/**
 * Load a plugin's declared permissions from its package.json.
 */
export declare function loadPluginPermissions(pluginPkgJsonPath: string, pluginName: string): PluginPermissions;
/**
 * Create a permission-checked proxy wrapping a plugin's hook context.
 * In dev: warn + allow. In prod: error + abort for undeclared permissions.
 */
export declare function createPluginPermissionProxy<T extends object>(ctx: T, permissions: PluginPermissions, options: {
    mode: 'development' | 'production';
    logDir?: string;
}): T;
/** List installed Lunx plugins with their declared permissions for audit. */
export declare function auditPluginPermissions(pluginPackagePaths: string[]): {
    name: string;
    permissions: PluginPermission[];
    dangerous: boolean;
}[];
