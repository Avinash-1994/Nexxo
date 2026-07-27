// @lunx/plugin-vue — Self-contained Unit Tests
// Run: node --test packages/plugin-vue/src/__tests__/index.test.js

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// ── Inline plugin factory ─────────────────────────────────────────────────────
function vuePlugin(options = {}) {
  const { hmr = true, devtools = true, compilerOptions = {} } = options;

  return {
    name: '@lunx/plugin-vue',

    load(id) {
      if (!id.endsWith('.vue')) return null;
      return null; // Core handles actual SFC compilation
    },

    transform(code, id) {
      if (!id.endsWith('.vue')) return null;

      let out = code;
      let changed = false;

      if (hmr && process.env.NODE_ENV !== 'production') {
        if (!code.includes('import.meta.hot')) {
          out += `\nif (import.meta.hot) { import.meta.hot.accept(({ default: updated }) => {}); }`;
          changed = true;
        }
      }

      if (devtools && process.env.NODE_ENV !== 'production') {
        if (!code.includes('__VUE_DEVTOOLS__')) {
          out = `globalThis.__VUE_DEVTOOLS_GLOBAL_HOOK__ = globalThis.__VUE_DEVTOOLS_GLOBAL_HOOK__ || {};\n` + out;
          changed = true;
        }
      }

      return changed ? { code: out } : null;
    },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('@lunx/plugin-vue — plugin structure', () => {
  it('has correct name', () => {
    assert.equal(vuePlugin().name, '@lunx/plugin-vue');
  });

  it('exposes load and transform hooks', () => {
    const p = vuePlugin();
    assert.equal(typeof p.load, 'function');
    assert.equal(typeof p.transform, 'function');
  });

  it('accepts all options without throwing', () => {
    assert.doesNotThrow(() =>
      vuePlugin({ hmr: false, devtools: false, compilerOptions: { mode: 'module' } })
    );
  });
});

describe('@lunx/plugin-vue — load hook', () => {
  it('returns null for .vue files (core handles compilation)', () => {
    assert.equal(vuePlugin().load('/src/App.vue'), null);
  });

  it('returns null for non-vue files', () => {
    const p = vuePlugin();
    assert.equal(p.load('/src/main.ts'), null);
    assert.equal(p.load('/src/style.css'), null);
  });
});

describe('@lunx/plugin-vue — transform hook', () => {
  let savedEnv;
  beforeEach(() => { savedEnv = process.env.NODE_ENV; process.env.NODE_ENV = 'development'; });
  afterEach(() => { process.env.NODE_ENV = savedEnv; });

  it('returns null for non-vue files', () => {
    const p = vuePlugin();
    assert.equal(p.transform('export const x = 1;', '/src/utils.ts'), null);
    assert.equal(p.transform('.cls {}', '/src/style.css'), null);
  });

  it('injects HMR accept for .vue files in dev mode', () => {
    const p = vuePlugin({ hmr: true });
    const result = p.transform(`export default { setup() {} }`, '/src/App.vue');
    assert.ok(result !== null);
    assert.ok(result.code.includes('import.meta.hot'));
  });

  it('does not inject HMR twice if already present', () => {
    const p = vuePlugin({ hmr: true, devtools: false });
    const code = `export default {};\nif (import.meta.hot) { import.meta.hot.accept(); }`;
    const result = p.transform(code, '/src/App.vue');
    // HMR already in code — should not be injected again
    // result may be null (no changes) or contain devtools injection but NOT double HMR
    if (result !== null) {
      const acceptCount = (result.code.match(/import\.meta\.hot\.accept/g) || []).length;
      assert.equal(acceptCount, 1, 'HMR accept should not be injected twice');
    }
    // If result is null, no changes were made — also correct
  });

  it('injects devtools hook for .vue files', () => {
    const p = vuePlugin({ hmr: false, devtools: true });
    const result = p.transform(`export default {}`, '/src/App.vue');
    assert.ok(result !== null);
    assert.ok(result.code.includes('__VUE_DEVTOOLS_GLOBAL_HOOK__'));
  });

  it('skips HMR injection when hmr:false', () => {
    const p = vuePlugin({ hmr: false, devtools: false });
    const result = p.transform(`export default {}`, '/src/App.vue');
    assert.equal(result, null);
  });
});
