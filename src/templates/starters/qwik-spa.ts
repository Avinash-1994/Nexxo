import { TemplateConfig } from '../manager.js';
export const qwikSpaTemplate: TemplateConfig = {
    id: 'qwik-spa', name: 'Qwik SPA', description: 'Resumable app built with Qwik', framework: 'vanilla', type: 'spa',
    dependencies: { '@builder.io/qwik': '^1.5.0', '@builder.io/qwik-city': '^1.5.0' },
    devDependencies: { '@types/node': '^20.0.0' },
    files: {
        'lunx.config.ts': "import { defineConfig } from 'lunx';\nexport default defineConfig({ framework: 'qwik' });",
        'src/root.tsx': `import { component$, useStyles$ } from '@builder.io/qwik';\nexport default component$(() => {\n  useStyles$(\`body{font-family:system-ui;background:#0f172a;color:#f1f5f9;display:flex;align-items:center;justify-content:center;height:100vh;margin:0} .card{background:#1e293b;padding:40px;border-radius:12px;text-align:center;border:1px solid #334155} h1{color:#818cf8;margin:0 0 10px;font-size:32px} p{color:#94a3b8}\`);\n  return (<div class="card"><h1>⚡ Lunx + Qwik</h1><p>Resumable app built with the Lunx engine.</p></div>);\n});`,
        'src/entry.ssr.tsx': `import { renderToStream, type RenderToStreamOptions } from '@builder.io/qwik/server';\nimport { manifest } from '@qwik-client-manifest';\nimport Root from './root';\nexport default function (opts: RenderToStreamOptions) { return renderToStream(<Root />, { manifest, ...opts }); }`
    }
};
