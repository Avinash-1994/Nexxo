// @lunx/plugin-visualizer — Self-contained Unit Tests
// Run: node --test packages/plugin-visualizer/src/__tests__/index.test.js

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Inline plugin factory ─────────────────────────────────────────────────────
function visualizerPlugin(options = {}) {
  const {
    filename = 'dist/stats.html',
    title = 'Lunx Bundle Visualizer',
    open = false,
    template = 'treemap',
    gzipSize = true,
  } = options;

  const modules = [];

  return {
    name: '@lunx/plugin-visualizer',
    _modules: modules,        // exposed for test assertions
    _options: { filename, title, open, template, gzipSize },

    load(_id) { return null; },

    transform(code, id) {
      // Passthrough — only collect module size metadata
      if (!id.includes('node_modules') && !id.startsWith('\0')) {
        modules.push({
          id: id.replace(process.cwd?.() ?? '', ''),
          size: Buffer.byteLength(code, 'utf8'),
          chunkName: 'main',
        });
      }
      return null;
    },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('@lunx/plugin-visualizer — plugin structure', () => {
  it('has correct name', () => {
    assert.equal(visualizerPlugin().name, '@lunx/plugin-visualizer');
  });

  it('exposes load and transform hooks', () => {
    const p = visualizerPlugin();
    assert.equal(typeof p.load, 'function');
    assert.equal(typeof p.transform, 'function');
  });

  it('uses correct defaults', () => {
    const p = visualizerPlugin();
    assert.equal(p._options.filename, 'dist/stats.html');
    assert.equal(p._options.title, 'Lunx Bundle Visualizer');
    assert.equal(p._options.open, false);
    assert.equal(p._options.template, 'treemap');
    assert.equal(p._options.gzipSize, true);
  });

  it('accepts custom options', () => {
    const p = visualizerPlugin({ filename: 'out/report.html', title: 'My Bundle', open: true });
    assert.equal(p._options.filename, 'out/report.html');
    assert.equal(p._options.title, 'My Bundle');
    assert.equal(p._options.open, true);
  });
});

describe('@lunx/plugin-visualizer — load hook', () => {
  it('returns null for all IDs', () => {
    const p = visualizerPlugin();
    assert.equal(p.load('/src/App.tsx'), null);
    assert.equal(p.load('/__lunx_entry__'), null);
    assert.equal(p.load('/node_modules/react/index.js'), null);
  });
});

describe('@lunx/plugin-visualizer — transform hook (passthrough)', () => {
  it('always returns null — pure data-collection side effect', () => {
    const p = visualizerPlugin();
    assert.equal(p.transform('export const x = 1;', '/src/utils.ts'), null);
    assert.equal(p.transform('body {}', '/src/style.css'), null);
    assert.equal(p.transform('{}', '/src/data.json'), null);
  });

  it('records module size after transform call', () => {
    const p = visualizerPlugin();
    const code = 'export const greeting = "hello world";';
    p.transform(code, '/src/greet.ts');

    const recorded = p._modules.find(m => m.id.includes('greet.ts'));
    assert.ok(recorded, 'Module should be recorded');
    assert.equal(recorded.chunkName, 'main');
    assert.ok(recorded.size > 0, 'Size should be greater than 0');
    assert.equal(recorded.size, Buffer.byteLength(code, 'utf8'));
  });

  it('skips node_modules from module list', () => {
    const p = visualizerPlugin();
    p.transform('export default {}', '/node_modules/lodash/index.js');
    const found = p._modules.find(m => m.id.includes('lodash'));
    assert.equal(found, undefined, 'Should not record node_modules');
  });

  it('accumulates multiple modules', () => {
    const p = visualizerPlugin();
    p.transform('const a = 1;', '/src/a.ts');
    p.transform('const b = 2;', '/src/b.ts');
    p.transform('const c = 3;', '/src/c.ts');
    assert.equal(p._modules.length, 3);
  });
});
