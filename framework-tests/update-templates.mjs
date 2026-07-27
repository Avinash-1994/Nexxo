import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TESTS = path.join(__dirname, '../framework-tests');

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#030712;--surface:#0d1526;--surface2:#111827;--border:#1e2d45;--primary:#6366f1;--accent:#818cf8;--glow:#6366f180}
body{background:var(--bg);color:#f1f5f9;font-family:'Inter',system-ui,sans-serif;min-height:100vh;overflow-x:hidden}
/* Animated background */
body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 80% 50% at 50% -20%,#6366f140,transparent),radial-gradient(ellipse 60% 40% at 80% 80%,#06b6d420,transparent),radial-gradient(ellipse 60% 40% at 20% 70%,#8b5cf620,transparent);pointer-events:none;z-index:0}
/* Grid pattern */
body::after{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;z-index:0}
header{position:relative;z-index:1;padding:80px 24px 64px;text-align:center}
.lunx-logo{display:inline-flex;align-items:center;gap:10px;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.3);border-radius:999px;padding:6px 18px;font-size:13px;font-weight:600;color:var(--accent);margin-bottom:32px;backdrop-filter:blur(10px)}
.lunx-logo::before{content:'⚡';font-size:16px}
h1{font-size:clamp(42px,7vw,80px);font-weight:900;line-height:1.05;margin-bottom:10px;letter-spacing:-2px}
h1 .lunx{background:linear-gradient(135deg,#e0e7ff,#818cf8,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.fw-pill{display:inline-flex;align-items:center;gap:7px;padding:6px 16px;border-radius:999px;font-size:14px;font-weight:700;margin-left:8px;vertical-align:middle;border:1px solid;backdrop-filter:blur(10px)}
.subtitle{color:#94a3b8;font-size:18px;max-width:580px;margin:20px auto 40px;line-height:1.7}
.meta-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.meta-chip{background:rgba(15,23,42,.8);border:1px solid #1e2d45;border-radius:10px;padding:10px 18px;font-size:13px;color:#64748b;backdrop-filter:blur(8px);transition:.2s}
.meta-chip:hover{border-color:#6366f155;color:#94a3b8}
.meta-chip strong{color:#f1f5f9;display:block;font-size:14px;margin-bottom:2px}
main{max-width:1140px;margin:0 auto;padding:48px 24px;position:relative;z-index:1}
.section-head{display:flex;align-items:center;gap:12px;margin-bottom:24px}
.section-head span{font-size:11px;text-transform:uppercase;letter-spacing:3px;color:var(--accent);font-weight:700}
.section-head::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,#1e2d45,transparent)}
/* Feature cards with glass effect */
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:16px;margin-bottom:56px}
.card{background:rgba(13,21,38,.8);border:1px solid #1e2d45;border-radius:16px;padding:26px;transition:all .25s;backdrop-filter:blur(12px);position:relative;overflow:hidden}
.card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(99,102,241,.05),transparent);opacity:0;transition:.25s}
.card:hover{border-color:#6366f155;transform:translateY(-3px);box-shadow:0 20px 40px rgba(0,0,0,.4),0 0 0 1px #6366f122}
.card:hover::before{opacity:1}
.card-icon{width:44px;height:44px;background:linear-gradient(135deg,#6366f122,#818cf822);border:1px solid #6366f133;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px}
.card h3{font-size:15px;font-weight:700;margin-bottom:6px;color:#e2e8f0}
.card p{font-size:13px;color:#64748b;line-height:1.7}
/* Hero card - spans 2 cols */
.card.hero{grid-column:span 2;background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(129,140,248,.05));border-color:#6366f144;display:flex;gap:32px;align-items:center}
@media(max-width:640px){.card.hero{grid-column:span 1;flex-direction:column}}
.card.hero .hero-text h2{font-size:22px;font-weight:800;margin-bottom:8px}
.card.hero .hero-text p{font-size:14px;color:#94a3b8;line-height:1.7}
.card.hero .hero-icon{font-size:64px;flex-shrink:0}
/* Steps */
.steps{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;margin-bottom:56px}
.step{background:rgba(13,21,38,.8);border:1px solid #1e2d45;border-radius:12px;padding:20px;display:flex;gap:14px;align-items:flex-start;backdrop-filter:blur(8px);transition:.2s}
.step:hover{border-color:#6366f155}
.sn{background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0}
.step h4{font-size:13px;font-weight:600;color:#e2e8f0;margin-bottom:5px}
.step code{font-size:11px;color:#818cf8;background:#6366f115;padding:3px 8px;border-radius:6px;font-family:'Courier New',monospace;border:1px solid #6366f133}
/* Terminal */
.term{background:#020817;border:1px solid #1e2d45;border-radius:16px;padding:24px;margin-bottom:56px;position:relative;overflow:hidden}
.term::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#6366f155,transparent)}
.th{display:flex;align-items:center;gap:6px;margin-bottom:20px}
.dot{width:12px;height:12px;border-radius:50%}
.term-title{position:absolute;top:22px;left:50%;transform:translateX(-50%);font-size:12px;color:#334155;font-family:'Courier New',monospace}
.ln{font-size:13px;line-height:2.4;font-family:'Courier New',monospace}
.prompt{color:#334155}
.cmd{color:#818cf8;font-weight:500}
.cmt{color:#334155}
.ok{color:#22c55e}
.dim{color:#475569}
/* Footer */
footer{border-top:1px solid #0f1a2e;text-align:center;padding:32px;color:#334155;font-size:13px;position:relative;z-index:1}
footer a{color:#6366f1;text-decoration:none;transition:.2s}
footer a:hover{color:#818cf8}
.footer-glow{display:inline-block;padding:2px 12px;background:#6366f115;border:1px solid #6366f133;border-radius:999px;color:#818cf8;font-weight:600;margin-bottom:12px}
/* Animate in */
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
header,.cards,.steps,.term{animation:fadeUp .6s ease both}
.cards{animation-delay:.1s}.steps{animation-delay:.2s}.term{animation-delay:.3s}
`;

const FRAMEWORKS = [
  {dir:'test-react',name:'React',icon:'⚛️',color:'#61dafb',v:'18',desc:'Component-based UI library with hooks and virtual DOM.',mount:'root',extra:['JSX/TSX','React Hooks','React Router','React Query'],entry:'src/main.tsx'},
  {dir:'react-js',name:'React',icon:'⚛️',color:'#61dafb',v:'18',desc:'Component-based UI library — JavaScript edition.',mount:'root',extra:['JSX','React Hooks','Fast Refresh','Zero Config'],entry:'src/main.jsx'},
  {dir:'test-vue',name:'Vue',icon:'💚',color:'#42b883',v:'3',desc:'Progressive JavaScript framework with Composition API.',mount:'app',extra:['Composition API','Vue Router','Pinia','SFCs'],entry:'src/main.ts'},
  {dir:'test-svelte',name:'Svelte',icon:'🔥',color:'#ff3e00',v:'4',desc:'Compiler-based framework — zero runtime overhead.',mount:'app',extra:['Svelte Stores','Reactive','Compiled','No VDOM'],entry:'src/main.ts'},
  {dir:'test-sveltekit',name:'SvelteKit',icon:'🔥',color:'#ff3e00',v:'2',desc:'Full-stack Svelte framework with SSR and file routing.',mount:'app',extra:['File Routing','SSR Ready','Form Actions','Adapters'],entry:'src/main.ts'},
  {dir:'test-solid',name:'Solid.js',icon:'💎',color:'#446b9e',v:'1',desc:'Fine-grained reactivity with signals — no virtual DOM.',mount:'app',extra:['Signals','No VDOM','Fine-grained','Tiny Bundle'],entry:'src/main.tsx'},
  {dir:'test-preact',name:'Preact',icon:'⚡',color:'#673ab8',v:'10',desc:'3KB React-compatible library with the same modern API.',mount:'app',extra:['Signals','3KB Runtime','React Compat','Fast'],entry:'src/main.tsx'},
  {dir:'test-qwik',name:'Qwik',icon:'⚡',color:'#18b6f6',v:'1',desc:'Resumable framework with O(1) loading time.',mount:'app',extra:['Resumable','O(1) Load','Edge Ready','Lazy Exec'],entry:'src/main.ts'},
  {dir:'test-alpine',name:'Alpine.js',icon:'🏔️',color:'#77c1d2',v:'3',desc:'Lightweight JS behavior sprinkled directly on HTML.',mount:null,extra:['x-data','x-bind','x-on','x-model'],entry:null},
  {dir:'test-lit',name:'Lit',icon:'🕯️',color:'#324fff',v:'3',desc:'Web Components library for fast, lightweight elements.',mount:null,extra:['Web Components','Shadow DOM','HTML Templates','Reactive Props'],entry:null},
  {dir:'test-vanilla',name:'Vanilla JS',icon:'🍦',color:'#f7df1e',v:'ES2022',desc:'Pure JavaScript — no framework, maximum control.',mount:null,extra:['ES Modules','Web APIs','No Overhead','Universal'],entry:null},
  {dir:'test-angular',name:'Angular',icon:'🅰️',color:'#dd0031',v:'17',desc:'Platform for building scalable enterprise applications.',mount:'root',extra:['TypeScript','RxJS','DI','CLI'],entry:'src/main.ts'},
  {dir:'test-remix',name:'Remix',icon:'💿',color:'#e44949',v:'2',desc:'Full-stack framework built on web standards.',mount:'root',extra:['Nested Routes','Loaders','Actions','Edge Ready'],entry:'src/main.ts'},
  {dir:'test-nextjs-pages',name:'Next.js',icon:'▲',color:'#ffffff',v:'14',desc:'React framework for production with SSR and file routing.',mount:'root',extra:['Pages Router','SSR/SSG','API Routes','Image Opt'],entry:'src/main.ts'},
  {dir:'test-nuxt',name:'Nuxt',icon:'💚',color:'#00dc82',v:'3',desc:'Intuitive Vue framework for universal applications.',mount:'app',extra:['Auto-imports','Nitro Engine','File Routing','SSR/SSG'],entry:'src/main.ts'},
  {dir:'test-astro',name:'Astro',icon:'🚀',color:'#ff5d01',v:'4',desc:'Islands architecture for content-driven websites.',mount:null,extra:['Islands','Zero JS','Multi-Framework','Content Collections'],entry:null},
  {dir:'test-analog',name:'Analog',icon:'🔴',color:'#fe5b2b',v:'1',desc:'Full-stack Angular meta-framework with file routing.',mount:'app',extra:['Angular','Vite-based','File Routing','SSR'],entry:'src/main.ts'},
  {dir:'test-solidstart',name:'SolidStart',icon:'💎',color:'#446b9e',v:'1',desc:'Solid.js meta-framework with server-side rendering.',mount:'app',extra:['File Routing','SSR','API Routes','Solid Signals'],entry:'src/main.ts'},
  {dir:'test-tanstack-start',name:'TanStack Start',icon:'🟡',color:'#ef4444',v:'1',desc:'Full-stack React framework powered by TanStack Router.',mount:'root',extra:['TanStack Router','SSR','Isomorphic','Type-safe'],entry:'src/main.ts'},
  {dir:'test-react-router-v7',name:'React Router',icon:'🔀',color:'#e65100',v:'7',desc:'Declarative routing for React with data patterns.',mount:'root',extra:['Data Loaders','Actions','Nested Routes','SSR Ready'],entry:'src/main.ts'},
  {dir:'test-vitepress',name:'VitePress',icon:'📝',color:'#747bff',v:'1',desc:'Vite-powered static site generator for documentation.',mount:null,extra:['Markdown','Vue Components','Dark Mode','Search'],entry:null},
  {dir:'test-waku',name:'Waku',icon:'🌊',color:'#f97316',v:'0.21',desc:'Minimal React framework with React Server Components.',mount:'root',extra:['RSC','Minimal','Fast','Streaming'],entry:'src/main.ts'},
  {dir:'test-tauri',name:'Tauri',icon:'🦀',color:'#ffc131',v:'2',desc:'Desktop apps with web frontends and a Rust backend.',mount:'root',extra:['Rust Backend','Cross-platform','Native APIs','Tiny Bundle'],entry:'src/main.ts'},
  {dir:'test-electron',name:'Electron',icon:'⚡',color:'#9feaf9',v:'30',desc:'Cross-platform desktop apps with web technologies.',mount:'root',extra:['Node.js Backend','Native APIs','Cross-platform','Auto-update'],entry:'src/main.ts'},
];

function makeHTML(fw) {
  const alpha = fw.color+'20', border = fw.color+'55', glow = fw.color+'30';
  const fwSlug = fw.name.toLowerCase().replace(/[\s.]/g,'-');
  const ext = fw.entry?.split('.').pop() || 'js';
  const mountDiv = fw.mount ? `<div id="${fw.mount}" style="display:none"></div>` : '';
  const scriptTag = fw.entry ? `<script type="module" src="/${fw.entry}"></script>` : '';

  const icons = ['⚡','🔥','🦀','📦','🏎️','🌐'];
  const coreCards = fw.extra.map((e,i)=>`
    <div class="card">
      <div class="card-icon">${icons[i]||'⚡'}</div>
      <h3>${e}</h3>
      <p>${fw.name} ${e} — fully supported with zero extra config.</p>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${fw.name} + Lunx</title>
<style>${CSS}</style>
</head>
<body>
${mountDiv}
<header>
  <div class="lunx-logo">Lunx Build Tool</div>
  <h1><span class="lunx">Welcome to Lunx</span><br/>
    <span class="fw-pill" style="background:${alpha};color:${fw.color};border-color:${border};box-shadow:0 0 20px ${glow}">${fw.icon} ${fw.name}</span>
  </h1>
  <p class="subtitle">${fw.desc}</p>
  <div class="meta-row">
    <div class="meta-chip"><strong>🔧 ${fw.name} v${fw.v}</strong>Framework</div>
    <div class="meta-chip"><strong>🏗️ Lunx Engine</strong>Build Tool</div>
    <div class="meta-chip"><strong>⚡ Sub-10ms</strong>HMR Speed</div>
    <div class="meta-chip"><strong>🦀 Rust Native</strong>Core Engine</div>
  </div>
</header>

<main>
  <div class="section-head"><span>Framework Features</span></div>
  <div class="cards">
    <div class="card hero">
      <div class="hero-icon">${fw.icon}</div>
      <div class="hero-text">
        <h2>This project uses ${fw.name} v${fw.v}</h2>
        <p>Created with <strong>Lunx</strong> — the high-performance build tool powered by Rust and esbuild. Edit <code style="color:#818cf8;background:#6366f115;padding:2px 8px;border-radius:6px;font-size:13px">src/App.${ext}</code> to start building your app.</p>
      </div>
    </div>
    ${coreCards}
    <div class="card">
      <div class="card-icon">🔥</div>
      <h3>Sub-10ms HMR</h3>
      <p>Instant hot module replacement powered by Rust file watcher and WebSocket transport.</p>
    </div>
    <div class="card">
      <div class="card-icon">🏎️</div>
      <h3>Fast Cold Start</h3>
      <p>Dependencies pre-bundled and cached in SQLite for near-instant dev server boot.</p>
    </div>
  </div>

  <div class="section-head"><span>Quick Start</span></div>
  <div class="steps">
    <div class="step"><div class="sn">1</div><div><h4>Create project</h4><code>lunx create my-app --framework ${fwSlug}</code></div></div>
    <div class="step"><div class="sn">2</div><div><h4>Start dev server</h4><code>cd my-app && lunx dev</code></div></div>
    <div class="step"><div class="sn">3</div><div><h4>Edit your app</h4><code>src/App.${ext}</code></div></div>
    <div class="step"><div class="sn">4</div><div><h4>Build for prod</h4><code>lunx build --optimize</code></div></div>
  </div>

  <div class="section-head"><span>Lunx CLI</span></div>
  <div class="term">
    <div class="th">
      <div class="dot" style="background:#ef4444"></div>
      <div class="dot" style="background:#f59e0b"></div>
      <div class="dot" style="background:#22c55e"></div>
      <span class="term-title">bash</span>
    </div>
    <div class="ln"><span class="cmt"># Create a ${fw.name} project with Lunx</span></div>
    <div class="ln"><span class="prompt">$ </span><span class="cmd">lunx create my-${fwSlug}-app --framework ${fwSlug}</span></div>
    <div class="ln"><span class="ok">  ✓ Scaffolded ${fw.name} project in 0.3s</span></div>
    <div class="ln"><span class="prompt">$ </span><span class="cmd">lunx dev</span></div>
    <div class="ln"><span class="ok">  ✓ Compiled successfully!</span> <span class="dim">→ http://localhost:5173</span></div>
    <div class="ln"><span class="prompt">$ </span><span class="cmd">lunx build --optimize</span></div>
    <div class="ln"><span class="ok">  ✓ Build complete in 1.2s — 42 modules bundled</span></div>
  </div>
</main>

<footer>
  <div class="footer-glow">⚡ Powered by Lunx</div>
  <p>Built with <a href="#">Lunx Build Tool</a> · Framework: <strong style="color:${fw.color}">${fw.name} v${fw.v}</strong> · <a href="#">Documentation</a> · <a href="#">GitHub</a></p>
</footer>
${scriptTag}
</body>
</html>`;
}

let updated = 0;
for (const fw of FRAMEWORKS) {
  const dir = path.join(TESTS, fw.dir);
  if (!fs.existsSync(dir)) { console.log(`⚠ Skip: ${fw.dir}`); continue; }
  fs.writeFileSync(path.join(dir, 'index.html'), makeHTML(fw));
  console.log(`✅ ${fw.dir} → ${fw.name}`);
  updated++;
}
console.log(`\n✓ ${updated} premium templates generated`);
