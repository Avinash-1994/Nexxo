
import path from 'path';
import fs from 'fs/promises';
import { ModuleFormat, ConditionalExport } from './types.js';
import { explainReporter } from '../engine/events.js';

// Phase 1: Module Format & Conditional Export Resolution

/**
 * Detects module format based on file extension and package.json 'type'.
 */
export async function detectModuleFormat(filePath: string, pkgJson?: any): Promise<ModuleFormat> {
    const ext = path.extname(filePath);

    if (ext === '.mjs') return 'esm';
    if (ext === '.cjs') return 'cjs';
    if (ext === '.json') return 'json';

    if (ext === '.js' || ext === '.jsx' || ext === '.ts' || ext === '.tsx') {
        if (pkgJson && pkgJson.type === 'module') return 'esm';
        // Default to CJS for .js unless type: module
        // But for .ts, it is usually treated as ESM source or transpiled to target.
        // For interop purposes, we treat source as ESM usually.
        // Let's rely on package.json for ambiguity.
        return 'cjs';
    }

    return 'unknown';
}

/**
 * Resolves conditional exports from package.json based on environment conditions.
 */
export function resolveConditionalExports(
    exports: ConditionalExport | undefined,
    conditions: Set<string>
): string | undefined {
    if (!exports) return undefined;

    if (typeof exports === 'string') {
        return exports;
    }

    if (Array.isArray(exports)) {
        // Fallback array: return first match
        for (const item of exports) {
            const result = resolveConditionalExports(item, conditions);
            if (result) return result;
        }
        return undefined;
    }

    if (typeof exports === 'object') {
        for (const key of Object.keys(exports)) {
            if (conditions.has(key)) {
                return resolveConditionalExports(exports[key], conditions);
            }
        }
        // "default" condition usually last in object keys (or should be checked explicitly if logic requires key order)
        // Node.js specs say object iteration order is not guaranteed for keys strictly, 
        // but traditionally we check strict string matching conditions.
        // If "default" is in conditions, it will match.
    }

    return undefined;
}
