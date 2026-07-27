import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const PROJECTS = [
  { id: 1, name: 'Lunx Core', tasks: 12, done: 8 },
  { id: 2, name: 'Plugin Ecosystem', tasks: 34, done: 29 },
  { id: 3, name: 'Meta-Frameworks', tasks: 21, done: 19 },
  { id: 4, name: 'Security Gate', tasks: 15, done: 15 },
  { id: 5, name: 'Browser Tests', tasks: 9, done: 3 },
];
const TASKS = [
  { id:1, title:'Fix SvelteKit SSR adapter', project:1, priority:'high', status:'done', due:'2026-05-10' },
  { id:2, title:'Add tRPC support to Analog', project:3, priority:'high', status:'in-progress', due:'2026-05-20' },
  { id:3, title:'Implement SBOM generation', project:4, priority:'medium', status:'done', due:'2026-05-12' },
  { id:4, title:'Plugin sandbox permissions', project:4, priority:'high', status:'done', due:'2026-05-15' },
  { id:5, title:'Playwright E2E suite', project:5, priority:'high', status:'todo', due:'2026-05-25' },
  { id:6, title:'React Query integration', project:1, priority:'medium', status:'done', due:'2026-05-08' },
  { id:7, title:'Waku RSC support', project:3, priority:'high', status:'done', due:'2026-05-18' },
  { id:8, title:'SRI hash injection', project:4, priority:'medium', status:'done', due:'2026-05-14' },
];

const qc = new QueryClient();

function Nav() {
  const links = [['/', 'Dashboard'], ['/projects', 'Projects'], ['/tasks/new', '+ New Task'], ['/settings', 'Settings']];
  return (
    <nav style={{background:'#0f172a',color:'#fff',padding:'0 24px',display:'flex',gap:24,alignItems:'center',height:56}}>
      <span style={{fontWeight:700,fontSize:18,marginRight:16}}>⚡ Lunx Tasks</span>
      {links.map(([to, label]) => (
        <NavLink key={to} to={to} style={({isActive})=>({color: isActive ? '#818cf8' : '#94a3b8', textDecoration:'none', fontWeight: isActive ? 600 : 400})}>{label}</NavLink>
      ))}
    </nav>
  );
}

function Dashboard() {
  const total = TASKS.length, done = TASKS.filter(t=>t.status==='done').length;
  return (
    <div style={{padding:32}}>
      <h1 style={{margin:'0 0 24px'}}>Dashboard</h1>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:32}}>
        {[['Total Tasks', total, '#6366f1'],['Completed', done, '#22c55e'],['In Progress', TASKS.filter(t=>t.status==='in-progress').length, '#f59e0b']].map(([l,v,c])=>(
          <div key={l as string} style={{background:'#1e293b',borderRadius:12,padding:24}}>
            <div style={{color:'#94a3b8',fontSize:14}}>{l}</div>
            <div style={{color:c as string,fontSize:36,fontWeight:700}}>{v}</div>
          </div>
        ))}
      </div>
      <h2>Recent Tasks</h2>
      {TASKS.slice(0,5).map(t=>(
        <div key={t.id} style={{background:'#1e293b',borderRadius:8,padding:16,marginBottom:8,display:'flex',justifyContent:'space-between'}}>
          <span>{t.title}</span>
          <span style={{color: t.status==='done'?'#22c55e': t.status==='in-progress'?'#f59e0b':'#94a3b8',fontSize:12,textTransform:'uppercase'}}>{t.status}</span>
        </div>
      ))}
    </div>
  );
}

function Projects() {
  return (
    <div style={{padding:32}}>
      <h1>Projects</h1>
      {PROJECTS.map(p=>(
        <div key={p.id} style={{background:'#1e293b',borderRadius:8,padding:20,marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
            <strong>{p.name}</strong>
            <span style={{color:'#94a3b8'}}>{p.done}/{p.tasks} tasks</span>
          </div>
          <div style={{background:'#0f172a',borderRadius:4,height:6}}>
            <div style={{background:'#6366f1',width:`${(p.done/p.tasks)*100}%`,height:'100%',borderRadius:4}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function NewTask() {
  const [done, setDone] = React.useState(false);
  const [form, setForm] = React.useState({title:'',desc:'',priority:'medium',due:''});
  if (done) return <div style={{padding:32,color:'#22c55e',fontSize:24}}>✅ Task created!</div>;
  return (
    <div style={{padding:32,maxWidth:600}}>
      <h1>New Task</h1>
      <form onSubmit={e=>{e.preventDefault();setDone(true)}} style={{display:'flex',flexDirection:'column',gap:16}}>
        <input required placeholder="Task title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={{padding:12,borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#fff'}}/>
        <textarea placeholder="Description" value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} rows={4} style={{padding:12,borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#fff'}}/>
        <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} style={{padding:12,borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#fff'}}>
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>
        <input type="date" value={form.due} onChange={e=>setForm(f=>({...f,due:e.target.value}))} style={{padding:12,borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#fff'}}/>
        <button type="submit" style={{padding:'12px 24px',background:'#6366f1',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>Create Task</button>
      </form>
    </div>
  );
}

function Login() {
  const [ok, setOk] = React.useState(false);
  if (ok) return <div style={{padding:32,color:'#22c55e'}}>✅ Logged in! <Link to="/">Go to Dashboard</Link></div>;
  return (
    <div style={{padding:32,maxWidth:400}}>
      <h1>Sign In</h1>
      <form onSubmit={e=>{e.preventDefault();setOk(true)}} style={{display:'flex',flexDirection:'column',gap:16}}>
        <input type="email" placeholder="Email" defaultValue="dev@lunx.dev" required style={{padding:12,borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#fff'}}/>
        <input type="password" placeholder="Password" defaultValue="password" required style={{padding:12,borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#fff'}}/>
        <button type="submit" style={{padding:12,background:'#6366f1',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>Sign In</button>
      </form>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'system-ui'}}>
          <Nav/>
          <Routes>
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/projects" element={<Projects/>}/>
            <Route path="/tasks/new" element={<NewTask/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/settings" element={<div style={{padding:32}}><h1>Settings</h1><p style={{color:'#94a3b8'}}>User preferences coming soon.</p></div>}/>
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App/>);
