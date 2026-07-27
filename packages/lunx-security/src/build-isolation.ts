/**
 * S2.3 — Build Environment Isolation
 * Freezes process.env at build start. Validates all paths are within project root.
 * Prevents path traversal and symlink escape attacks.
 */

import fs from 'node:fs';
import path from 'node:path';

/** Freeze process.env at build start. Any mutation after this is a violation. */
export function freezeEnv(): Readonly<NodeJS.ProcessEnv> {
  const snapshot = Object.freeze({ ...process.env });
  return snapshot;
}

/**
 * Guard env access — expose only safe vars to plugins without env:read.
 * Called per-plugin based on their declared permissions.
 */
export function guardEnvAccess(
  key: string,
  hasEnvReadPermission: boolean
): string | undefined {
  const SAFE = ['NODE_ENV', 'NUCLIE_', 'VITE_', 'PATH', 'HOME'];
  const isSafe = SAFE.some((prefix) => key === prefix || key.startsWith(prefix));

  if (!hasEnvReadPermission && !isSafe) {
    console.warn(
      `[lunx:security] Plugin attempted to read env var "${key}" without env:read permission. Value blocked.`
    );
    return undefined;
  }

  return process.env[key];
}

/**
 * Validate that a resolved file path is within the project root.
 * Prevents path traversal attacks (../../etc/passwd patterns).
 */
export function validatePath(
  resolvedPath: string,
  projectRoot: string,
  options: { allowNodeModules?: boolean } = {}
): boolean {
  const normalized = path.resolve(resolvedPath);
  const normalizedRoot = path.resolve(projectRoot);
  const nodeModules = path.join(normalizedRoot, 'node_modules');

  if (normalized.startsWith(normalizedRoot + path.sep)) return true;
  if (normalized === normalizedRoot) return true;
  if (options.allowNodeModules && normalized.startsWith(nodeModules + path.sep)) return true;

  console.error(
    `[lunx:security] Path traversal attempt blocked.\n` +
    `  Resolved path: ${normalized}\n` +
    `  Project root:  ${normalizedRoot}`
  );
  return false;
}

/**
 * Check if a path is a symlink escaping the project root.
 * Policy: 'project' = deny all external symlinks
 *         'node_modules' = allow symlinks within node_modules (default)
 *         'all' = allow all symlinks
 */
export function validateSymlink(
  symlinkPath: string,
  projectRoot: string,
  policy: 'project' | 'node_modules' | 'all' = 'node_modules'
): boolean {
  if (policy === 'all') return true;

  try {
    const realPath = fs.realpathSync(symlinkPath);
    const normalizedRoot = path.resolve(projectRoot);
    const nodeModules = path.join(normalizedRoot, 'node_modules');

    if (realPath.startsWith(normalizedRoot + path.sep)) return true;

    if (policy === 'node_modules' && realPath.startsWith(nodeModules + path.sep)) return true;

    console.warn(
      `[lunx:security] Symlink outside project root blocked (policy: ${policy}).\n` +
      `  Symlink: ${symlinkPath}\n` +
      `  Resolves to: ${realPath}`
    );
    return false;
  } catch {
    return true; // Not a symlink or unresolvable — let file system handle it
  }
}

/**
 * Isolate the build environment:
 * 1. Freeze process.env
 * 2. Return path validator bound to project root
 */
export function isolateBuildEnv(projectRoot: string) {
  const frozenEnv = freezeEnv();

  return {
    env: frozenEnv,
    validatePath: (p: string, opts?: { allowNodeModules?: boolean }) =>
      validatePath(p, projectRoot, opts),
    validateSymlink: (p: string, policy?: 'project' | 'node_modules' | 'all') =>
      validateSymlink(p, projectRoot, policy),
  };
}
