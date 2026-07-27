import { TemplateConfig } from '../manager.js';
export const alpineSpaTemplate: TemplateConfig = {
    id: 'alpine-spa', name: 'Alpine SPA', description: 'Lightweight UI built with Alpine.js', framework: 'vanilla', type: 'spa',
    dependencies: { 'alpinejs': '^3.13.5' },
    devDependencies: { '@types/node': '^20.0.0' },
    files: {
        'lunx.config.ts': "import { defineConfig } from 'lunx';\nexport default defineConfig({ framework: 'alpine', entry: 'src/main.ts' });",
        'index.html': `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><title>{{PROJECT_NAME}}</title><style>body{font-family:system-ui;background:#0f172a;color:#f1f5f9;margin:0;display:flex;align-items:center;justify-content:center;height:100vh} .card{background:#1e293b;padding:40px;border-radius:12px;text-align:center;border:1px solid #334155} h1{color:#818cf8;margin:0 0 10px;font-size:32px} p{color:#94a3b8;margin:0}</style></head><body><div class="card" x-data="{ count: 0 }"><h1>⚡ Lunx + Alpine</h1><p style="margin-bottom:20px">Lightweight UI built with the Lunx engine.</p><button @click="count++" style="padding:10px 20px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600">Clicks: <span x-text="count"></span></button></div><script type="module" src="/src/main.ts"></script></body></html>`,
        'src/main.ts': `import Alpine from 'alpinejs';\nwindow.Alpine = Alpine;\nAlpine.start();`
    }
};
