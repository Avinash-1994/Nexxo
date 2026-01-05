
import path from 'path';

/**
 * Phase 1: Path Normalization
 * 
 * Ensures consistent paths across OS environments to guarantee graph determinism.
 * 
 * Rules:
 * 1. Always use forward slashes (POSIX style).
 * 2. Resolve to absolute paths internally, but use relative for ID generation where possible.
 * 3. No symlinks leaking (User must resolve them before passing, or we resolve here).
 * 4. Lowercase drive letters on Windows (c:/ vs C:/).
 */
export function normalizePath(p: string): string {
    // 1. Resolve to absolute path if not already
    let abs = path.isAbsolute(p) ? p : path.resolve(p);

    // 2. Normalize separators to forward slashes
    // We replace all backslashes first to handle mixed paths, then ensure consistency
    abs = abs.replace(/\\/g, '/');

    // 3. Handle Windows Drive Letters (c:/users... vs C:/Users...)
    if (/^[a-zA-Z]:\//.test(abs)) {
        abs = abs.charAt(0).toLowerCase() + abs.slice(1);
    }

    // 4. Remove trailing slashes unless root
    if (abs.length > 3 && abs.endsWith('/')) {
        abs = abs.slice(0, -1);
    }

    return abs;
}

/**
 * Generates a deterministic ID for a module based on its type and path.
 * 
 * In a real build, we might want IDs relative to root for portability.
 * For now, we use the normalized absolute path to ensure uniqueness within this machine.
 * 
 * Future improvement: Make IDs project-root relative for remote caching.
 */
import { canonicalHash } from '../core/engine/hash.js';

export function generateModuleId(type: 'file' | 'virtual' | 'css' | 'css-module' | 'style-asset' | 'css-in-js', normalizedPath: string, rootDir?: string): string {
    let key = normalizedPath;
    if (rootDir) {
        const normalizedRoot = normalizePath(rootDir);
        if (normalizedPath.startsWith(normalizedRoot)) {
            // path.relative on Windows expects native slashes to work reliably for drive letters
            const nativePath = normalizedPath.replace(/\//g, path.sep);
            const nativeRoot = normalizedRoot.replace(/\//g, path.sep);
            key = path.relative(nativeRoot, nativePath).replace(/\\/g, '/');
        }
    }

    // We hash the key (type + path) to get a fixed-length ID, 
    // or we could use the path directly if readability is preferred.
    // Spec says: "GraphNode.id = canonicalHash(type + normalizedPath)"
    return canonicalHash({ type, path: key });
}
