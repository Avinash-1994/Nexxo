
import { ExportMap } from './types.js';
import { explainReporter } from '../engine/events.js';

// Phase 2: Static Export & Live Binding Analysis

/**
 * Analyzes source code (via regex/string scan for now, AST later) to determine exports.
 * 
 * NOTE: This is a simplified "light" parser for the verification phase.
 * In production (Module 5+), this would use `oxc-parser` or `swc` for full AST.
 */
export function analyzeExports(content: string, format: 'esm' | 'cjs'): ExportMap {
    const exports: ExportMap = {
        named: new Set(),
        hasDefault: false,
        isDynamic: false,
        liveBindings: false,
        reexports: {}
    };

    if (format === 'esm') {
        analyzeESM(content, exports);
    } else {
        analyzeCJS(content, exports);
    }

    // Report simplified findings
    if (exports.named.size > 0 || exports.hasDefault) {
        // explainReporter.report('interop', 'analysis', `Analyzed exports`, { named: exports.named.size, default: exports.hasDefault });
    }

    return exports;
}

function analyzeESM(content: string, map: ExportMap) {
    // 1. Default Export
    if (/export\s+default\s/.test(content)) {
        map.hasDefault = true;
    }

    // 2. Named Exports (const, function, class)
    // regex is naive but sufficient for proof
    const namedRegex = /export\s+(?:const|let|var|function|class)\s+([a-zA-Z0-9_$]+)/g;
    let match;
    while ((match = namedRegex.exec(content)) !== null) {
        map.named.add(match[1]);
        if (match[0].includes('let') || match[0].includes('var')) {
            map.liveBindings = true;
        }
    }

    // 3. Named Export List: export { foo, bar }
    const listRegex = /export\s*\{([^}]+)\}/g;
    while ((match = listRegex.exec(content)) !== null) {
        const body = match[1];
        body.split(',').forEach(part => {
            const name = part.trim().split(/\s+as\s+/)[1] || part.trim();
            if (name) map.named.add(name);
        });
        map.liveBindings = true; // export {} can export let/var binding
    }

    // 4. Re-exports: export * from ...
    if (/export\s*\*\s*from/.test(content)) {
        map.isDynamic = true; // '*' is effectively dynamic unless we resolve the other file
    }
}

function analyzeCJS(content: string, map: ExportMap) {
    // 1. module.exports = ...
    if (/module\.exports\s*=\s*/.test(content)) {
        map.hasDefault = true;
        // If assigning object literal, might have named properties too?
        // Simplistic assumption: Default only for now unless we statically analyze object structure.
        // Actually, if it's `module.exports = { foo }`, that's default.foo.
    }

    // 2. exports.foo = ...
    const namedRegex = /exports\.([a-zA-Z0-9_$]+)\s*=/g;
    let match;
    while ((match = namedRegex.exec(content)) !== null) {
        map.named.add(match[1]);
    }

    // 3. Object.defineProperty(exports, ...) - Live bindings!
    if (content.includes('Object.defineProperty') && content.includes('get')) {
        map.liveBindings = true;
    }

    // 4. Dynamic/Re-exports
    if (content.includes('require(')) {
        // CJS is inherently dynamic
        map.isDynamic = true;
    }
}
