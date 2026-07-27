import { TemplateConfig } from '../manager.js';
export const litSpaTemplate: TemplateConfig = {
    id: 'lit-spa', name: 'Lit SPA', description: 'Web components built with Lit', framework: 'vanilla', type: 'spa',
    dependencies: { 'lit': '^3.1.2' },
    devDependencies: { '@types/node': '^20.0.0' },
    files: {
        'lunx.config.ts': "import { defineConfig } from 'lunx';\nexport default defineConfig({ framework: 'lit', entry: 'src/main.ts' });",
        'index.html': `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><title>{{PROJECT_NAME}}</title><style>body{background:#0f172a;margin:0;display:flex;align-items:center;justify-content:center;height:100vh}</style></head><body><lunx-app></lunx-app><script type="module" src="/src/main.ts"></script></body></html>`,
        'src/main.ts': `import { LitElement, html, css } from 'lit';\nimport { customElement } from 'lit/decorators.js';\n@customElement('lunx-app')\nexport class LunxApp extends LitElement {\n  static styles = css\`:host{display:block;font-family:system-ui;color:#f1f5f9} .card{background:#1e293b;padding:40px;border-radius:12px;text-align:center;border:1px solid #334155} h1{color:#818cf8;margin:0 0 10px;font-size:32px} p{color:#94a3b8;margin:0}\`;\n  render() { return html\`<div class="card"><h1>⚡ Lunx + Lit</h1><p>Web components built with the Lunx engine.</p></div>\`; }\n}`
    }
};
