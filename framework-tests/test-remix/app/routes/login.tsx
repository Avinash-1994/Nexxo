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
