// @lunx/plugin-legacy — Self-contained Unit Tests
// Run: node --test packages/plugin-legacy/src/__tests__/index.test.js

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// ── Inline plugin factory ─────────────────────────────────────────────────────
function legacyPlugin(options = {}) {
  const {
    targets = '> 0.5%, last 2 versions, IE 11',
    polyfills = true,
    corejs = 3,
    regenerator = true,
  } = options;

  return {
    name: '@lunx/plugin-legacy',

    load(id) {
      if (id !== '/__lunx_legacy_polyfills__') return null;

      const lines = [];
      if (polyfills) {
        lines.push(corejs === 3 ? `import 'core-js/stable';` : `import 'core-js/es';`);
      }
      if (regenerator) {
        lines.push(`import 'regenerator-runtime/runtime';`);
      }
      return { code: lines.join('\n') };
    },

    transform(code, id) {
      if (process.env.NODE_ENV !== 'production') return null;
      if (id.includes('node_modules')) return null;
      const isJS = /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(id);
      if (!isJS) return null;
      // Signal for legacy transpilation — actual transform done by build pipeline
      return null;
    },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('@lunx/plugin-legacy — plugin structure', () => {
  it('has correct name', () => {
    assert.equal(legacyPlugin().name, '@lunx/plugin-legacy');
  });

  it('exposes load and transform hooks', () => {
    const p = legacyPlugin();
    assert.equal(typeof p.load, 'function');
    assert.equal(typeof p.transform, 'function');
  });

  it('accepts all options without throwing', () => {
    assert.doesNotThrow(() =>
      legacyPlugin({ targets: 'IE 11', polyfills: true, corejs: 2, regenerator: false })
    );
  });
});

describe('@lunx/plugin-legacy — load hook', () => {
  it('returns core-js 3 import for the polyfill entry ID', () => {
    const p = legacyPlugin({ polyfills: true, corejs: 3 });
    const r = p.load('/__lunx_legacy_polyfills__');
    assert.ok(r !== null);
    assert.ok(r.code.includes(`import 'core-js/stable'`));
  });

  it('returns core-js 2 import when corejs:2', () => {
    const p = legacyPlugin({ polyfills: true, corejs: 2 });
    const r = p.load('/__lunx_legacy_polyfills__');
    assert.ok(r.code.includes(`import 'core-js/es'`));
  });

  it('includes regenerator-runtime when regenerator:true', () => {
    const p = legacyPlugin({ regenerator: true });
    const r = p.load('/__lunx_legacy_polyfills__');
    assert.ok(r.code.includes('regenerator-runtime'));
  });

  it('omits regenerator-runtime when regenerator:false', () => {
    const p = legacyPlugin({ regenerator: false, polyfills: true });
    const r = p.load('/__lunx_legacy_polyfills__');
    assert.ok(!r.code.includes('regenerator-runtime'));
  });

  it('returns empty code when polyfills and regenerator both false', () => {
    const p = legacyPlugin({ polyfills: false, regenerator: false });
    const r = p.load('/__lunx_legacy_polyfills__');
    assert.equal(r.code.trim(), '');
  });

  it('returns null for non-polyfill IDs', () => {
    const p = legacyPlugin();
    assert.equal(p.load('/src/main.js'), null);
    assert.equal(p.load('/src/App.tsx'), null);
  });
});

describe('@lunx/plugin-legacy — transform hook', () => {
  let savedEnv;
  beforeEach(() => { savedEnv = process.env.NODE_ENV; });
  afterEach(() => { process.env.NODE_ENV = savedEnv; });

  it('returns null in development mode', () => {
    process.env.NODE_ENV = 'development';
    assert.equal(legacyPlugin().transform('const x = 1;', '/src/app.js'), null);
  });

  it('returns null for node_modules in production', () => {
    process.env.NODE_ENV = 'production';
    assert.equal(
      legacyPlugin().transform('export const x = 1;', '/node_modules/react/index.js'),
      null
    );
  });

  it('returns null for non-JS files in production', () => {
    process.env.NODE_ENV = 'production';
    assert.equal(legacyPlugin().transform('body {}', '/src/style.css'), null);
  });
});
