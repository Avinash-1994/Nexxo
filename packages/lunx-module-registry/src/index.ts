/**
 * @lunx/module-registry
 *
 * Phase 1.11 — Browser-side MFE Module Registry
 *
 * API surface (additive, zero breaking changes):
 *   register(scope, url)     — register a remote scope + its entry URL
 *   load(scope, module)      — dynamically load a module from a remote scope
 *   invalidate(scope)        — drop a scope from the registry (triggers re-fetch)
 *   preload(scope)           — warm up a remote without importing a specific module
 *   getRegistry()            — return a snapshot of the current registry state
 *
 * Bootstrap:
 *   The `__lunx_registry_init__` script is injected once into the host page HTML.
 *   It creates globalThis.__lunx_registry__ and wires the public API.
 *   Remote scripts that call register() before the host page loads are queued
 *   and flushed when the registry initialises.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegistryEntry {
  /** URL of the remote's entry script (remoteEntry.js) */
  url: string;
  /** Load state */
  state: 'idle' | 'loading' | 'ready' | 'error';
  /** Resolved container object once loaded */
  container: RemoteContainer | null;
  /** In-flight promise so concurrent callers share one fetch */
  promise: Promise<RemoteContainer> | null;
  /** Timestamp of last successful load */
  loadedAt: number | null;
  /** Last error if state === 'error' */
  error: Error | null;
}

export interface RemoteContainer {
  name: string;
  init(sharedScope: unknown): void;
  get(moduleName: string): Promise<() => unknown>;
}

export interface RegistrySnapshot {
  scopes: Record<string, Omit<RegistryEntry, 'promise'>>;
}

// ─── Core registry class ──────────────────────────────────────────────────────

export class ModuleRegistry {
  private readonly _entries = new Map<string, RegistryEntry>();
  private readonly _sharedScope: Record<string, unknown>;

  constructor(sharedScope: Record<string, unknown> = {}) {
    this._sharedScope = sharedScope;
  }

  /**
   * Register a remote scope with its entry URL.
   * Calling register() a second time with the same scope+url is a no-op.
   * Calling with a different URL triggers invalidation + re-registration.
   */
  register(scope: string, url: string): void {
    const existing = this._entries.get(scope);

    if (existing && existing.url === url && existing.state !== 'error') {
      // Same URL, already known — no-op
      return;
    }

    if (existing && existing.url !== url) {
      // URL changed — invalidate first
      this.invalidate(scope);
    }

    this._entries.set(scope, {
      url,
      state: 'idle',
      container: null,
      promise: null,
      loadedAt: null,
      error: null,
    });
  }

  /**
   * Load a module from a remote scope.
   * Returns the module's export object.
   *
   * @example
   *   const { CartWidget } = await registry.load('cart', './CartWidget');
   */
  async load(scope: string, module: string): Promise<Record<string, unknown>> {
    const container = await this._loadContainer(scope);
    const factory = await container.get(module);
    const mod = factory();
    return mod as Record<string, unknown>;
  }

  /**
   * Warm up a remote scope — fetches and initialises the container
   * without importing a specific module. Useful for critical path preloading.
   */
  async preload(scope: string): Promise<RemoteContainer> {
    return this._loadContainer(scope);
  }

  /**
   * Invalidate a scope — drops the container so the next load() triggers
   * a fresh fetch. Does NOT remove the URL registration.
   */
  invalidate(scope: string): void {
    const entry = this._entries.get(scope);
    if (!entry) return;

    this._entries.set(scope, {
      ...entry,
      state: 'idle',
      container: null,
      promise: null,
      loadedAt: null,
      error: null,
    });
  }

  /**
   * Remove a scope from the registry entirely.
   * Use invalidate() to keep the URL but force a re-fetch.
   */
  deregister(scope: string): void {
    this._entries.delete(scope);
  }

  /**
   * Return a snapshot of the current registry state (safe to serialise).
   */
  getRegistry(): RegistrySnapshot {
    const scopes: RegistrySnapshot['scopes'] = {};
    for (const [scope, entry] of this._entries) {
      const { promise: _p, ...rest } = entry; // strip non-serialisable promise
      scopes[scope] = rest;
    }
    return { scopes };
  }

  /** Number of registered scopes */
  get size(): number {
    return this._entries.size;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private async _loadContainer(scope: string): Promise<RemoteContainer> {
    const entry = this._entries.get(scope);
    if (!entry) {
      throw new Error(
        `[lunx:registry] Unknown scope "${scope}". ` +
        `Call registry.register("${scope}", url) before loading modules from it. ` +
        `Registered scopes: ${[...this._entries.keys()].join(', ') || '(none)'}`
      );
    }

    // Already ready
    if (entry.state === 'ready' && entry.container) {
      return entry.container;
    }

    // In-flight — share the same promise
    if (entry.state === 'loading' && entry.promise) {
      return entry.promise;
    }

    // Start fetch
    const promise = this._fetchContainer(scope, entry);
    entry.state = 'loading';
    entry.promise = promise;

    try {
      const container = await promise;
      entry.state = 'ready';
      entry.container = container;
      entry.loadedAt = Date.now();
      entry.promise = null;
      entry.error = null;
      return container;
    } catch (err: any) {
      entry.state = 'error';
      entry.error = err;
      entry.promise = null;
      throw err;
    }
  }

  private _fetchContainer(scope: string, entry: RegistryEntry): Promise<RemoteContainer> {
    return new Promise<RemoteContainer>((resolve, reject) => {
      // Node.js / SSR environment — dynamic import
      if (typeof document === 'undefined') {
        import(/* @vite-ignore */ entry.url)
          .then((mod: any) => {
            const container: RemoteContainer = mod.default ?? mod[scope] ?? mod;
            this._initContainer(scope, container);
            resolve(container);
          })
          .catch(reject);
        return;
      }

      // Browser environment — <script type="module"> injection
      const existing = document.querySelector<HTMLScriptElement>(
        `script[data-lunx-scope="${scope}"]`
      );
      if (existing) {
        // Script already in DOM — wait for the container to appear on globalThis
        this._waitForContainer(scope, entry.url, resolve, reject);
        return;
      }

      const script = document.createElement('script');
      script.type = 'module';
      script.crossOrigin = 'anonymous';
      script.src = entry.url;
      script.dataset.lunxScope = scope;

      script.onload = () => {
        const container =
          (globalThis as any)[`lunx_remote_${scope}`] ??
          (globalThis as any)[scope];

        if (!container) {
          reject(
            new Error(
              `[lunx:registry] Remote "${scope}" loaded from ${entry.url} ` +
              `but no container found on globalThis. ` +
              `Ensure the remote was built with Lunx MF.`
            )
          );
          return;
        }

        this._initContainer(scope, container);
        resolve(container);
      };

      script.onerror = () => {
        reject(
          new Error(`[lunx:registry] Failed to load remote "${scope}" from ${entry.url}`)
        );
      };

      document.head.appendChild(script);
    });
  }

  private _initContainer(scope: string, container: RemoteContainer): void {
    if (typeof container.init === 'function') {
      try {
        container.init(this._sharedScope);
      } catch {
        // init() failures are non-fatal — shared scope may already be set
      }
    }
    // Expose on globalThis for webpack-compat host apps
    (globalThis as any)[`lunx_remote_${scope}`] = container;
  }

  private _waitForContainer(
    scope: string,
    _url: string,
    resolve: (c: RemoteContainer) => void,
    reject: (e: Error) => void,
    attempts = 0
  ): void {
    const container =
      (globalThis as any)[`lunx_remote_${scope}`] ??
      (globalThis as any)[scope];

    if (container) {
      this._initContainer(scope, container);
      resolve(container);
      return;
    }

    if (attempts > 50) {
      reject(new Error(`[lunx:registry] Timeout waiting for remote "${scope}" container`));
      return;
    }

    setTimeout(() => this._waitForContainer(scope, _url, resolve, reject, attempts + 1), 100);
  }
}

// ─── Singleton helper ─────────────────────────────────────────────────────────

/**
 * Returns the global registry instance (created once per page/process).
 * Shared between all imports of this module.
 */
export function getGlobalRegistry(): ModuleRegistry {
  const g = globalThis as any;
  if (!g.__lunx_registry__) {
    g.__lunx_registry__ = new ModuleRegistry(g.__lunx_shared__ ?? {});
    // Flush any calls buffered before the registry was ready
    if (Array.isArray(g.__lunx_registry_queue__)) {
      for (const { method, args } of g.__lunx_registry_queue__) {
        (g.__lunx_registry__ as any)[method]?.(...args);
      }
      g.__lunx_registry_queue__ = [];
    }
  }
  return g.__lunx_registry__;
}

// Convenience re-exports of the global instance methods
export const register   = (scope: string, url: string) => getGlobalRegistry().register(scope, url);
export const load       = (scope: string, module: string) => getGlobalRegistry().load(scope, module);
export const invalidate = (scope: string) => getGlobalRegistry().invalidate(scope);
export const preload    = (scope: string) => getGlobalRegistry().preload(scope);
export const getRegistry = () => getGlobalRegistry().getRegistry();
