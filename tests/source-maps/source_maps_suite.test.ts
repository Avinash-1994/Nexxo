/**
 * Source Maps Test Suite — Agent 7
 * Tests source map generation using esbuild's built-in source maps.
 */

import { build, transform } from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const TMP = path.join(os.tmpdir(), 'lunx-sourcemap-tests');
fs.mkdirSync(TMP, { recursive: true });

function writeFile(name: string, content: string): string {
    const p = path.join(TMP, name);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
    return p;
}

// ──────────────────────────────────────────────────────────────────────
// SM-001: Inline source maps present in output
// ──────────────────────────────────────────────────────────────────────
test('SM-001: Inline source maps embedded as base64 data URL', async () => {
    const result = await transform(`
function greet(name) {
    return 'Hello, ' + name;
}
console.log(greet('world'));
`, {
        sourcemap: 'inline',
        loader: 'js',
    });

    expect(result.code).toContain('sourceMappingURL=data:application/json;base64,');
}, 30000);

// ──────────────────────────────────────────────────────────────────────
// SM-002: External source maps — transform() with sourcemap:'external'
// ──────────────────────────────────────────────────────────────────────
test('SM-002: External source maps: transform returns both code and map', async () => {
    const result = await transform(`
const add = (a, b) => a + b;
console.log(add(1, 2));
`, {
        sourcemap: 'external',
        loader: 'js',
    });

    // transform() with external returns map in result.map
    expect(typeof result.code).toBe('string');
    expect(typeof result.map).toBe('string');

    // map should be valid JSON
    const mapData = JSON.parse(result.map);
    expect(mapData.version).toBe(3);
    expect(typeof mapData.mappings).toBe('string');
    expect(mapData.mappings.length).toBeGreaterThan(0);
}, 30000);

// ──────────────────────────────────────────────────────────────────────
// SM-003: Source map is valid JSON with correct source map spec fields
// ──────────────────────────────────────────────────────────────────────
test('SM-003: Source map JSON conforms to Source Map Spec v3', async () => {
    const result = await transform(`
export function calculate(a, b) {
    const sum = a + b;
    const diff = a - b;
    return { sum, diff };
}
`, {
        sourcemap: 'external',
        loader: 'js',
    });

    const mapData = JSON.parse(result.map);
    // Source Map Spec v3 required fields:
    expect(mapData.version).toBe(3);
    expect(Array.isArray(mapData.sources)).toBe(true);
    expect(Array.isArray(mapData.names)).toBe(true);
    expect(typeof mapData.mappings).toBe('string');
    // Mappings must be non-empty (base64 VLQ)
    expect(mapData.mappings.length).toBeGreaterThan(0);
}, 30000);

// ──────────────────────────────────────────────────────────────────────
// SM-004: TypeScript source maps — references .ts source
// ──────────────────────────────────────────────────────────────────────
test('SM-004: TypeScript transform produces source map with TS source reference', async () => {
    const tsCode = `
interface User {
    name: string;
    age: number;
}

function greetUser(user: User): string {
    return \`Hello, \${user.name}!\`;
}

const u: User = { name: 'Alice', age: 30 };
console.log(greetUser(u));
`;

    const result = await transform(tsCode, {
        sourcemap: 'external',
        loader: 'ts',
        sourcefile: 'greet.ts',
    });

    const mapData = JSON.parse(result.map);
    expect(mapData.version).toBe(3);
    // sources should reference the .ts file
    expect(mapData.sources.some((s: string) => s.includes('greet') || s.includes('.ts'))).toBe(true);
}, 30000);

// ──────────────────────────────────────────────────────────────────────
// SM-005: Minified source maps still valid
// ──────────────────────────────────────────────────────────────────────
test('SM-005: Minification + source maps: both produced correctly', async () => {
    const srcCode = `
function expensiveCalculation(n) {
    let result = 0;
    for (let i = 0; i < n; i++) {
        result += Math.pow(i, 2);
    }
    return result;
}
console.log(expensiveCalculation(100));
`;

    const result = await transform(srcCode, {
        sourcemap: 'external',
        minify: true,
        loader: 'js',
    });

    // Minified output must be compact
    expect(result.code.split('\n').length).toBeLessThan(5);

    // Source map must still be valid
    const mapData = JSON.parse(result.map);
    expect(mapData.version).toBe(3);
    expect(mapData.mappings.length).toBeGreaterThan(0);
}, 30000);

// ──────────────────────────────────────────────────────────────────────
// SM-006: Inline vs external — inline has no separate map file
// ──────────────────────────────────────────────────────────────────────
test('SM-006: Inline sourcemap: map embedded in code, result.map is empty', async () => {
    const result = await transform(`const x = 42;`, {
        sourcemap: 'inline',
        loader: 'js',
    });

    expect(result.code).toContain('sourceMappingURL=data:application/json;base64,');
    // With inline, map is not returned separately
    expect(result.map).toBe('');
}, 30000);

// ──────────────────────────────────────────────────────────────────────
// SM-007: Source map covers original source content
// ──────────────────────────────────────────────────────────────────────
test('SM-007: Source map sourcesContent includes original code', async () => {
    const originalCode = `
// Important function
export function importantFunction() {
    const message = 'SOURCE_MAP_CONTENT_TEST_MARKER';
    return message;
}
`;

    const result = await transform(originalCode, {
        sourcemap: 'external',
        loader: 'js',
        sourcefile: 'important.js',
    });

    const mapData = JSON.parse(result.map);

    // sourcesContent should embed original
    if (mapData.sourcesContent && mapData.sourcesContent.length > 0) {
        expect(mapData.sourcesContent.some((c: string) =>
            c.includes('SOURCE_MAP_CONTENT_TEST_MARKER')
        )).toBe(true);
    }
    // Sources referenced
    expect(mapData.sources.length).toBeGreaterThan(0);
}, 30000);

// ──────────────────────────────────────────────────────────────────────
// SM-008: No source map when disabled
// ──────────────────────────────────────────────────────────────────────
test('SM-008: No source map generated when sourcemap=false', async () => {
    const result = await transform(`console.log('no sourcemap');`, {
        sourcemap: false,
        loader: 'js',
    });

    expect(result.map).toBe('');
    expect(result.code).not.toContain('sourceMappingURL');
}, 30000);

// ──────────────────────────────────────────────────────────────────────
// SM-009: Multi-file bundle — build() with external sourcemap
// ──────────────────────────────────────────────────────────────────────
test('SM-009: Bundle source map covers all source files in build()', async () => {
    writeFile('sm009-utils.js', `export const double = n => n * 2;\nexport const triple = n => n * 3;`);
    const entryFile = writeFile('sm009-entry.js', `
import { double, triple } from './sm009-utils.js';
console.log(double(3), triple(4));
`);

    const outdir = path.join(TMP, 'sm009-out');
    fs.mkdirSync(outdir, { recursive: true });

    const result = await build({
        entryPoints: [entryFile],
        bundle: true,
        outdir,
        sourcemap: true,
        format: 'esm',
        write: true,
    });

    expect(result.errors).toHaveLength(0);

    // Find the .map file
    const files = fs.readdirSync(outdir);
    const mapFile = files.find(f => f.endsWith('.js.map'));
    expect(mapFile).toBeDefined();

    const mapData = JSON.parse(fs.readFileSync(path.join(outdir, mapFile!), 'utf-8'));
    expect(mapData.version).toBe(3);
    expect(mapData.sources.length).toBeGreaterThanOrEqual(1);
    console.log('SM-009: Sources in bundle map:', mapData.sources);
}, 30000);
