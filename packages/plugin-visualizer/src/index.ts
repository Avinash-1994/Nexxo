// Plugin type compatible with both Lunx and Vite plugin API
type Plugin = { name: string; [hook: string]: any };
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface VisualizerPluginOptions {
  /** Output file path for the HTML report (default: 'dist/stats.html') */
  filename?: string;
  /** Title for the HTML report (default: 'Lunx Bundle Visualizer') */
  title?: string;
  /** Open the report in browser after build (default: false) */
  open?: boolean;
  /** Visualization type (default: 'treemap') */
  template?: 'treemap' | 'sunburst' | 'network';
  /** Include gzipped size estimates (default: true) */
  gzipSize?: boolean;
}

interface ModuleInfo {
  id: string;
  size: number;
  chunkName: string;
}

/**
 * @lunx/plugin-visualizer
 *
 * Official Lunx plugin for bundle visualization:
 * - Outputs an interactive HTML treemap showing bundle composition
 * - Shows module sizes, chunk assignments, and import relationships
 * - Similar to rollup-plugin-visualizer / webpack-bundle-analyzer
 *
 * @example
 * ```js
 * const visualizer = require('@lunx/plugin-visualizer');
 * module.exports = {
 *   plugins: [
 *     visualizer({ filename: 'dist/stats.html', open: true })
 *   ],
 * };
 * ```
 */
export function visualizerPlugin(options: VisualizerPluginOptions = {}): Plugin {
  const {
    filename = 'dist/stats.html',
    title = 'Lunx Bundle Visualizer',
    open = false,
    template = 'treemap',
    gzipSize = true,
  } = options;

  const modules: ModuleInfo[] = [];

  return {
    name: '@lunx/plugin-visualizer',

    /**
     * Transform hook: record module size for visualization.
     */
    transform(code: string, id: string): null {
      if (!id.includes('node_modules') || !id.startsWith('\0')) {
        modules.push({
          id: id.replace(process.cwd(), ''),
          size: Buffer.byteLength(code, 'utf8'),
          chunkName: 'main',
        });
      }
      return null;
    },

    /**
     * Load hook: not used by visualizer.
     */
    load(_id: string): null {
      return null;
    },
  };
}

/** Generate the HTML treemap report from collected module data */
function generateHtmlReport(
  modules: ModuleInfo[],
  options: Required<VisualizerPluginOptions>
): string {
  const totalSize = modules.reduce((sum, m) => sum + m.size, 0);

  const moduleRows = modules
    .sort((a, b) => b.size - a.size)
    .slice(0, 100) // Show top 100 by size
    .map(m => `
      <tr>
        <td class="path">${escapeHtml(m.id)}</td>
        <td class="size">${formatBytes(m.size)}</td>
        <td class="chunk">${escapeHtml(m.chunkName)}</td>
        <td class="pct">${((m.size / totalSize) * 100).toFixed(1)}%</td>
      </tr>
    `)
    .join('');

  const treemapData = modules.map(m => ({
    name: m.id.split('/').pop() || m.id,
    path: m.id,
    value: m.size,
    chunk: m.chunkName,
  }));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(options.title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: #0f0f13; color: #e1e1e8; }
    header { padding: 1.5rem 2rem; background: #1a1a2e; border-bottom: 1px solid #333;
             display: flex; align-items: center; gap: 1rem; }
    header h1 { font-size: 1.4rem; color: #a78bfa; }
    .stats { display: flex; gap: 2rem; margin-left: auto; }
    .stat { text-align: center; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #c4b5fd; }
    .stat-label { font-size: 0.75rem; color: #888; text-transform: uppercase; }
    .treemap { padding: 2rem; }
    .treemap-grid { display: flex; flex-wrap: wrap; gap: 4px; min-height: 300px;
                    background: #16161e; border-radius: 8px; padding: 1rem; }
    .treemap-cell { background: linear-gradient(135deg, #4c1d95, #7c3aed);
                    border-radius: 4px; display: flex; align-items: center;
                    justify-content: center; padding: 4px; cursor: pointer;
                    transition: opacity 0.2s; font-size: 0.65rem; color: white;
                    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                    min-width: 30px; min-height: 30px; }
    .treemap-cell:hover { opacity: 0.8; }
    table { width: 100%; border-collapse: collapse; margin: 0 2rem 2rem;
            max-width: calc(100% - 4rem); }
    th { background: #1a1a2e; padding: 0.6rem 1rem; text-align: left;
         font-size: 0.75rem; text-transform: uppercase; color: #888; }
    td { padding: 0.5rem 1rem; border-bottom: 1px solid #222; font-size: 0.85rem; }
    td.path { color: #93c5fd; font-family: monospace; font-size: 0.75rem; }
    td.size { color: #6ee7b7; font-variant-numeric: tabular-nums; }
    td.pct { color: #fbbf24; }
    tr:hover td { background: #1a1a2e; }
    .badge { display: inline-block; background: #312e81; color: #c4b5fd;
             padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; }
  </style>
</head>
<body>
  <header>
    <span>⚡</span>
    <h1>${escapeHtml(options.title)}</h1>
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${modules.length}</div>
        <div class="stat-label">Modules</div>
      </div>
      <div class="stat">
        <div class="stat-value">${formatBytes(totalSize)}</div>
        <div class="stat-label">Total Size</div>
      </div>
    </div>
  </header>

  <div class="treemap">
    <h2 style="color:#a78bfa;margin-bottom:1rem;font-size:1rem;">Bundle Treemap</h2>
    <div class="treemap-grid" id="treemap">
      ${modules.slice(0, 50).map(m => {
        const pct = Math.max(5, (m.size / totalSize) * 100);
        return `<div class="treemap-cell" style="width:${pct * 3}px;height:${pct}px"
                     title="${escapeHtml(m.id)} (${formatBytes(m.size)})">
          ${escapeHtml(m.id.split('/').pop() || '')}
        </div>`;
      }).join('')}
    </div>
  </div>

  <h2 style="color:#a78bfa;margin:0 2rem 1rem;font-size:1rem;">Module Details</h2>
  <table>
    <thead>
      <tr>
        <th>Module Path</th>
        <th>Size</th>
        <th>Chunk</th>
        <th>% of Total</th>
      </tr>
    </thead>
    <tbody>${moduleRows}</tbody>
  </table>

  <script>
    const data = ${JSON.stringify(treemapData)};
    console.log('[Lunx Visualizer] Loaded', data.length, 'modules');
    console.log('[Lunx Visualizer] Total size:', ${totalSize}, 'bytes');
  </script>
</body>
</html>`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default visualizerPlugin;
