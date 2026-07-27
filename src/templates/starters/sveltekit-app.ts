import { TemplateConfig } from '../manager.js';
export const sveltekitAppTemplate: TemplateConfig = {
    id: 'sveltekit-app', name: 'SvelteKit App', description: 'Server-side rendered Svelte app', framework: 'svelte', type: 'ssr',
    dependencies: { '@sveltejs/kit': '^2.5.0', 'svelte': '^4.2.0' },
    devDependencies: { '@types/node': '^20.0.0' },
    files: {
        'lunx.config.ts': "import { defineConfig } from 'lunx';\nexport default defineConfig({ framework: 'sveltekit' });",
        'src/app.html': `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /><title>{{PROJECT_NAME}}</title>%sveltekit.head%</head><body><div id="svelte">%sveltekit.body%</div></body></html>`,
        'src/routes/+page.svelte': `<style>:global(body){font-family:system-ui;background:#0f172a;color:#f1f5f9;display:flex;align-items:center;justify-content:center;height:100vh;margin:0} .card{background:#1e293b;padding:40px;border-radius:12px;text-align:center;border:1px solid #334155} h1{color:#818cf8;margin:0 0 10px;font-size:32px} p{color:#94a3b8}</style><div class="card"><h1>⚡ Lunx + SvelteKit</h1><p>Server-side rendering built with the Lunx engine.</p></div>`
    }
};
