#!/bin/bash
# Part 2: Create new projects in framework-tests/ for sveltekit, remix, vanilla, MFE
set -e
FT="/home/avinash/Desktop/framework_practis/build/framework-tests"

# ── SVELTEKIT — lunx-blog ────────────────────────────────────────
mkdir -p "$FT/lunx-blog/src/routes/blog"
cat > "$FT/lunx-blog/package.json" <<'EOF'
{"name":"lunx-blog","version":"0.0.1","private":true,"type":"module",
"scripts":{"dev":"node ../../dist/cli.js dev","build":"node ../../dist/cli.js build"},
"dependencies":{"@sveltejs/kit":"2.5.18","svelte":"4.2.18"},
"devDependencies":{"typescript":"5.4.5"}}
EOF
cat > "$FT/lunx-blog/lunx.config.ts" <<'EOF'
const defineConfig = (c: any) => c;
export default defineConfig({ framework: 'sveltekit' });
EOF
cat > "$FT/lunx-blog/index.html" <<'EOF'
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Lunx Blog</title></head><body><div id="app"></div><script type="module" src="/src/routes/+page.svelte"></script></body></html>
EOF
cat > "$FT/lunx-blog/src/routes/+page.svelte" <<'EOF'
<script lang="ts">
  const posts = [
    {slug:'lunx-1-0',title:'Lunx 1.0: Production-Ready Build Tool',date:'2026-05-14',category:'Engineering',excerpt:'303 tests, 19 framework adapters, security gate — Lunx 1.0 is ready.'},
    {slug:'sveltekit-ssr',title:'SvelteKit SSR with Lunx: Zero Config',date:'2026-05-10',category:'Tutorial',excerpt:'How Lunx auto-detects SvelteKit and configures SSR with no config.'},
    {slug:'security-gate',title:'Designing a CVE Security Gate',date:'2026-05-06',category:'Security',excerpt:'Build-time CVE scanner with OSV, blocks HIGH severity by default.'},
    {slug:'mfe-2026',title:'Module Federation in 2026',date:'2026-05-01',category:'Architecture',excerpt:'Native MFE across React, Vue, Angular with zero configuration.'},
    {slug:'hmr-performance',title:'How Lunx HMR Hits 12ms p50',date:'2026-04-28',category:'Performance',excerpt:'The uWS + WebSocket pipeline that makes 12ms HMR possible.'},
  ];
</script>
<div style="min-height:100vh;background:#0f172a;color:#f1f5f9;font-family:system-ui">
  <header style="background:#1e293b;padding:24px;border-bottom:1px solid #334155">
    <h1 style="margin:0;font-size:28px">⚡ Lunx Blog</h1>
    <p style="color:#94a3b8;margin:8px 0 0">Engineering insights from the Lunx team</p>
  </header>
  <main style="padding:32px;max-width:800px;margin:0 auto">
    {#each posts as post}
      <article style="background:#1e293b;border-radius:12px;padding:24px;margin-bottom:20px">
        <div style="color:#818cf8;font-size:12px;text-transform:uppercase;letter-spacing:1px">{post.category} · {post.date}</div>
        <h2 style="margin:12px 0 8px;font-size:20px">{post.title}</h2>
        <p style="color:#94a3b8;line-height:1.6;margin:0">{post.excerpt}</p>
        <a href="/blog/{post.slug}" style="display:inline-block;margin-top:14px;color:#6366f1;text-decoration:none;font-weight:600">Read more →</a>
      </article>
    {/each}
  </main>
</div>
EOF

# ── REMIX — lunx-jobs ────────────────────────────────────────────
mkdir -p "$FT/lunx-jobs/app/routes"
cat > "$FT/lunx-jobs/package.json" <<'EOF'
{"name":"lunx-jobs","version":"0.0.1","private":true,"type":"module",
"scripts":{"dev":"node ../../dist/cli.js dev","build":"node ../../dist/cli.js build"},
"dependencies":{"react":"18.3.1","react-dom":"18.3.1"},
"devDependencies":{"typescript":"5.4.5"}}
EOF
cat > "$FT/lunx-jobs/lunx.config.ts" <<'EOF'
const defineConfig = (c: any) => c;
export default defineConfig({ framework: 'remix' });
EOF
cat > "$FT/lunx-jobs/index.html" <<'EOF'
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Lunx Jobs</title></head><body><div id="root"></div><script type="module" src="/app/routes/index.tsx"></script></body></html>
EOF
cat > "$FT/lunx-jobs/app/routes/index.tsx" <<'EOF'
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const JOBS = [
  {id:1,title:'Senior Frontend Engineer',company:'Vercel',location:'Remote',salary:'$180k–$220k',stack:['React','Next.js','TypeScript']},
  {id:2,title:'Staff Engineer — Build Tools',company:'Lunx Inc.',location:'Remote / SF',salary:'$200k–$250k',stack:['Rust','TypeScript','Node']},
  {id:3,title:'DevRel Engineer',company:'Cloudflare',location:'Remote',salary:'$150k–$190k',stack:['Workers','Svelte','Vue']},
  {id:4,title:'Platform Engineer',company:'Netlify',location:'Remote',salary:'$160k–$200k',stack:['Go','React','Terraform']},
  {id:5,title:'Full-Stack Engineer',company:'Linear',location:'Remote',salary:'$170k–$210k',stack:['React','Node','GraphQL']},
  {id:6,title:'Compiler Engineer',company:'SWC',location:'Remote',salary:'$190k–$240k',stack:['Rust','LLVM','TypeScript']},
];

function App() {
  const [view, setView] = useState<'list'|'apply'>('list');
  const [applyId, setApplyId] = useState(0);
  const [applied, setApplied] = useState(false);
  const [form, setForm] = useState({name:'',email:'',cover:''});

  if (view === 'apply') {
    const job = JOBS.find(j => j.id === applyId)!;
    return (
      <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'system-ui',padding:32}}>
        <button onClick={() => { setView('list'); setApplied(false); }} style={{background:'none',border:'none',color:'#6366f1',cursor:'pointer',fontSize:16,marginBottom:24}}>← Back to Jobs</button>
        <h1>Apply: {job.title} at {job.company}</h1>
        {applied
          ? <div style={{color:'#22c55e',fontSize:22,padding:32,background:'#1e293b',borderRadius:12,textAlign:'center',marginTop:24}}>✅ Application submitted for {form.name}!</div>
          : <form onSubmit={e=>{e.preventDefault();setApplied(true)}} style={{display:'flex',flexDirection:'column',gap:16,maxWidth:500,marginTop:24}}>
              <input required placeholder="Full name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={{padding:12,borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#fff'}}/>
              <input type="email" required placeholder="Email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} style={{padding:12,borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#fff'}}/>
              <textarea rows={5} placeholder="Cover letter" value={form.cover} onChange={e=>setForm(f=>({...f,cover:e.target.value}))} style={{padding:12,borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#fff'}}/>
              <button type="submit" style={{padding:14,background:'#6366f1',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:16}}>Submit Application</button>
            </form>}
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'system-ui'}}>
      <nav style={{background:'#1e293b',padding:'0 24px',display:'flex',alignItems:'center',height:56,borderBottom:'1px solid #334155'}}>
        <span style={{fontWeight:700,fontSize:18}}>💼 Lunx Jobs</span>
        <span style={{marginLeft:'auto',color:'#94a3b8',fontSize:14}}>{JOBS.length} open positions</span>
      </nav>
      <div style={{padding:32,maxWidth:860px,margin:'0 auto'}}>
        <h1 style={{margin:'0 0 8px'}}>Find Your Next Role</h1>
        <p style={{color:'#94a3b8',marginBottom:32}}>Remote-first opportunities at top companies</p>
        {JOBS.map(job => (
          <div key={job.id} style={{background:'#1e293b',borderRadius:12,padding:24,marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div><h2 style={{margin:'0 0 4px',fontSize:20}}>{job.title}</h2><div style={{color:'#94a3b8'}}>{job.company} · {job.location}</div></div>
              <div style={{textAlign:'right'}}><div style={{color:'#22c55e',fontWeight:700}}>{job.salary}</div></div>
            </div>
            <div style={{display:'flex',gap:8,margin:'14px 0'}}>
              {job.stack.map(s => <span key={s} style={{background:'#0f172a',padding:'4px 12px',borderRadius:999,fontSize:12,color:'#818cf8'}}>{s}</span>)}
            </div>
            <button onClick={() => { setApplyId(job.id); setView('apply'); }}
              style={{padding:'10px 20px',background:'#6366f1',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>Apply Now →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<App/>);
EOF

# ── VANILLA KANBAN — lunx-kanban ────────────────────────────────
mkdir -p "$FT/lunx-kanban/src"
cat > "$FT/lunx-kanban/package.json" <<'EOF'
{"name":"lunx-kanban","version":"0.0.1","private":true,"type":"module",
"scripts":{"dev":"node ../../dist/cli.js dev","build":"node ../../dist/cli.js build"},
"devDependencies":{"typescript":"5.4.5"}}
EOF
cat > "$FT/lunx-kanban/lunx.config.ts" <<'EOF'
const defineConfig = (c: any) => c;
export default defineConfig({ framework: 'vanilla', entry: 'src/main.ts' });
EOF
cat > "$FT/lunx-kanban/index.html" <<'EOF'
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Lunx Kanban</title><style>*{box-sizing:border-box;margin:0}body{background:#0f172a;color:#f1f5f9;font-family:system-ui}</style></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>
EOF
cat > "$FT/lunx-kanban/src/main.ts" <<'EOF'
interface Card { id:string; title:string; priority:'low'|'medium'|'high'; }
interface Col { id:string; title:string; cards:Card[]; }
const SEED:Col[] = [
  {id:'backlog',title:'📋 Backlog',cards:[
    {id:'1',title:'Implement OAuth 2.0 login',priority:'high'},
    {id:'2',title:'Add CSV export to reports',priority:'medium'},
    {id:'3',title:'Write API documentation',priority:'low'},
  ]},
  {id:'todo',title:'📝 To Do',cards:[
    {id:'4',title:'Set up CI/CD pipeline',priority:'high'},
    {id:'5',title:'Design onboarding flow',priority:'medium'},
  ]},
  {id:'doing',title:'⚡ In Progress',cards:[
    {id:'6',title:'Integrate Stripe billing',priority:'high'},
    {id:'7',title:'Fix SvelteKit SSR adapter',priority:'high'},
  ]},
  {id:'done',title:'✅ Done',cards:[
    {id:'8',title:'Security gate CVE scanning',priority:'high'},
    {id:'9',title:'Plugin sandbox permissions',priority:'medium'},
    {id:'10',title:'SRI hash injection',priority:'low'},
  ]},
];
let state:Col[] = JSON.parse(localStorage.getItem('lunx-kanban')||'null')??SEED;
let drag:{cardId:string;fromCol:string}|null=null;
function pc(p:string){return p==='high'?'#ef4444':p==='medium'?'#f59e0b':'#22c55e';}
function save(){localStorage.setItem('lunx-kanban',JSON.stringify(state));}
function render(){
  const app=document.getElementById('app')!;
  app.innerHTML=`<div style="padding:24px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <h1 style="font-size:24px">🗂️ Lunx Kanban</h1>
      <span style="color:#94a3b8;font-size:14px">${state.reduce((s,c)=>s+c.cards.length,0)} cards</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
      ${state.map(col=>`
        <div data-col="${col.id}" style="background:#1e293b;border-radius:12px;padding:16px;min-height:380px"
          ondragover="event.preventDefault()" ondrop="window._drop('${col.id}')">
          <div style="font-weight:700;margin-bottom:14px;display:flex;justify-content:space-between">
            ${col.title}<span style="background:#0f172a;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:400">${col.cards.length}</span>
          </div>
          ${col.cards.map(card=>`
            <div draggable="true" data-id="${card.id}" data-col="${col.id}"
              style="background:#0f172a;border-radius:8px;padding:14px;margin-bottom:10px;border-left:3px solid ${pc(card.priority)};cursor:grab">
              <div style="font-size:14px;line-height:1.4">${card.title}</div>
              <div style="margin-top:8px;display:flex;justify-content:space-between">
                <span style="color:${pc(card.priority)};font-size:11px;text-transform:uppercase">${card.priority}</span>
                <button onclick="window._del('${card.id}','${col.id}')" style="background:none;border:none;color:#64748b;cursor:pointer">🗑</button>
              </div>
            </div>`).join('')}
          <button onclick="window._add('${col.id}')"
            style="width:100%;padding:10px;background:#334155;color:#94a3b8;border:none;border-radius:8px;cursor:pointer;margin-top:8px">+ Add Card</button>
        </div>`).join('')}
    </div>
  </div>`;
  document.querySelectorAll('[draggable]').forEach(el=>{
    el.addEventListener('dragstart',()=>{drag={cardId:(el as HTMLElement).dataset.id!,fromCol:(el as HTMLElement).dataset.col!};});
  });
}
(window as any)._drop=(toCol:string)=>{
  if(!drag||drag.fromCol===toCol)return;
  const from=state.find(c=>c.id===drag!.fromCol)!,to=state.find(c=>c.id===toCol)!;
  const [card]=from.cards.splice(from.cards.findIndex(c=>c.id===drag!.cardId),1);
  to.cards.push(card);drag=null;save();render();
};
(window as any)._del=(cardId:string,colId:string)=>{
  state.find(c=>c.id===colId)!.cards=state.find(c=>c.id===colId)!.cards.filter(c=>c.id!==cardId);save();render();
};
(window as any)._add=(colId:string)=>{
  const t=prompt('Card title:');if(!t)return;
  state.find(c=>c.id===colId)!.cards.unshift({id:Date.now().toString(),title:t,priority:'medium'});save();render();
};
render();
EOF

# ── MFE host/remote upgrade ───────────────────────────────────────
mkdir -p "$FT/mfe-demo/host/src" "$FT/mfe-demo/remote/src"
cat > "$FT/mfe-demo/host/package.json" <<'EOF'
{"name":"lunx-mfe-host","version":"0.0.1","private":true,"type":"module",
"scripts":{"dev":"node ../../../dist/cli.js dev","build":"node ../../../dist/cli.js build"},
"dependencies":{"react":"18.3.1","react-dom":"18.3.1"},
"devDependencies":{"typescript":"5.4.5"}}
EOF
cat > "$FT/mfe-demo/host/lunx.config.ts" <<'EOF'
const defineConfig=(c:any)=>c;
export default defineConfig({
  framework:'react',
  mfe:{ name:'host', remotes:{ reactRemote:'http://localhost:5175/remoteEntry.js' }, shared:{ react:{singleton:true},'react-dom':{singleton:true} } }
});
EOF
cat > "$FT/mfe-demo/host/index.html" <<'EOF'
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Lunx MFE Host</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>
EOF
cat > "$FT/mfe-demo/host/src/main.tsx" <<'EOF'
import React, { Suspense, useState } from 'react';
import { createRoot } from 'react-dom/client';
const RemoteDashboard = React.lazy(() => import('reactRemote/Dashboard'));
function App() {
  const [show, setShow] = useState(false);
  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'system-ui',padding:32}}>
      <h1 style={{marginBottom:24}}>⚡ Lunx MFE Host (React)</h1>
      <div style={{background:'#1e293b',borderRadius:12,padding:24,maxWidth:600}}>
        <h2 style={{color:'#61dafb',marginBottom:16}}>React Remote Dashboard</h2>
        {show
          ? <Suspense fallback={<div style={{color:'#94a3b8'}}>Loading remote...</div>}><RemoteDashboard/></Suspense>
          : <button onClick={()=>setShow(true)} style={{padding:'10px 20px',background:'#6366f1',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>Load Remote Widget</button>
        }
      </div>
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<App/>);
EOF

cat > "$FT/mfe-demo/remote/package.json" <<'EOF'
{"name":"lunx-mfe-remote","version":"0.0.1","private":true,"type":"module",
"scripts":{"dev":"node ../../../dist/cli.js dev","build":"node ../../../dist/cli.js build"},
"dependencies":{"react":"18.3.1","react-dom":"18.3.1"},
"devDependencies":{"typescript":"5.4.5"}}
EOF
cat > "$FT/mfe-demo/remote/lunx.config.ts" <<'EOF'
const defineConfig=(c:any)=>c;
export default defineConfig({
  framework:'react',
  dev:{ port:5175 },
  mfe:{ name:'reactRemote', exposes:{'./Dashboard':'./src/Dashboard.tsx'}, shared:{ react:{singleton:true},'react-dom':{singleton:true} } }
});
EOF
cat > "$FT/mfe-demo/remote/src/Dashboard.tsx" <<'EOF'
import React, { useState } from 'react';
const METRICS=[['Active Users','12,840','+8.3%'],['Revenue (MTD)','$84,220','+12.1%'],['Avg Session','4m 32s','-0.8%']];
export default function Dashboard() {
  const [n,setN]=useState(0);
  return (
    <div>
      <p style={{color:'#94a3b8',fontSize:13,marginBottom:12}}>React 18.3 — MFE Remote via Module Federation</p>
      {METRICS.map(([l,v,d])=>(
        <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #334155'}}>
          <span style={{color:'#94a3b8'}}>{l}</span>
          <span><strong style={{color:'#61dafb'}}>{v}</strong> <span style={{color:d.startsWith('+')?'#22c55e':'#ef4444',fontSize:12}}>{d}</span></span>
        </div>
      ))}
      <button onClick={()=>setN(n+1)} style={{marginTop:16,padding:'8px 16px',background:'#61dafb',color:'#000',border:'none',borderRadius:6,cursor:'pointer',fontWeight:600}}>Clicked {n}×</button>
    </div>
  );
}
EOF

echo "✅ lunx-blog, lunx-jobs, lunx-kanban, mfe-demo created"
