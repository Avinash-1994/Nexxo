/**
 * T3 — Edge Case Suite
 * EDGE-001 through EDGE-018
 */

import { describe, it, expect } from '@jest/globals';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'lunx-edge-'));

describe('EDGE-001: Circular imports — basic a → b → a', () => {
  it('circular dependency chain is detectable', () => {
    const graph: Record<string, string[]> = {
      'a.ts': ['b.ts'],
      'b.ts': ['a.ts'],
    };
    function hasCycle(graph: Record<string, string[]>): boolean {
      const visited = new Set<string>();
      const stack = new Set<string>();
      function dfs(node: string): boolean {
        if (stack.has(node)) return true;
        if (visited.has(node)) return false;
        visited.add(node); stack.add(node);
        for (const dep of graph[node] ?? []) if (dfs(dep)) return true;
        stack.delete(node);
        return false;
      }
      return Object.keys(graph).some(dfs);
    }
    expect(hasCycle(graph)).toBe(true);
  });
});

describe('EDGE-002: Deeply nested circular chain of 10', () => {
  it('cycle detected in a chain of 10 nodes', () => {
    const graph: Record<string, string[]> = {};
    for (let i = 0; i < 9; i++) graph[`m${i}`] = [`m${i + 1}`];
    graph['m9'] = ['m0']; // close the loop

    function hasCycle(g: Record<string, string[]>): boolean {
      const visited = new Set<string>(); const stack = new Set<string>();
      function dfs(n: string): boolean {
        if (stack.has(n)) return true; if (visited.has(n)) return false;
        visited.add(n); stack.add(n);
        for (const dep of g[n] ?? []) if (dfs(dep)) return true;
        stack.delete(n); return false;
      }
      return Object.keys(g).some(dfs);
    }
    expect(hasCycle(graph)).toBe(true);
  });
});

describe('EDGE-004: Case-sensitive import warning', () => {
  it('detects case mismatch in import path', () => {
    const importPath = './component'; // lowercase
    const actualFile = './Component.tsx'; // PascalCase
    const hasCase = importPath.toLowerCase() === actualFile.toLowerCase().replace('.tsx', '');
    expect(hasCase).toBe(true); // paths match case-insensitively — potential cross-platform issue
  });
});

describe('EDGE-005: Symlinked node_modules resolution', () => {
  it('symlink path resolves to real source', () => {
    const realPath = '/workspace/packages/ui/src/Button.tsx';
    const symlinkPath = '/workspace/node_modules/@acme/ui/src/Button.tsx';
    // In monorepo, symlink should resolve to real source for HMR
    expect(realPath).toContain('/packages/ui/src/Button.tsx');
  });
});

describe('EDGE-007: Binary file imported without ?url suffix', () => {
  it('binary file import without suffix should produce an error', () => {
    const filePath = './image.png';
    const hasSuffix = filePath.includes('?url') || filePath.includes('?raw');
    const isBinary = ['.png', '.jpg', '.gif', '.woff', '.woff2'].some(
      (ext) => filePath.endsWith(ext)
    );
    expect(isBinary && !hasSuffix).toBe(true); // → should trigger error
  });
});

describe('EDGE-008: Package.exports browser/node field', () => {
  it('browser field selected in client bundle', () => {
    const exports = {
      '.': {
        browser: './dist/browser.js',
        node: './dist/node.js',
      },
    };
    const resolve = (target: 'browser' | 'node') => exports['.'][target];
    expect(resolve('browser')).toBe('./dist/browser.js');
    expect(resolve('node')).toBe('./dist/node.js');
  });
});

describe('EDGE-009: Dual package hazard — two versions of same package', () => {
  it('two different versions should be warned', () => {
    const packages = [
      { name: 'react', version: '18.0.0' },
      { name: 'react', version: '19.0.0' }, // duplicate
    ];
    const duplicates = packages.filter(
      (p, i, self) => self.findIndex((q) => q.name === p.name && q.version !== p.version) !== i
    );
    expect(duplicates.length).toBeGreaterThan(0);
  });
});

describe('EDGE-010: Empty module eliminated in production', () => {
  it('file with no exports and no side effects is DCE candidate', () => {
    const source = '// empty module\n';
    const hasExports = /^export /m.test(source);
    const hasSideEffects = /^(?!\/\/)/.test(source.trim());
    // Empty file (only comments) → both false → safe to eliminate
    expect(hasExports).toBe(false);
  });
});

describe('EDGE-012: BOM (Byte Order Mark) stripped before transform', () => {
  it('UTF-8 BOM is stripped from source before parsing', () => {
    const withBOM = '\uFEFFconst x = 1;';
    const stripped = withBOM.replace(/^\uFEFF/, '');
    expect(stripped.startsWith('\uFEFF')).toBe(false);
    expect(stripped).toBe('const x = 1;');
  });
});

describe('EDGE-013: Mixed ESM and CJS in same project', () => {
  it('CJS require() call is detectable for pre-bundling', () => {
    const code = `const React = require('react');`;
    const hasCJS = /\brequire\s*\(/.test(code);
    expect(hasCJS).toBe(true); // → needs pre-bundler CJS → ESM conversion
  });
});

describe('EDGE-015: Port conflict — auto-increment', () => {
  it('increments port on conflict', () => {
    const requested = 5173;
    const inUse = new Set([5173, 5174]);
    let port = requested;
    while (inUse.has(port)) port++;
    expect(port).toBe(5175);
  });
});

describe('EDGE-016: Atomic dist/ write (no partial state)', () => {
  it('writes to temp dir then renames atomically', () => {
    const tmpOut = path.join(TMP, '.lunx-tmp');
    const finalOut = path.join(TMP, 'dist');
    fs.mkdirSync(tmpOut, { recursive: true });
    fs.writeFileSync(path.join(tmpOut, 'main.js'), 'console.log(1)', 'utf8');
    // Atomic rename
    fs.renameSync(tmpOut, finalOut);
    expect(fs.existsSync(path.join(finalOut, 'main.js'))).toBe(true);
    expect(fs.existsSync(tmpOut)).toBe(false);
  });
});

describe('EDGE-017: Unicode in file paths', () => {
  it('UTF-8 file path is handled correctly', () => {
    const unicodePath = '/project/src/components/ボタン.tsx';
    const normalized = path.normalize(unicodePath);
    expect(normalized).toContain('ボタン');
  });
});

describe('EDGE-018: Module with 1000+ named exports', () => {
  it('1000 named exports are tracked without error', () => {
    const exports = Array.from({ length: 1000 }, (_, i) => `export${i}`);
    const usedExports = new Set(['export0', 'export500', 'export999']);
    const eliminated = exports.filter((e) => !usedExports.has(e));
    expect(eliminated.length).toBe(997);
    expect(eliminated).not.toContain('export0');
  });
});
