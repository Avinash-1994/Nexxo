import { TemplateConfig } from '../manager.js';
export const astroSpaTemplate: TemplateConfig = {
    id: 'astro-spa', name: 'Astro SPA (Vite Engine)', description: 'Fast MPA built with Astro', framework: 'vanilla', type: 'spa',
    dependencies: { 'astro': '^4.8.0' },
    devDependencies: { '@types/node': '^20.0.0' },
    files: {
        'lunx.config.ts': "import { defineConfig } from 'lunx';\nexport default defineConfig({ framework: 'astro' });",
        'src/pages/index.astro': `---
---
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>{{PROJECT_NAME}}</title>
  <style>body{font-family:system-ui;background:#0f172a;color:#f1f5f9;display:flex;align-items:center;justify-content:center;height:100vh;margin:0} .card{background:#1e293b;padding:40px;border-radius:12px;text-align:center;border:1px solid #334155} h1{color:#818cf8;margin:0 0 10px;font-size:32px} p{color:#94a3b8}</style>
</head>
<body>
  <div class="card">
    <h1>⚡ Lunx + Astro</h1>
    <p>Blazing fast MPA built with the Lunx engine.</p>
  </div>
</body>
</html>`
    }
};
