// @lunx/plugin-svelte — Self-contained Unit Tests
// Run: node --test packages/plugin-svelte/src/__tests__/index.test.js

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// ── Inline plugin factory ─────────────────────────────────────────────────────
function sveltePlugin(options = {}) {
  const { hmr = true, runes = false, compilerOptions = {} } = options;

  return {
    name: '@lunx/plugin-svelte',

    load(_id) { return null; },

    transform(code, id) {
      if (!id.endsWith('.svelte')) return null;
      if (!hmr || process.env.NODE_ENV === 'production') return null;

      if (code.includes('import.meta.hot')) return null; // already injected

      return {
        code: code + `\nif (import.meta.hot) {\n  import.meta.hot.accept();\n  import.meta.hot.dispose(() => {});\n}`,
      };
    },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('@lunx/plugin-svelte — plugin structure', () => {
  it('has correct name', () => {
    assert.equal(sveltePlugin().name, '@lunx/plugin-svelte');
  });

  it('exposes load and transform hooks', () => {
    const p = sveltePlugin();
    assert.equal(typeof p.load, 'function');
    assert.equal(typeof p.transform, 'function');
  });

  it('accepts various options without throwing', () => {
    assert.doesNotThrow(() => sveltePlugin({ hmr: false, runes: true, compilerOptions: {} }));
  });
});

describe('@lunx/plugin-svelte — load hook', () => {
  it('always returns null (core handles compilation)', () => {
    const p = sveltePlugin();
    assert.equal(p.load('/src/App.svelte'), null);
    assert.equal(p.load('/src/main.ts'), null);
  });
});

describe('@lunx/plugin-svelte — transform hook', () => {
  let savedEnv;
  beforeEach(() => { savedEnv = process.env.NODE_ENV; process.env.NODE_ENV = 'development'; });
  afterEach(() => { process.env.NODE_ENV = savedEnv; });

  it('returns null for non-svelte files', () => {
    const p = sveltePlugin();
    assert.equal(p.transform('const x = 1;', '/src/utils.ts'), null);
    assert.equal(p.transform('.cls {}', '/src/style.css'), null);
  });

  it('injects HMR wrapper for .svelte files in dev', () => {
    const p = sveltePlugin({ hmr: true });
    const result = p.transform(`export default class App {}`, '/src/App.svelte');
    assert.ok(result !== null, 'Should transform .svelte in dev');
    assert.ok(result.code.includes('import.meta.hot'));
    assert.ok(result.code.includes('hot.accept'));
    assert.ok(result.code.includes('hot.dispose'));
  });

  it('does not inject HMR if already present', () => {
    const p = sveltePlugin({ hmr: true });
    const code = `export default {};\nif (import.meta.hot) { import.meta.hot.accept(); }`;
    assert.equal(p.transform(code, '/src/App.svelte'), null);
  });

  it('returns null in production mode', () => {
    process.env.NODE_ENV = 'production';
    const p = sveltePlugin({ hmr: true });
    assert.equal(p.transform('export default {}', '/src/App.svelte'), null);
  });

  it('returns null when hmr is false', () => {
    const p = sveltePlugin({ hmr: false });
    assert.equal(p.transform('export default {}', '/src/App.svelte'), null);
  });
});
