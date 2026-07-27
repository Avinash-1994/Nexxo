/**
 * S2.3 — Build Environment Isolation
 * Freezes process.env at build start. Validates all paths are within project root.
 * Prevents path traversal and symlink escape attacks.
 */
/** Freeze process.env at build start. Any mutation after this is a violation. */
export declare function freezeEnv(): Readonly<NodeJS.ProcessEnv>;
/**
 * Guard env access — expose only safe vars to plugins without env:read.
 * Called per-plugin based on their declared permissions.
 */
export declare function guardEnvAccess(key: string, hasEnvReadPermission: boolean): string | undefined;
/**
 * Validate that a resolved file path is within the project root.
 * Prevents path traversal attacks (../../etc/passwd patterns).
 */
export declare function validatePath(resolvedPath: string, projectRoot: string, options?: {
    allowNodeModules?: boolean;
}): boolean;
/**
 * Check if a path is a symlink escaping the project root.
 * Policy: 'project' = deny all external symlinks
 *         'node_modules' = allow symlinks within node_modules (default)
 *         'all' = allow all symlinks
 */
export declare function validateSymlink(symlinkPath: string, projectRoot: string, policy?: 'project' | 'node_modules' | 'all'): boolean;
/**
 * Isolate the build environment:
 * 1. Freeze process.env
 * 2. Return path validator bound to project root
 */
export declare function isolateBuildEnv(projectRoot: string): {
    env: Readonly<NodeJS.ProcessEnv>;
    validatePath: (p: string, opts?: {
        allowNodeModules?: boolean;
    }) => boolean;
    validateSymlink: (p: string, policy?: "project" | "node_modules" | "all") => boolean;
};
