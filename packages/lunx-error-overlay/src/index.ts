/**
 * Phase 1.17 — Error Overlay
 *
 * Provides a rich, browser-rendered error overlay for the Lunx dev server:
 * - Visual UI with clear human-readable phrasing
 * - vscode:// deep links to exact file + line
 * - Auto-clears when the error is fixed (< 200ms)
 * - Supports: TypeScript, Vue, Svelte, Angular, Astro, CSS, missing imports
 */

export interface SourceLocation {
  file: string;
  line: number;
  column?: number;
}

export type ErrorKind =
  | 'typescript'
  | 'vue-sfc'
  | 'svelte'
  | 'angular'
  | 'astro'
  | 'css'
  | 'missing-import'
  | 'runtime';

export interface LunxError {
  kind: ErrorKind;
  message: string;
  location: SourceLocation;
  /** Formatted snippet of surrounding source lines */
  codeFrame?: string;
  /** Raw stack trace, if available */
  stack?: string;
}

// ─── vscode:// link generator ─────────────────────────────────────────────────

export function buildVSCodeLink(loc: SourceLocation): string {
  return `vscode://file/${loc.file}:${loc.line}:${loc.column ?? 1}`;
}

// ─── Human-readable message formatter ────────────────────────────────────────

const KIND_LABELS: Record<ErrorKind, string> = {
  'typescript': 'TypeScript Error',
  'vue-sfc': 'Vue SFC Error',
  'svelte': 'Svelte Compile Error',
  'angular': 'Angular Compile Error',
  'astro': 'Astro Error',
  'css': 'CSS Error',
  'missing-import': 'Module Not Found',
  'runtime': 'Runtime Error',
};

export function formatOverlayTitle(err: LunxError): string {
  return KIND_LABELS[err.kind] ?? 'Build Error';
}

export function formatOverlaySubtitle(err: LunxError): string {
  return `${err.location.file}:${err.location.line}${err.location.column != null ? `:${err.location.column}` : ''}`;
}

// ─── HTML overlay renderer ────────────────────────────────────────────────────

export function renderOverlayHTML(err: LunxError): string {
  const title = formatOverlayTitle(err);
  const subtitle = formatOverlaySubtitle(err);
  const vsLink = buildVSCodeLink(err.location);
  const codeFrame = err.codeFrame
    ? `<pre class="lunx-code-frame">${escapeHtml(err.codeFrame)}</pre>`
    : '';
  const stack = err.stack
    ? `<details><summary>Stack trace</summary><pre>${escapeHtml(err.stack)}</pre></details>`
    : '';

  return `
<div id="lunx-error-overlay" style="
  position:fixed;inset:0;z-index:99999;
  display:flex;align-items:center;justify-content:center;
  background:rgba(0,0,0,0.85);font-family:system-ui,sans-serif;">
  <div style="
    background:#1a1a2e;border:1px solid #e74c3c;border-radius:8px;
    max-width:800px;width:90%;max-height:90vh;overflow:auto;
    padding:24px;box-shadow:0 8px 32px rgba(0,0,0,0.6);">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <span style="color:#e74c3c;font-size:24px;">✖</span>
      <h2 style="color:#e74c3c;margin:0;font-size:18px;">${escapeHtml(title)}</h2>
    </div>
    <p style="color:#aaa;margin:0 0 8px;font-size:13px;">${escapeHtml(subtitle)}</p>
    <p style="color:#eee;margin:0 0 16px;font-size:15px;line-height:1.5;">${escapeHtml(err.message)}</p>
    ${codeFrame}
    <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap;">
      <a href="${vsLink}" style="
        background:#0d7377;color:#fff;padding:8px 16px;
        border-radius:4px;text-decoration:none;font-size:13px;">
        Open in VS Code
      </a>
      <button onclick="document.getElementById('lunx-error-overlay').remove()" style="
        background:#333;color:#ccc;border:none;padding:8px 16px;
        border-radius:4px;cursor:pointer;font-size:13px;">
        Dismiss
      </button>
    </div>
    ${stack}
  </div>
</div>`.trim();
}

// ─── Auto-clear client script ─────────────────────────────────────────────────

/** 
 * Script injected into the page that listens for the HMR 'update' event.
 * Removes the overlay within < 200ms when the error is resolved.
 */
export const AUTO_CLEAR_SCRIPT = `
(function() {
  if (typeof window.__lunx_hmr__ === 'undefined') return;
  window.__lunx_hmr__.on('update', function() {
    var overlay = document.getElementById('lunx-error-overlay');
    if (overlay) {
      requestAnimationFrame(function() { overlay.remove(); });
    }
  });
})();
`.trim();

// ─── Error parser utilities ───────────────────────────────────────────────────

export function parseErrorLocation(rawError: {
  message: string;
  file?: string;
  line?: number;
  column?: number;
  stack?: string;
}): SourceLocation {
  if (rawError.file && rawError.line != null) {
    return { file: rawError.file, line: rawError.line, column: rawError.column };
  }
  // Attempt to parse from stack trace: "at file.ts:12:5"
  if (rawError.stack) {
    const match = rawError.stack.match(/\(([^)]+):(\d+):(\d+)\)/);
    if (match) {
      return { file: match[1], line: parseInt(match[2]), column: parseInt(match[3]) };
    }
  }
  return { file: rawError.file ?? 'unknown', line: rawError.line ?? 0 };
}

export function classifyError(rawError: { message: string; file?: string }): ErrorKind {
  const msg = rawError.message.toLowerCase();
  const file = rawError.file?.toLowerCase() ?? '';
  if (file.endsWith('.vue') || msg.includes('vue sfc')) return 'vue-sfc';
  if (file.endsWith('.svelte') || msg.includes('svelte')) return 'svelte';
  if (file.endsWith('.astro') || msg.includes('astro')) return 'astro';
  if (msg.includes('cannot find module') || msg.includes('module not found')) return 'missing-import';
  if (file.endsWith('.css') || file.endsWith('.scss') || msg.includes('css')) return 'css';
  if (msg.includes('ng0') || msg.includes('@angular')) return 'angular';
  if (file.endsWith('.ts') || file.endsWith('.tsx')) return 'typescript';
  return 'runtime';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Main API ─────────────────────────────────────────────────────────────────

export function createOverlay(rawError: {
  message: string;
  file?: string;
  line?: number;
  column?: number;
  codeFrame?: string;
  stack?: string;
}): { html: string; vsCodeLink: string; clearScript: string } {
  const location = parseErrorLocation(rawError);
  const kind = classifyError(rawError);
  const err: LunxError = { kind, message: rawError.message, location, codeFrame: rawError.codeFrame, stack: rawError.stack };
  return {
    html: renderOverlayHTML(err),
    vsCodeLink: buildVSCodeLink(location),
    clearScript: AUTO_CLEAR_SCRIPT,
  };
}
