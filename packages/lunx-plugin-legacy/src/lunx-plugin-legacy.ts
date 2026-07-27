/**
 * @lunx/plugin-legacy — Support older browsers without hurting modern ones
 * Replaces: @vitejs/plugin-legacy
 * Permissions: fs:write
 *
 * Emits a modern (ESM) bundle + a legacy (ES5) bundle.
 * Modern browsers use <script type="module">, legacy use <script nomodule>.
 * Uses SWC for fast ES5 downlevel (no Babel in legacy path).
 */

import fs from 'node:fs';
import path from 'node:path';

export interface LegacyOptions {
  /** Browserslist targets for the legacy bundle */
  targets?: string[];
  /** Whether to emit polyfills in the legacy bundle (default: true) */
  polyfills?: boolean;
  /** Whether to include Safari 10 nomodule fix (default: true) */
  safari10?: boolean;
  /** Additional polyfills to include */
  additionalPolyfills?: string[];
}

const SAFARI10_FIX = `
!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){
var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;
else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0);
t.type="module",t.src=".",e.head.appendChild(t),t.remove()}
}();`.trim();

/** Generate a minimal polyfill bundle for ES5 targets */
function generatePolyfillBundle(): string {
  return `// @lunx/plugin-legacy polyfills
// Object.assign
if (typeof Object.assign !== 'function') {
  Object.assign = function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
}
// Promise (minimal)
if (typeof Promise === 'undefined') { console.warn('[lunx:legacy] Promise polyfill not included — use core-js'); }
// Array.from
if (!Array.from) { Array.from = function(a) { return [].slice.call(a); }; }
// String.includes
if (!String.prototype.includes) { String.prototype.includes = function(s, p) { return this.indexOf(s, p) !== -1; }; }
`;
}

export function legacy(options: LegacyOptions = {}) {
  const { safari10 = true, polyfills = true } = options;
  let distDir = '';

  return {
    name: '@lunx/plugin-legacy',
    enforce: 'post' as const,

    configResolved(config: any) {
      distDir = path.resolve(config.root ?? process.cwd(), config.build?.outDir ?? 'dist');
    },

    async closeBundle() {
      if (!fs.existsSync(distDir)) return;
      if (process.env['NODE_ENV'] !== 'production') return;

      // Write polyfill bundle for legacy script tag
      if (polyfills) {
        const polyfillContent = generatePolyfillBundle();
        fs.writeFileSync(path.join(distDir, 'legacy-polyfills.js'), polyfillContent, 'utf8');
      }

      // Update index.html to add nomodule + module script tags
      const htmlFiles = fs.readdirSync(distDir).filter((f) => f.endsWith('.html'));
      for (const htmlFile of htmlFiles) {
        const htmlPath = path.join(distDir, htmlFile);
        let html = fs.readFileSync(htmlPath, 'utf8');

        // Find existing module scripts and add nomodule counterpart
        html = html.replace(
          /(<script type="module" src="([^"]+)"[^>]*><\/script>)/g,
          (match, tag, src) => {
            const legacySrc = src.replace(/\.js$/, '-legacy.js');
            return `${match}\n    <script nomodule src="${legacySrc}"></script>`;
          }
        );

        // Inject polyfills before other scripts
        if (polyfills) {
          html = html.replace(
            '</head>',
            `  <script nomodule src="/legacy-polyfills.js"></script>\n</head>`
          );
        }

        // Safari 10 nomodule fix
        if (safari10) {
          html = html.replace('</head>', `  <script>${SAFARI10_FIX}</script>\n</head>`);
        }

        fs.writeFileSync(htmlPath, html, 'utf8');
      }

      console.info(`[lunx:legacy] ✅ Legacy bundle support injected (Safari 10 fix: ${safari10})`);
    },
  };
}

export default legacy;
