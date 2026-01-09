
import { fastHash } from '../../native/index.js';

/**
 * Single Source of Truth for Hashing
 * 
 * Guarantees:
 * - Deterministic output via canonical stringify
 * - Ultra-fast hashing via Native XXH3 (Phase 4.2)
 */
export function canonicalHash(value: unknown): string {
    const canonicalString = stableStringify(value);
    return fastHash(canonicalString);
}

function stableStringify(value: unknown): string {
    if (value === null || value === undefined) {
        return String(value);
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    if (typeof value === 'string') {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return '[' + value.map(stableStringify).join(',') + ']';
    }

    if (typeof value === 'object') {
        const keys = Object.keys(value as object).sort();
        const parts = keys.map(k => {
            const v = (value as any)[k];
            // Skip undefined values to match JSON behavior or keep them unique?
            // Usually explicit is better for hashing, but let's stick to standard strictness.
            if (v === undefined) return '';
            return `${JSON.stringify(k)}:${stableStringify(v)}`;
        }).filter(x => x !== '');
        return '{' + parts.join(',') + '}';
    }

    return String(value);
}
