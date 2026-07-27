#!/bin/bash
# Part 3: MFE demo + meta-frameworks + verification script
set -e
ROOT="/home/avinash/Desktop/framework_practis/build"
T="$ROOT/templates"

# ── SVELTEKIT ────────────────────────────────────────────────────
mkdir -p "$T/sveltekit/src/routes/blog" "$T/sveltekit/src/routes/admin" "$T/sveltekit/src/routes/api"
cat > "$T/sveltekit/package.json" <<'EOF'
{"name":"lunx-sveltekit-template","version":"0.0.1","private":true,"type":"module","scripts":{"dev":"lunx dev","build":"lunx build","preview":"lunx preview"},"lunx":{"template":true,"framework":"sveltekit","description":"Lunx Blog — full-stack blog with CMS"},"dependencies":{"@sveltejs/kit":"2.5.18","svelte":"4.2.18","marked":"12.0.0"},"devDependencies":{"lunx":"file:../..","typescript":"5.4.5"}}
EOF
cat > "$T/sveltekit/lunx.config.ts" <<'EOF'
import { defineConfig } from 'lunx';
export default defineConfig({ framework: 'sveltekit' });
EOF
cat > "$T/sveltekit/src/routes/+page.svelte" <<'EOF'
<script lang="ts">
  export let data: { posts: any[] };
</script>
<svelte:head><title>Lunx Blog</title></svelte:head>
<main style="max-width:800px;margin:0 auto;padding:32px;font-family:system-ui;background:#0f172a;min-height:100vh;color:#f1f5f9">
  <h1 style="font-size:36px;margin-bottom:8px">⚡ Lunx Blog</h1>
  <p style="color:#94a3b8;margin-bottom:32px">Engineering insights from the Lunx team</p>
  {#each data.posts as post}
    <article style="background:#1e293b;border-radius:12px;padding:24px;margin-bottom:20px">
      <div style="color:#818cf8;font-size:12px;text-transform:uppercase;letter-spacing:1px">{post.category} · {post.date}</div>
      <h2 style="margin:12px 0 8px"><a href="/blog/{post.slug}" style="color:#f1f5f9;text-decoration:none">{post.title}</a></h2>
      <p style="color:#94a3b8;line-height:1.6">{post.excerpt}</p>
      <div style="margin-top:16px;display:flex;gap:8px">
        {#each post.tags as tag}
          <span style="background:#0f172a;padding:4px 12px;border-radius:999px;font-size:12px;color:#818cf8">{tag}</span>
        {/each}
      </div>
    </article>
  {/each}
</main>
EOF
cat > "$T/sveltekit/src/routes/+page.server.ts" <<'EOF'
export const load = async () => ({
  posts: [
    { slug:'lunx-1-0-release', title:'Lunx 1.0: Production-Ready Build Tool', category:'Engineering', date:'2026-05-14', excerpt:'After 303 tests and 6 months of development, Lunx 1.0 is ready. Here\'s what changed.', tags:['release','engineering'] },
    { slug:'sveltekit-ssr-deep-dive', title:'SvelteKit SSR with Lunx: Zero Config', category:'Tutorial', date:'2026-05-10', excerpt:'How Lunx auto-detects SvelteKit and configures SSR with no config needed.', tags:['sveltekit','ssr','tutorial'] },
    { slug:'security-gate-design', title:'Designing a CVE Security Gate', category:'Security', date:'2026-05-06', excerpt:'We built a build-time CVE scanner that integrates with OSV and blocks HIGH severity by default.', tags:['security','cve','sbom'] },
    { slug:'module-federation-2026', title:'Module Federation in 2026', category:'Architecture', date:'2026-05-01', excerpt:'Lunx brings native MFE support across React, Vue, and Angular with zero configuration.', tags:['mfe','architecture'] },
  ]
});
EOF

# ── REMIX ────────────────────────────────────────────────────────
mkdir -p "$T/remix/app/routes"
cat > "$T/remix/package.json" <<'EOF'
{"name":"lunx-remix-template","version":"0.0.1","private":true,"type":"module","scripts":{"dev":"lunx dev","build":"lunx build","preview":"lunx preview"},"lunx":{"template":true,"framework":"remix","description":"Lunx Jobs — job board with applications"},"dependencies":{"@remix-run/react":"2.9.2","@remix-run/node":"2.9.2","react":"18.3.1","react-dom":"18.3.1"},"devDependencies":{"lunx":"file:../..","typescript":"5.4.5"}}
EOF
cat > "$T/remix/lunx.config.ts" <<'EOF'
import { defineConfig } from 'lunx';
export default defineConfig({ framework: 'remix' });
EOF
cat > "$T/remix/app/routes/_index.tsx" <<'EOF'
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';

const JOBS = [
  { id:1, title:'Senior Frontend Engineer', company:'Vercel', location:'Remote', salary:'$180k–$220k', type:'Full-time', stack:['React','Next.js','TypeScript'] },
  { id:2, title:'Staff Engineer — Build Tools', company:'Lunx Inc.', location:'Remote / SF', salary:'$200k–$250k', type:'Full-time', stack:['Rust','TypeScript','Node'] },
  { id:3, title:'DevRel Engineer', company:'Cloudflare', location:'Remote', salary:'$150k–$190k', type:'Full-time', stack:['Workers','Svelte','Vue'] },
  { id:4, title:'Platform Engineer', company:'Netlify', location:'Remote', salary:'$160k–$200k', type:'Full-time', stack:['Go','React','Terraform'] },
];

export const loader = async () => json({ jobs: JOBS });

export default function Index() {
  const { jobs } = useLoaderData<typeof loader>();
  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'system-ui'}}>
      <nav style={{background:'#1e293b',padding:'0 24px',display:'flex',alignItems:'center',height:56,gap:24}}>
        <span style={{fontWeight:700,fontSize:18}}>💼 Lunx Jobs</span>
        <Link to="/" style={{color:'#94a3b8',textDecoration:'none'}}>Jobs</Link>
        <Link to="/login" style={{color:'#94a3b8',textDecoration:'none'}}>Login</Link>
      </nav>
      <div style={{padding:32,maxWidth:800,margin:'0 auto'}}>
        <h1 style={{margin:'0 0 8px'}}>Find Your Next Role</h1>
        <p style={{color:'#94a3b8',marginBottom:32}}>{jobs.length} open positions</p>
        {jobs.map(job => (
          <div key={job.id} style={{background:'#1e293b',borderRadius:12,padding:24,marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <h2 style={{margin:'0 0 4px',fontSize:20}}>{job.title}</h2>
                <div style={{color:'#94a3b8'}}>{job.company} · {job.location}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{color:'#22c55e',fontWeight:700}}>{job.salary}</div>
                <div style={{color:'#94a3b8',fontSize:13}}>{job.type}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8,marginTop:16}}>
              {job.stack.map(s => <span key={s} style={{background:'#0f172a',padding:'4px 12px',borderRadius:999,fontSize:12,color:'#818cf8'}}>{s}</span>)}
            </div>
            <Link to={`/apply/${job.id}`} style={{display:'inline-block',marginTop:16,padding:'10px 20px',background:'#6366f1',color:'#fff',textDecoration:'none',borderRadius:8,fontWeight:600}}>Apply Now →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
EOF
cat > "$T/remix/app/routes/apply.\$id.tsx" <<'EOF'
import { Form, useActionData } from '@remix-run/react';
import { json, type ActionFunctionArgs } from '@remix-run/node';

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = await request.formData();
  return json({ success: true, applicant: data.get('name'), jobId: data.get('jobId') });
};

export default function Apply() {
  const result = useActionData<typeof action>();
  if (result?.success) return <div style={{padding:32,color:'#22c55e',fontSize:24,fontFamily:'system-ui'}}>✅ Application submitted for {result.applicant}!</div>;
  return (
    <div style={{padding:32,maxWidth:600,fontFamily:'system-ui',background:'#0f172a',minHeight:'100vh',color:'#f1f5f9'}}>
      <h1>Apply for Position</h1>
      <Form method="post" style={{display:'flex',flexDirection:'column',gap:16,marginTop:24}}>
        <input type="hidden" name="jobId" value="1"/>
        <input name="name" placeholder="Full name" required style={{padding:12,borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#fff'}}/>
        <input name="email" type="email" placeholder="Email address" required style={{padding:12,borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#fff'}}/>
        <textarea name="cover" placeholder="Cover letter" rows={6} style={{padding:12,borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#fff'}}/>
        <button type="submit" style={{padding:14,background:'#6366f1',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:16}}>Submit Application</button>
      </Form>
    </div>
  );
}
EOF
cat > "$T/remix/app/routes/login.tsx" <<'EOF'
import { Form } from '@remix-run/react';
export default function Login() {
  return (
    <div style={{padding:32,maxWidth:400,fontFamily:'system-ui',background:'#0f172a',minHeight:'100vh',color:'#f1f5f9'}}>
      <h1>Sign In</h1>
      <Form method="post" style={{display:'flex',flexDirection:'column',gap:16,marginTop:24}}>
        <input type="email" name="email" placeholder="Email" defaultValue="dev@lunx.dev" required style={{padding:12,borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#fff'}}/>
        <input type="password" name="password" placeholder="Password" required style={{padding:12,borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#fff'}}/>
        <button type="submit" style={{padding:12,background:'#6366f1',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>Sign In</button>
      </Form>
    </div>
  );
}
EOF

# ── ASTRO ────────────────────────────────────────────────────────
mkdir -p "$T/astro/src/pages/guide" "$T/astro/src/layouts"
cat > "$T/astro/package.json" <<'EOF'
{"name":"lunx-astro-template","version":"0.0.1","private":true,"type":"module","scripts":{"dev":"lunx dev","build":"lunx build","preview":"lunx preview"},"lunx":{"template":true,"framework":"astro","description":"Lunx Docs — documentation site"},"dependencies":{"astro":"4.10.2"},"devDependencies":{"lunx":"file:../..","typescript":"5.4.5"}}
EOF
cat > "$T/astro/lunx.config.ts" <<'EOF'
import { defineConfig } from 'lunx';
export default defineConfig({ framework: 'astro' });
EOF
cat > "$T/astro/src/pages/index.astro" <<'EOF'
---
const guides = ['Installation', 'Configuration', 'Adapters', 'Plugins', 'Security'];
---
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Lunx Docs</title>
  <style>
    * { box-sizing: border-box; margin: 0; }
    body { background: #0f172a; color: #f1f5f9; font-family: system-ui; display: flex; }
    nav { width: 240px; background: #1e293b; height: 100vh; position: sticky; top: 0; padding: 24px 16px; }
    main { flex: 1; padding: 48px; max-width: 800px; }
    a { color: #818cf8; text-decoration: none; }
    a:hover { text-decoration: underline; }
    nav a { display: block; padding: 8px 12px; border-radius: 6px; color: #94a3b8; margin-bottom: 4px; }
    nav a:hover { background: #334155; color: #f1f5f9; }
    code { background: #1e293b; padding: 2px 8px; border-radius: 4px; font-family: monospace; color: #818cf8; }
    pre { background: #1e293b; padding: 20px; border-radius: 10px; overflow-x: auto; margin: 16px 0; }
  </style>
</head>
<body>
  <nav>
    <div style="font-weight:700;font-size:18px;margin-bottom:24px">⚡ Lunx Docs</div>
    <div style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Guide</div>
    {guides.map(g => <a href={`/guide/${g.toLowerCase()}`}>{g}</a>)}
    <div style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:16px 0 8px">Reference</div>
    <a href="/api/reference">API Reference</a>
    <a href="/api/reference">CLI Reference</a>
  </nav>
  <main>
    <h1 style="font-size:48px;margin-bottom:16px">Lunx Documentation</h1>
    <p style="color:#94a3b8;font-size:18px;margin-bottom:40px">A production-grade build tool powered by SWC and LightningCSS</p>
    <h2>Quick Start</h2>
    <pre><code>npm install -g lunx
lunx create my-app --framework react --ts
cd my-app && lunx dev</code></pre>
    <h2 style="margin-top:32px">Why Lunx?</h2>
    <ul style="color:#94a3b8;line-height:2;margin-top:12px">
      <li>⚡ Sub-100ms HMR (p50: 12ms)</li>
      <li>🏗️ 19 meta-framework adapters — zero config</li>
      <li>🔒 Built-in security gate (CVE, secrets, CSP, SRI)</li>
      <li>📦 Native Module Federation for micro-frontends</li>
      <li>💾 SQLite WAL incremental build cache</li>
    </ul>
  </main>
</body>
</html>
EOF
cat > "$T/astro/src/pages/guide/installation.astro" <<'EOF'
---
---
<html lang="en"><head><meta charset="UTF-8"/><title>Installation — Lunx Docs</title><style>body{background:#0f172a;color:#f1f5f9;font-family:system-ui;padding:48px;max-width:800px;margin:0 auto}pre{background:#1e293b;padding:20px;border-radius:10px;overflow-x:auto}code{color:#818cf8;font-family:monospace}</style></head>
<body>
  <a href="/" style="color:#818cf8">← Back to Docs</a>
  <h1 style="margin:24px 0">Installation</h1>
  <h2>Requirements</h2>
  <ul style="color:#94a3b8;line-height:2;margin:12px 0"><li>Node.js ≥ 20</li><li>npm ≥ 9 or pnpm ≥ 8</li></ul>
  <h2 style="margin-top:24px">Global install</h2>
  <pre><code>npm install -g lunx</code></pre>
  <h2 style="margin-top:24px">Per-project install</h2>
  <pre><code>npm install -D lunx</code></pre>
  <h2 style="margin-top:24px">Verify</h2>
  <pre><code>lunx --version
# ⚡ Lunx v1.0.10</code></pre>
</body></html>
EOF

# ── MFE TEMPLATE ─────────────────────────────────────────────────
mkdir -p "$T/mfe/{host,remote-vue,remote-react}/src"
cat > "$T/mfe/package.json" <<'EOF'
{"name":"lunx-mfe-template","version":"0.0.1","private":true,"type":"module","scripts":{"dev:all":"concurrently \"npm run dev:remote-vue\" \"npm run dev:remote-react\" \"npm run dev:host\"","dev:host":"cd host && lunx dev","dev:remote-vue":"cd remote-vue && lunx dev","dev:remote-react":"cd remote-react && lunx dev","build:all":"npm run build --prefix remote-vue && npm run build --prefix remote-react && npm run build --prefix host"},"lunx":{"template":true,"framework":"mfe","description":"Lunx MFE — Module Federation host + 2 remotes"},"devDependencies":{"concurrently":"8.2.2"}}
EOF
cat > "$T/mfe/host/package.json" <<'EOF'
{"name":"lunx-mfe-host","version":"0.0.1","private":true,"type":"module","scripts":{"dev":"lunx dev","build":"lunx build"},"dependencies":{"react":"18.3.1","react-dom":"18.3.1"},"devDependencies":{"lunx":"file:../../.."}}
EOF
cat > "$T/mfe/host/lunx.config.ts" <<'EOF'
import { defineConfig } from 'lunx';
export default defineConfig({
  framework: 'react',
  mfe: {
    name: 'host',
    remotes: {
      vueRemote: 'http://localhost:5174/remoteEntry.js',
      reactRemote: 'http://localhost:5175/remoteEntry.js',
    },
    shared: { react: { singleton: true, requiredVersion: '18.3.1' }, 'react-dom': { singleton: true } }
  }
});
EOF
cat > "$T/mfe/host/index.html" <<'EOF'
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Lunx MFE Host</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>
EOF
cat > "$T/mfe/host/src/main.tsx" <<'EOF'
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
const VueWidget = React.lazy(() => import('vueRemote/Widget'));
const ReactWidget = React.lazy(() => import('reactRemote/Dashboard'));

function App() {
  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'system-ui',padding:32}}>
      <h1 style={{marginBottom:32}}>⚡ Lunx MFE Host</h1>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        <div style={{background:'#1e293b',borderRadius:12,padding:24}}>
          <h2 style={{color:'#42b883',marginBottom:16}}>Vue Remote</h2>
          <Suspense fallback={<div style={{color:'#94a3b8'}}>Loading Vue widget...</div>}>
            <VueWidget/>
          </Suspense>
        </div>
        <div style={{background:'#1e293b',borderRadius:12,padding:24}}>
          <h2 style={{color:'#61dafb',marginBottom:16}}>React Remote</h2>
          <Suspense fallback={<div style={{color:'#94a3b8'}}>Loading React widget...</div>}>
            <ReactWidget/>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<App/>);
EOF

cat > "$T/mfe/remote-vue/package.json" <<'EOF'
{"name":"lunx-mfe-remote-vue","version":"0.0.1","private":true,"type":"module","scripts":{"dev":"lunx dev","build":"lunx build"},"dependencies":{"vue":"3.4.27"},"devDependencies":{"lunx":"file:../../.."}}
EOF
cat > "$T/mfe/remote-vue/lunx.config.ts" <<'EOF'
import { defineConfig } from 'lunx';
export default defineConfig({
  framework: 'vue',
  dev: { port: 5174 },
  mfe: {
    name: 'vueRemote',
    exposes: { './Widget': './src/Widget.vue' },
    shared: { vue: { singleton: true } }
  }
});
EOF
cat > "$T/mfe/remote-vue/src/Widget.vue" <<'EOF'
<template>
  <div>
    <p style="color:#94a3b8;font-size:14px">Vue 3.4.27 — Module Federation Remote</p>
    <div style="margin-top:12px">
      <div v-for="stat in stats" :key="stat.label" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #334155">
        <span style="color:#94a3b8">{{ stat.label }}</span>
        <strong style="color:#42b883">{{ stat.value }}</strong>
      </div>
    </div>
    <button @click="count++" style="margin-top:16px;padding:10px 20px;background:#42b883;color:#000;border:none;border-radius:8px;cursor:pointer;font-weight:600">Clicked {{ count }}×</button>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
const stats = [{ label:'Framework', value:'Vue 3' },{ label:'Build tool', value:'Lunx' },{ label:'MFE', value:'Module Federation' }];
</script>
EOF

cat > "$T/mfe/remote-react/package.json" <<'EOF'
{"name":"lunx-mfe-remote-react","version":"0.0.1","private":true,"type":"module","scripts":{"dev":"lunx dev","build":"lunx build"},"dependencies":{"react":"18.3.1","react-dom":"18.3.1"},"devDependencies":{"lunx":"file:../../.."}}
EOF
cat > "$T/mfe/remote-react/lunx.config.ts" <<'EOF'
import { defineConfig } from 'lunx';
export default defineConfig({
  framework: 'react',
  dev: { port: 5175 },
  mfe: {
    name: 'reactRemote',
    exposes: { './Dashboard': './src/Dashboard.tsx' },
    shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
  }
});
EOF
cat > "$T/mfe/remote-react/src/Dashboard.tsx" <<'EOF'
import React, { useState } from 'react';
const METRICS = [['Active Users', '12,840', '+8.3%'],['Revenue (MTD)', '$84,220', '+12.1%'],['Avg Session', '4m 32s', '-0.8%']];
export default function Dashboard() {
  const [clicked, setClicked] = useState(0);
  return (
    <div>
      <p style={{color:'#94a3b8',fontSize:14,margin:'0 0 12px'}}>React 18.3.1 — Module Federation Remote</p>
      {METRICS.map(([label, value, delta]) => (
        <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #334155'}}>
          <span style={{color:'#94a3b8'}}>{label}</span>
          <div style={{textAlign:'right'}}>
            <strong style={{color:'#61dafb'}}>{value}</strong>
            <span style={{marginLeft:8,color: delta.startsWith('+') ? '#22c55e' : '#ef4444',fontSize:12}}>{delta}</span>
          </div>
        </div>
      ))}
      <button onClick={() => setClicked(c => c+1)} style={{marginTop:16,padding:'10px 20px',background:'#61dafb',color:'#000',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>Clicked {clicked}×</button>
    </div>
  );
}
EOF

cat > "$T/mfe/README.md" <<'EOF'
# Lunx MFE Template — Module Federation

Three apps: 1 host + 2 remotes (Vue + React)

```bash
npm install
npm run dev:all
# Host:        http://localhost:5173
# Vue Remote:  http://localhost:5174
# React Remote:http://localhost:5175
```
EOF

echo "✅ sveltekit, remix, astro, mfe done"
