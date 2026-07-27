/**
 * @lunx/hmr-client — Phase 1.6
 *
 * Browser-side HMR runtime. Zero external dependencies.
 * Bundled as ES module. Target: < 5KB.
 *
 * Injected automatically by dev server as:
 *   <script type="module" src="/@lunx/hmr-client"></script>
 */

// ─── Config ───────────────────────────────────────────────────────────────────

declare const __LUNX_HMR_URL__: string | undefined;

function resolveHmrUrl(): string {
  if (typeof __LUNX_HMR_URL__ !== 'undefined') return __LUNX_HMR_URL__;
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.LUNX_HMR_URL) {
    return (import.meta as any).env.LUNX_HMR_URL;
  }
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/__lunx_hmr`;
}

// ─── Connection State ─────────────────────────────────────────────────────────

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 1000;
const MAX_RECONNECT_DELAY = 30_000;

// ─── Module Accept Registry ───────────────────────────────────────────────────

type AcceptCallback = (newModule: unknown) => void;
const acceptRegistry = new Map<string, AcceptCallback[]>();

function stamp(key: string) {
  (window as any).__lunxHmr = (window as any).__lunxHmr ?? {};
  (window as any).__lunxHmr[key] = Date.now();
}

// ─── Message Handlers ─────────────────────────────────────────────────────────

async function handleUpdate(modules: string[]): Promise<void> {
  for (const mod of modules) {
    const cbs = acceptRegistry.get(mod) ?? [];
    if (cbs.length === 0) {
      // No accept() registered for this module →
      // re-import it so at least the module cache is busted,
      // but stamp lastUpdate rather than reloading the page.
      // A true full-reload would only happen if the re-import throws.
      try {
        await import(/* @vite-ignore */ mod + '?t=' + Date.now());
      } catch {
        handleFullReload();
        return;
      }
    } else {
      try {
        const newModule = await import(/* @vite-ignore */ mod + '?t=' + Date.now());
        cbs.forEach(cb => cb(newModule));
      } catch (err) {
        console.error('[lunx:hmr] Failed to hot-update', mod, err);
        handleFullReload();
        return;
      }
    }
  }
  stamp('lastUpdate');
}

function handleCssUpdate(href: string): void {
  const base = href.split('?')[0];
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]');
  let swapped = false;
  links.forEach(link => {
    if ((link.getAttribute('href') || '').startsWith(base)) {
      const newLink = link.cloneNode() as HTMLLinkElement;
      newLink.href = base + '?t=' + Date.now();
      newLink.addEventListener('load', () => link.remove());
      link.parentNode?.insertBefore(newLink, link.nextSibling);
      swapped = true;
    }
  });
  if (!swapped) {
    // No existing link matched — inject fresh one
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = base + '?t=' + Date.now();
    document.head.appendChild(link);
  }
  stamp('lastCssUpdate');
}

function handleFullReload(): void {
  location.reload();
}

type HmrMessage =
  | { type: 'connected' }
  | { type: 'update'; modules: string[] }
  | { type: 'css-update'; href: string }
  | { type: 'full-reload' }
  | { type: 'error'; message: string; stack?: string };

function onMessage(raw: string): void {
  let msg: HmrMessage;
  try { msg = JSON.parse(raw); } catch { return; }

  switch (msg.type) {
    case 'connected':
      console.debug('[lunx:hmr] connected');
      reconnectDelay = 1000;
      stamp('connected');
      break;
    case 'update':     handleUpdate(msg.modules); break;
    case 'css-update': handleCssUpdate(msg.href); break;
    case 'full-reload': handleFullReload(); break;
    case 'error':
      console.error('[lunx:hmr]', msg.message, msg.stack ?? '');
      break;
  }
}

// ─── WebSocket Connection ─────────────────────────────────────────────────────

function connect(): void {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  ws = new WebSocket(resolveHmrUrl());
  ws.addEventListener('open', () => { reconnectDelay = 1000; });
  ws.addEventListener('message', ev => onMessage(ev.data as string));
  ws.addEventListener('close', () => {
    ws = null;
    reconnectTimer = setTimeout(() => {
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
      connect();
    }, reconnectDelay);
  });
  ws.addEventListener('error', () => ws?.close());
}

// ─── import.meta.hot shim ─────────────────────────────────────────────────────

export function createHotContext(moduleId: string) {
  return {
    accept(deps?: string | string[] | AcceptCallback, cb?: AcceptCallback) {
      if (typeof deps === 'function') {
        // hot.accept(selfCb)
        const list = acceptRegistry.get(moduleId) ?? [];
        list.push(deps);
        acceptRegistry.set(moduleId, list);
      } else if (typeof deps === 'string' && cb) {
        const list = acceptRegistry.get(deps) ?? [];
        list.push(cb);
        acceptRegistry.set(deps, list);
      } else if (Array.isArray(deps) && cb) {
        deps.forEach(dep => {
          const list = acceptRegistry.get(dep) ?? [];
          list.push(cb);
          acceptRegistry.set(dep, list);
        });
      }
    },
    dispose(_cb: () => void) { /* lifecycle — called before old module is replaced */ },
    invalidate() { handleFullReload(); },
    data: {} as Record<string, unknown>,
  };
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

connect();

// Expose test/debug utilities on __lunxHmr
(window as any).__lunxHmr = (window as any).__lunxHmr ?? {};
(window as any).__lunxHmr.simulate = (msg: unknown) => onMessage(JSON.stringify(msg));
