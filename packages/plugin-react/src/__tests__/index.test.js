// @lunx/plugin-react — Self-contained Unit Tests
// Run: node --test packages/plugin-react/src/__tests__/index.test.js
// No compilation required.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Inline plugin factory (mirrors src/index.ts) ─────────────────────────────
function reactPlugin(options = {}) {
  const { fastRefresh = true, runtime = 'automatic', overlay = true } = options;

  return {
    name: '@lunx/plugin-react',

    load(id) {
      if (id === '/__lunx_react_refresh__') {
        return {
          code: `import RefreshRuntime from 'react-refresh/runtime';
RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
window.__lunx_react_refresh_active__ = true;`,
        };
      }
      return null;
    },

    transform(code, id) {
      const isJSX = /\.(jsx|tsx)$/.test(id);
      if (!isJSX) return null;
      if (id.includes('node_modules')) return null;

      if (fastRefresh) {
        const hasReactComponent = /export\s+(default\s+function|function\s+[A-Z]|const\s+[A-Z])/.test(code);
        if (hasReactComponent) {
          return {
            code: code + `\nif (import.meta.hot) { import.meta.hot.accept(); }`,
          };
        }
      }
      return null;
    },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('@lunx/plugin-react — plugin structure', () => {
  it('has correct name', () => {
    const p = reactPlugin();
    assert.equal(p.name, '@lunx/plugin-react');
  });

  it('exposes load and transform hooks', () => {
    const p = reactPlugin();
    assert.equal(typeof p.load, 'function');
    assert.equal(typeof p.transform, 'function');
  });

  it('accepts options without throwing', () => {
    assert.doesNotThrow(() => reactPlugin({ fastRefresh: false, runtime: 'classic', overlay: false }));
  });
});

describe('@lunx/plugin-react — load hook', () => {
  it('returns React Refresh preamble for the special ID', () => {
    const p = reactPlugin();
    const result = p.load('/__lunx_react_refresh__');
    assert.ok(result, 'Should return something');
    assert.ok(result.code.includes('RefreshRuntime'), 'Should contain RefreshRuntime');
    assert.ok(result.code.includes('injectIntoGlobalHook'), 'Should call injectIntoGlobalHook');
    assert.ok(result.code.includes('$RefreshReg$'), 'Should set $RefreshReg$');
  });

  it('returns null for regular file paths', () => {
    const p = reactPlugin();
    assert.equal(p.load('/src/App.tsx'), null);
    assert.equal(p.load('/src/main.tsx'), null);
  });

  it('returns null for node_modules', () => {
    const p = reactPlugin();
    assert.equal(p.load('/node_modules/react/index.js'), null);
  });
});

describe('@lunx/plugin-react — transform hook', () => {
  it('returns null for CSS files', () => {
    const p = reactPlugin();
    assert.equal(p.transform('body { color: red; }', '/src/App.css'), null);
  });

  it('returns null for JSON files', () => {
    const p = reactPlugin();
    assert.equal(p.transform('{}', '/src/data.json'), null);
  });

  it('returns null for node_modules JSX files', () => {
    const p = reactPlugin();
    assert.equal(p.transform('export default function X(){}', '/node_modules/lib/Comp.jsx'), null);
  });

  it('injects HMR accept for JSX with a React component export', () => {
    const p = reactPlugin({ fastRefresh: true });
    const code = `export default function MyButton() { return null; }`;
    const result = p.transform(code, '/src/MyButton.tsx');
    assert.ok(result !== null, 'Should transform component files');
    assert.ok(result.code.includes('import.meta.hot'), 'Should inject HMR accept');
  });

  it('returns null for utility files without React component exports', () => {
    const p = reactPlugin({ fastRefresh: true });
    const code = `export function formatDate(d) { return d.toString(); }`;
    assert.equal(p.transform(code, '/src/utils.tsx'), null);
  });

  it('returns null when fastRefresh is disabled', () => {
    const p = reactPlugin({ fastRefresh: false });
    const code = `export default function App() { return null; }`;
    assert.equal(p.transform(code, '/src/App.tsx'), null);
  });
});
