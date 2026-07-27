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
