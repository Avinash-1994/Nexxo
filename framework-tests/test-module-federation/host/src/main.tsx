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
