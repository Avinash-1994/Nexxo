/**
 * @lunx/module-registry — Browser Runtime
 *
 * This module generates the `__lunx_registry_init__` inline script
 * that must be injected into the host page <head> BEFORE any remote
 * scripts are loaded.
 *
 * It does three things:
 *   1. Creates `globalThis.__lunx_registry__` (the ModuleRegistry singleton)
 *   2. Exposes the public API directly on globalThis for non-bundled callers
 *   3. Flushes any early register() / load() calls that arrived before init
 *
 * The generated script is < 2KB minified and has zero external dependencies.
 */

/**
 * Returns the inline <script> content for the registry bootstrap.
 *
 * Inject this string verbatim into a <script> tag before </head>.
 * It must run before any remote entry scripts execute.
 */
export function generateRegistryInitScript(): string {
  return `
// Lunx Module Registry — __lunx_registry_init__
// Phase 1.11 | https://lunx.dev/docs/module-registry
(function() {
  if (typeof globalThis.__lunx_registry__ !== 'undefined') return;

  // ── Queue: buffer early calls before registry is ready ──────────────────────
  var _queue = globalThis.__lunx_registry_queue__ = globalThis.__lunx_registry_queue__ || [];

  // ── Internal registry map: scope → entry ────────────────────────────────────
  var _entries = {};          // { [scope]: { url, state, container, promise } }
  var _sharedScope = globalThis.__lunx_shared__ || {};

  // ── init container ─────────────────────────────────────────────────────────
  function _initContainer(scope, container) {
    if (typeof container.init === 'function') {
      try { container.init(_sharedScope); } catch(e) { /* non-fatal */ }
    }
    globalThis['lunx_remote_' + scope] = container;
    globalThis[scope] = globalThis[scope] || container;
  }

  // ── fetch container via <script type=module> ────────────────────────────────
  function _fetch(scope) {
    var entry = _entries[scope];
    if (!entry) return Promise.reject(new Error('[lunx:registry] Unknown scope: ' + scope));
    if (entry.state === 'ready')   return Promise.resolve(entry.container);
    if (entry.state === 'loading') return entry.promise;

    var promise = new Promise(function(resolve, reject) {
      var existing = document.querySelector('script[data-lunx-scope="' + scope + '"]');
      if (!existing) {
        var s = document.createElement('script');
        s.type = 'module';
        s.crossOrigin = 'anonymous';
        s.src = entry.url;
        s.dataset.lunxScope = scope;
        s.onload = function() {
          var c = globalThis['lunx_remote_' + scope] || globalThis[scope];
          if (!c) {
            return reject(new Error('[lunx:registry] Remote "' + scope + '" has no container on globalThis after load.'));
          }
          _initContainer(scope, c);
          entry.state = 'ready'; entry.container = c; entry.promise = null;
          resolve(c);
        };
        s.onerror = function() {
          entry.state = 'error'; entry.promise = null;
          reject(new Error('[lunx:registry] Failed to load remote "' + scope + '" from ' + entry.url));
        };
        document.head.appendChild(s);
      } else {
        // Script already injected — poll until container appears
        var attempts = 0;
        (function poll() {
          var c = globalThis['lunx_remote_' + scope] || globalThis[scope];
          if (c) {
            _initContainer(scope, c);
            entry.state = 'ready'; entry.container = c; entry.promise = null;
            return resolve(c);
          }
          if (++attempts > 50) return reject(new Error('[lunx:registry] Timeout for scope "' + scope + '"'));
          setTimeout(poll, 100);
        })();
      }
    });

    entry.state = 'loading';
    entry.promise = promise;
    return promise;
  }

  // ── Public API ───────────────────────────────────────────────────────────────
  var _registry = {
    /** Register a remote scope + URL */
    register: function(scope, url) {
      var e = _entries[scope];
      if (e && e.url === url && e.state !== 'error') return; // no-op
      if (e && e.url !== url) _registry.invalidate(scope);   // URL changed
      _entries[scope] = { url: url, state: 'idle', container: null, promise: null };
    },

    /** Load a module from a remote scope */
    load: function(scope, module) {
      return _fetch(scope).then(function(container) {
        return container.get(module);
      }).then(function(factory) {
        return typeof factory === 'function' ? factory() : factory;
      });
    },

    /** Invalidate a scope — next load() will re-fetch */
    invalidate: function(scope) {
      var e = _entries[scope];
      if (!e) return;
      _entries[scope] = { url: e.url, state: 'idle', container: null, promise: null };
    },

    /** Preload a remote scope without importing a module */
    preload: function(scope) {
      return _fetch(scope);
    },

    /** Snapshot of the registry (JSON-safe) */
    getRegistry: function() {
      var scopes = {};
      Object.keys(_entries).forEach(function(k) {
        var e = _entries[k];
        scopes[k] = { url: e.url, state: e.state, loadedAt: e.loadedAt || null, error: e.error || null };
      });
      return { scopes: scopes };
    },

    /** Number of registered scopes */
    get size() { return Object.keys(_entries).length; }
  };

  globalThis.__lunx_registry__ = _registry;

  // Expose top-level helpers for non-bundled callers
  globalThis.__lunx_register__   = function(s, u) { return _registry.register(s, u); };
  globalThis.__lunx_load__       = function(s, m) { return _registry.load(s, m); };
  globalThis.__lunx_invalidate__ = function(s)    { return _registry.invalidate(s); };
  globalThis.__lunx_preload__    = function(s)    { return _registry.preload(s); };

  // Flush queued pre-init calls
  _queue.forEach(function(call) {
    if (typeof _registry[call.method] === 'function') {
      _registry[call.method].apply(_registry, call.args);
    }
  });
  globalThis.__lunx_registry_queue__ = [];
})();
`.trim();
}

/**
 * Returns the full <script> HTML tag ready to inject into index.html.
 */
export function generateRegistryInitTag(): string {
  return `<script id="__lunx_registry_init__">\n${generateRegistryInitScript()}\n</script>`;
}

/**
 * Inject the registry init script into an HTML string before </head>.
 * Safe to call multiple times — won't double-inject.
 */
export function injectRegistryIntoHTML(html: string): string {
  if (html.includes('__lunx_registry_init__')) return html; // already injected
  const tag = generateRegistryInitTag();
  if (html.includes('</head>')) {
    return html.replace('</head>', `${tag}\n</head>`);
  }
  // No </head> — prepend to body
  return tag + '\n' + html;
}
