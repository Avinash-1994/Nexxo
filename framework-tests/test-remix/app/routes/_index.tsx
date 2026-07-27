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
