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
