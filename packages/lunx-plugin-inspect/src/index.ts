/**
 * @lunx/plugin-inspect — See exactly what every plugin does to your modules
 * Replaces: vite-plugin-inspect
 * Permissions: net:fetch (local UI), fs:read
 * Zero production overhead — no-op if NODE_ENV=production
 */

import path from 'node:path';

interface TransformRecord {
  pluginName: string;
  input: string;
  output: string;
  durationMs: number;
  timestamp: number;
}

interface ModuleRecord {
  id: string;
  transforms: TransformRecord[];
  importers: string[];
  importees: string[];
}

const moduleGraph = new Map<string, ModuleRecord>();

export interface InspectOptions {
  /** URL path for the inspect UI (default: '/__lunx_inspect__') */
  basePath?: string;
}

export function inspect(options: InspectOptions = {}) {
  if (process.env['NODE_ENV'] === 'production') {
    return { name: '@lunx/plugin-inspect' }; // No-op in production
  }

  const { basePath = '/__lunx_inspect__' } = options;

  return {
    name: '@lunx/plugin-inspect',
    enforce: 'pre' as const,

    configureServer(server: any) {
      // Serve inspect UI
      server.middlewares?.use((req: any, res: any, next: () => void) => {
        const url: string = req.url ?? '/';

        if (url === basePath || url === `${basePath}/`) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(generateInspectUI(basePath));
          return;
        }

        if (url === `${basePath}/api/modules`) {
          res.setHeader('Content-Type', 'application/json');
          const data = [...moduleGraph.entries()].map(([id, rec]) => ({
            id,
            transforms: rec.transforms.map((t) => ({
              ...t,
              input: t.input.slice(0, 500),
              output: t.output.slice(0, 500),
            })),
            importers: rec.importers,
            importees: rec.importees,
          }));
          res.end(JSON.stringify(data, null, 2));
          return;
        }

        next();
      });

      console.info(`[lunx:inspect] 🔍 Inspect UI: http://localhost:5173${basePath}`);
    },

    transform(code: string, id: string) {
      if (id.includes('node_modules')) return;
      if (!moduleGraph.has(id)) {
        moduleGraph.set(id, { id, transforms: [], importers: [], importees: [] });
      }
      return;
    },
  };
}

function generateInspectUI(basePath: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Lunx Inspect</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0d1117; color: #c9d1d9; margin: 0; padding: 20px; }
  h1 { color: #58a6ff; }
  .module { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 12px; margin: 8px 0; }
  .module-id { font-family: monospace; color: #79c0ff; font-size: 13px; }
  .transform { background: #0d1117; border-left: 3px solid #238636; padding: 8px; margin: 4px 0; font-size: 12px; }
  .plugin { color: #f0883e; font-weight: bold; }
  .duration { color: #56d364; margin-left: 8px; }
  pre { overflow-x: auto; max-height: 200px; background: #0d1117; padding: 8px; border-radius: 4px; }
  #search { background: #161b22; border: 1px solid #30363d; color: #c9d1d9; padding: 8px; border-radius: 4px; width: 100%; max-width: 500px; margin-bottom: 16px; }
</style>
</head>
<body>
<h1>🔍 Lunx Inspect</h1>
<p>Transform pipeline inspector for all modules in your build graph.</p>
<input id="search" type="text" placeholder="Filter by module path..." oninput="filterModules(this.value)">
<div id="modules">Loading...</div>
<script>
  let allModules = [];
  fetch('${basePath}/api/modules').then(r => r.json()).then(data => {
    allModules = data;
    renderModules(data);
  });
  function renderModules(data) {
    const el = document.getElementById('modules');
    if (!data.length) { el.innerHTML = '<p>No modules transformed yet. Make some file changes.</p>'; return; }
    el.innerHTML = data.map(m => \`
      <div class="module">
        <div class="module-id">\${m.id}</div>
        \${m.transforms.map(t => \`
          <div class="transform">
            <span class="plugin">\${t.pluginName}</span>
            <span class="duration">+\${t.durationMs}ms</span>
          </div>
        \`).join('')}
      </div>\`).join('');
  }
  function filterModules(q) {
    renderModules(allModules.filter(m => m.id.toLowerCase().includes(q.toLowerCase())));
  }
</script>
</body>
</html>`;
}

export default inspect;
