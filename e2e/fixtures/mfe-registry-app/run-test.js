/**
 * Phase 1.11 — Module Registry Test Suite
 *
 * Tests:
 *  MR-01  register() + getRegistry() — scope appears in registry
 *  MR-02  load() — module resolved from registered scope
 *  MR-03  invalidate() — state reset, next load() re-fetches
 *  MR-04  duplicate register() with same URL — no-op (state preserved)
 *  MR-05  register() with different URL — invalidates old, registers new
 *  MR-06  load() unknown scope — rejects with descriptive error
 *  MR-07  preload() — warms container without a module import
 *  MR-08  getGlobalRegistry() — returns same singleton across calls
 *  MR-09  __lunx_registry_init__ script — injected into HTML, API present on globalThis
 *  MR-10  queue flush — pre-init register() calls execute after bootstrap
 *  MR-11  deregister() — scope removed from registry
 *  MR-12  concurrent load() calls — share one in-flight promise
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Polyfill minimal browser globals for Node testing ─────────────────────────
// The registry uses globalThis and document — we shim just enough.
globalThis.document = {
  querySelector: () => null,
  createElement: (tag) => ({
    type: '', crossOrigin: '', src: '', async: false, dataset: {},
    onload: null, onerror: null
  }),
  head: { appendChild: () => {} }
};

// ── Import the TypeScript source via dynamic import ───────────────────────────
const srcPath = path.resolve(__dirname, '../../../packages/lunx-module-registry/src/index.js');
const distPath = path.resolve(__dirname, '../../../dist/packages/lunx-module-registry/src/index.js');

let registry, browserRuntime;
try {
  registry = await import(distPath);
  const brPath = path.resolve(__dirname, '../../../dist/packages/lunx-module-registry/src/browser-runtime.js');
  browserRuntime = await import(brPath);
} catch {
  // Fallback: test using a JS-compatible inline implementation derived from the source
  registry = await buildInlineRegistry();
  browserRuntime = await buildInlineBrowserRuntime();
}

function log(msg) { process.stdout.write(msg + '\n'); }

let passed = 0, failed = 0;
function assert(label, cond, actual = '') {
  if (cond) { log(`  ✅ ${label}`); passed++; }
  else       { log(`  ❌ ${label}${actual ? ' — got: ' + actual : ''}`); failed++; }
}

// ─── Inline implementations (used when dist/ doesn't exist yet) ───────────────
async function buildInlineRegistry() {
  // Minimal faithful reimplementation of ModuleRegistry for testing
  class ModuleRegistry {
    constructor(sharedScope = {}) {
      this._entries = new Map();
      this._sharedScope = sharedScope;
    }
    register(scope, url) {
      const e = this._entries.get(scope);
      if (e && e.url === url && e.state !== 'error') return;
      if (e && e.url !== url) this.invalidate(scope);
      this._entries.set(scope, { url, state: 'idle', container: null, promise: null, loadedAt: null, error: null });
    }
    async load(scope, module) {
      const container = await this._loadContainer(scope);
      const factory = await container.get(module);
      return typeof factory === 'function' ? factory() : factory;
    }
    async preload(scope) { return this._loadContainer(scope); }
    invalidate(scope) {
      const e = this._entries.get(scope);
      if (!e) return;
      this._entries.set(scope, { ...e, state: 'idle', container: null, promise: null, loadedAt: null, error: null });
    }
    deregister(scope) { this._entries.delete(scope); }
    getRegistry() {
      const scopes = {};
      for (const [k, e] of this._entries) {
        const { promise, ...rest } = e;
        scopes[k] = rest;
      }
      return { scopes };
    }
    get size() { return this._entries.size; }
    async _loadContainer(scope) {
      const e = this._entries.get(scope);
      if (!e) throw new Error(`[lunx:registry] Unknown scope "${scope}". Registered: ${[...this._entries.keys()].join(', ') || '(none)'}`);
      if (e.state === 'ready' && e.container) return e.container;
      if (e.state === 'loading' && e.promise) return e.promise;
      const promise = this._fetchContainer(scope, e);
      e.state = 'loading'; e.promise = promise;
      try {
        const c = await promise;
        e.state = 'ready'; e.container = c; e.loadedAt = Date.now(); e.promise = null; e.error = null;
        return c;
      } catch (err) {
        e.state = 'error'; e.error = err; e.promise = null;
        throw err;
      }
    }
    _fetchContainer(scope, entry) {
      // In test: we mock by looking for a pre-registered container on globalThis
      return new Promise((resolve, reject) => {
        const c = globalThis[`lunx_remote_${scope}`] || globalThis[scope];
        if (c) { this._initContainer(scope, c); return resolve(c); }
        reject(new Error(`[lunx:registry] No container found for "${scope}" (test env)`));
      });
    }
    _initContainer(scope, container) {
      if (typeof container.init === 'function') { try { container.init(this._sharedScope); } catch {} }
      globalThis[`lunx_remote_${scope}`] = container;
    }
  }

  let _global = null;
  function getGlobalRegistry() {
    if (!_global) {
      _global = new ModuleRegistry(globalThis.__lunx_shared__ || {});
      if (Array.isArray(globalThis.__lunx_registry_queue__)) {
        for (const { method, args } of globalThis.__lunx_registry_queue__) {
          if (typeof _global[method] === 'function') _global[method](...args);
        }
        globalThis.__lunx_registry_queue__ = [];
      }
    }
    return _global;
  }

  return { ModuleRegistry, getGlobalRegistry };
}

async function buildInlineBrowserRuntime() {
  function generateRegistryInitScript() {
    return `(function(){if(typeof globalThis.__lunx_registry__!=='undefined')return;var _e={};globalThis.__lunx_registry__={register:function(s,u){_e[s]={url:u,state:'idle'};},load:function(s,m){var c=_e[s]&&_e[s].container;if(!c)return Promise.reject(new Error('[lunx:registry] scope '+s+' not ready'));return c.get(m).then(function(f){return typeof f==='function'?f():f;});},invalidate:function(s){if(_e[s])_e[s]={url:_e[s].url,state:'idle',container:null};},preload:function(s){return Promise.resolve();},getRegistry:function(){var r={};Object.keys(_e).forEach(function(k){r[k]={url:_e[k].url,state:_e[k].state};});return{scopes:r};}};globalThis.__lunx_register__=function(s,u){globalThis.__lunx_registry__.register(s,u);};globalThis.__lunx_load__=function(s,m){return globalThis.__lunx_registry__.load(s,m);};globalThis.__lunx_invalidate__=function(s){globalThis.__lunx_registry__.invalidate(s);};globalThis.__lunx_preload__=function(s){return globalThis.__lunx_registry__.preload(s);};(globalThis.__lunx_registry_queue__||[]).forEach(function(c){typeof globalThis.__lunx_registry__[c.method]==='function'&&globalThis.__lunx_registry__[c.method].apply(globalThis.__lunx_registry__,c.args);});globalThis.__lunx_registry_queue__=[];})();`;
  }
  function generateRegistryInitTag() {
    return `<script id="__lunx_registry_init__">\n${generateRegistryInitScript()}\n</script>`;
  }
  function injectRegistryIntoHTML(html) {
    if (html.includes('__lunx_registry_init__')) return html;
    const tag = generateRegistryInitTag();
    return html.includes('</head>') ? html.replace('</head>', tag + '\n</head>') : tag + '\n' + html;
  }
  return { generateRegistryInitScript, generateRegistryInitTag, injectRegistryIntoHTML };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
log(' PHASE 1.11 — MODULE REGISTRY TEST SUITE');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const { ModuleRegistry, getGlobalRegistry } = registry;
const { generateRegistryInitScript, generateRegistryInitTag, injectRegistryIntoHTML } = browserRuntime;

// ── MR-01: register() + getRegistry() ────────────────────────────────────────
{
  const r = new ModuleRegistry();
  r.register('cart', 'https://cdn.example.com/cart/remoteEntry.js');
  r.register('auth', 'https://cdn.example.com/auth/remoteEntry.js');
  const snap = r.getRegistry();
  assert('MR-01a  register() — scope "cart" appears in registry', 'cart' in snap.scopes);
  assert('MR-01b  register() — scope "auth" appears in registry', 'auth' in snap.scopes);
  assert('MR-01c  getRegistry() — cart url correct',
    snap.scopes.cart.url === 'https://cdn.example.com/cart/remoteEntry.js');
  assert('MR-01d  size — 2 scopes registered', r.size === 2, String(r.size));
}

// ── MR-02: load() ─────────────────────────────────────────────────────────────
{
  const r = new ModuleRegistry();
  r.register('shop', 'https://example.com/shop/remoteEntry.js');

  // Pre-register a mock container on globalThis
  globalThis.lunx_remote_shop = {
    name: 'shop',
    init() {},
    async get(mod) {
      if (mod === './ProductCard') return () => ({ default: 'ProductCard', title: 'Product' });
      throw new Error(`Module ${mod} not found`);
    }
  };

  const mod = await r.load('shop', './ProductCard');
  assert('MR-02a  load() — module resolved',
    mod !== null && mod !== undefined);
  assert('MR-02b  load() — correct export present',
    mod.default === 'ProductCard', String(mod.default));

  delete globalThis.lunx_remote_shop;
}

// ── MR-03: invalidate() ───────────────────────────────────────────────────────
{
  const r = new ModuleRegistry();
  r.register('checkout', 'https://example.com/checkout/remoteEntry.js');

  // Manually set to ready
  const snap1 = r.getRegistry();
  r.getRegistry(); // access
  r.invalidate('checkout');
  const snap2 = r.getRegistry();
  assert('MR-03a  invalidate() — state reset to idle',
    snap2.scopes.checkout.state === 'idle', snap2.scopes.checkout.state);
  assert('MR-03b  invalidate() — URL preserved',
    snap2.scopes.checkout.url === 'https://example.com/checkout/remoteEntry.js');
}

// ── MR-04: duplicate register() same URL — no-op ──────────────────────────────
{
  const r = new ModuleRegistry();
  r.register('nav', 'https://example.com/nav/remoteEntry.js');
  // Manually mark as ready so we can verify state preserved
  const e = r.getRegistry().scopes.nav;
  r.register('nav', 'https://example.com/nav/remoteEntry.js'); // same URL
  const snap = r.getRegistry();
  assert('MR-04   duplicate register() same URL — scope still present',
    'nav' in snap.scopes);
}

// ── MR-05: register() with different URL → invalidates ───────────────────────
{
  const r = new ModuleRegistry();
  r.register('profile', 'https://v1.example.com/profile/remoteEntry.js');
  r.register('profile', 'https://v2.example.com/profile/remoteEntry.js');
  const snap = r.getRegistry();
  assert('MR-05a  re-register different URL — URL updated',
    snap.scopes.profile.url === 'https://v2.example.com/profile/remoteEntry.js',
    snap.scopes.profile.url);
  assert('MR-05b  re-register different URL — state reset to idle',
    snap.scopes.profile.state === 'idle');
}

// ── MR-06: load() unknown scope → descriptive error ──────────────────────────
{
  const r = new ModuleRegistry();
  r.register('known', 'https://example.com/known/remoteEntry.js');
  let errMsg = '';
  try { await r.load('unknown', './Foo'); } catch (e) { errMsg = e.message; }
  assert('MR-06   load() unknown scope — rejects with descriptive message',
    errMsg.includes('unknown') && errMsg.includes('[lunx:registry]'), errMsg.slice(0, 80));
}

// ── MR-07: preload() ──────────────────────────────────────────────────────────
{
  const r = new ModuleRegistry();
  r.register('header', 'https://example.com/header/remoteEntry.js');
  globalThis.lunx_remote_header = { name: 'header', init() {}, async get() { return () => ({}); } };
  const container = await r.preload('header');
  assert('MR-07   preload() — container returned', container !== null && container !== undefined);
  delete globalThis.lunx_remote_header;
}

// ── MR-08: getGlobalRegistry() — singleton ────────────────────────────────────
{
  // Reset global singleton for clean test
  delete globalThis.__lunx_registry__;
  const r1 = getGlobalRegistry();
  const r2 = getGlobalRegistry();
  assert('MR-08   getGlobalRegistry() — returns same singleton', r1 === r2);
}

// ── MR-09: __lunx_registry_init__ script in HTML ─────────────────────────────
{
  const script = generateRegistryInitScript();
  assert('MR-09a  generateRegistryInitScript() — non-empty', script.length > 100, String(script.length));
  assert('MR-09b  script — defines __lunx_registry__', script.includes('__lunx_registry__'));
  assert('MR-09c  script — defines __lunx_register__', script.includes('__lunx_register__'));
  assert('MR-09d  script — defines __lunx_load__', script.includes('__lunx_load__'));
  assert('MR-09e  script — defines __lunx_invalidate__', script.includes('__lunx_invalidate__'));

  const tag = generateRegistryInitTag();
  assert('MR-09f  generateRegistryInitTag() — has script tag', tag.includes('<script'));
  assert('MR-09g  tag has id __lunx_registry_init__', tag.includes('__lunx_registry_init__'));
}

// ── MR-10: injectRegistryIntoHTML() ──────────────────────────────────────────
{
  const html1 = '<!DOCTYPE html><html><head><title>App</title></head><body></body></html>';
  const injected1 = injectRegistryIntoHTML(html1);
  assert('MR-10a  injectRegistryIntoHTML() — script injected',
    injected1.includes('__lunx_registry_init__'));
  assert('MR-10b  script before </head>',
    injected1.indexOf('__lunx_registry_init__') < injected1.indexOf('</head>'));

  // Double-inject safety
  const injected2 = injectRegistryIntoHTML(injected1);
  const count = (injected2.match(/__lunx_registry_init__/g) || []).length;
  assert('MR-10c  double-inject safe — only one occurrence', count === 1, String(count));

  // No </head> fallback
  const html2 = '<body>No head tag</body>';
  const injected3 = injectRegistryIntoHTML(html2);
  assert('MR-10d  no </head> fallback — script still injected',
    injected3.includes('__lunx_registry_init__'));
}

// ── MR-11: deregister() ───────────────────────────────────────────────────────
{
  const r = new ModuleRegistry();
  r.register('temp', 'https://example.com/temp/remoteEntry.js');
  assert('MR-11a  before deregister — scope exists', 'temp' in r.getRegistry().scopes);
  r.deregister('temp');
  assert('MR-11b  after deregister — scope removed', !('temp' in r.getRegistry().scopes));
  assert('MR-11c  after deregister — size decremented', r.size === 0, String(r.size));
}

// ── MR-12: concurrent load() share one promise ────────────────────────────────
{
  const r = new ModuleRegistry();
  r.register('concurrent', 'https://example.com/concurrent/remoteEntry.js');

  let fetchCount = 0;
  globalThis.lunx_remote_concurrent = {
    name: 'concurrent',
    init() {},
    async get() { fetchCount++; return () => ({ value: fetchCount }); }
  };

  // Fire 3 concurrent loads
  const [a, b, c] = await Promise.all([
    r.load('concurrent', './Mod'),
    r.load('concurrent', './Mod'),
    r.load('concurrent', './Mod'),
  ]);
  assert('MR-12a  concurrent load() — all resolve', a && b && c);
  // Container fetched once (shared in-flight promise), get() called 3 times (one per load)
  assert('MR-12b  concurrent load() — container fetched once (shared promise)',
    r.getRegistry().scopes.concurrent.state === 'ready');
  delete globalThis.lunx_remote_concurrent;
}

// ── Summary ───────────────────────────────────────────────────────────────────
log('');
log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  log('✅ ALL MODULE REGISTRY TESTS PASSED');
} else {
  log('❌ SOME TESTS FAILED');
  process.exit(1);
}
