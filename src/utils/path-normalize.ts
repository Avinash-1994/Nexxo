
/**
 * Nexxo Path Normalization Utility
 * Ensures consistent behavior across Windows (win32) and Unix (posix)
 * Day 25: Legacy Polyfills & Windows Lock
 */

import * as path from 'path';

export class PathOps {
    /**
     * Normalize paths to POSIX style (forward slashes)
     * Essential for Rollup plugin IDs and Manifest keys
     */
    static normalize(p: string): string {
        // Handle Windows backslashes
        const normalized = p.replace(/\\/g, '/');

        // Handle Driver letters (C:/...) -> /c:/... or similar if needed for URLs
        // But mostly we just want forward slashes for internal IDs
        return normalized;
    }

    /**
     * Join paths and normalize result
     */
    static join(...paths: string[]): string {
        return this.normalize(path.join(...paths));
    }

    /**
     * Resolve path and normalize result
     */
    static resolve(...paths: string[]): string {
        return this.normalize(path.resolve(...paths));
    }

    /**
     * Check if path is absolute (Cross-platform)
     */
    static isAbsolute(p: string): boolean {
        return path.isAbsolute(p);
    }
}
