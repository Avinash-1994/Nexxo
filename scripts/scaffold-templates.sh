#!/bin/bash
set -e
ROOT="/home/avinash/Desktop/framework_practis/build"
T="$ROOT/templates"
FT="$ROOT/framework-tests"

mk() { mkdir -p "$T/$1/src"; }

# ── REACT ─────────────────────────────────────────────────────────
mk react
cat > "$T/react/package.json" <<'EOF'
{"name":"lunx-react-template","version":"0.0.1","private":true,"type":"module","scripts":{"dev":"lunx dev","build":"lunx build","preview":"lunx preview","test":"playwright test"},"lunx":{"template":true,"framework":"react","description":"Lunx Tasks — task management app"},"dependencies":{"react":"18.3.1","react-dom":"18.3.1","react-router-dom":"6.23.1","@tanstack/react-query":"5.40.0","zustand":"4.5.2"},"devDependencies":{"lunx":"file:../..","@types/react":"18.3.3","@types/react-dom":"18.3.0","typescript":"5.4.5"}}
EOF
cat > "$T/react/lunx.config.ts" <<'EOF'
import { defineConfig } from 'lunx';
export default defineConfig({ framework: 'react' });
EOF
cat > "$T/react/src/main.tsx" <<'EOF'
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
EOF
cat > "$T/react/index.html" <<'EOF'
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Lunx Tasks</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>
EOF
cat > "$T/react/README.md" <<'EOF'
# Lunx Tasks — React Template
```bash
npm install && npm run dev
```
Navigate to http://localhost:5173
EOF

# ── VUE ─────────────────────────────────────────────────────────
mk vue
cat > "$T/vue/package.json" <<'EOF'
{"name":"lunx-vue-template","version":"0.0.1","private":true,"type":"module","scripts":{"dev":"lunx dev","build":"lunx build","preview":"lunx preview"},"lunx":{"template":true,"framework":"vue","description":"Lunx Shop — e-commerce storefront"},"dependencies":{"vue":"3.4.27","vue-router":"4.3.3","pinia":"2.1.7"},"devDependencies":{"lunx":"file:../..","@vitejs/plugin-vue":"5.0.4","typescript":"5.4.5"}}
EOF
cat > "$T/vue/lunx.config.ts" <<'EOF'
import { defineConfig } from 'lunx';
export default defineConfig({ framework: 'vue' });
EOF
cat > "$T/vue/index.html" <<'EOF'
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Lunx Shop</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>
EOF
cat > "$T/vue/src/main.ts" <<'EOF'
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import App from './App.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/Home.vue') },
    { path: '/products', component: () => import('./pages/Products.vue') },
    { path: '/cart', component: () => import('./pages/Cart.vue') },
    { path: '/login', component: () => import('./pages/Login.vue') },
  ]
});
createApp(App).use(router).use(createPinia()).mount('#app');
EOF
cat > "$T/vue/src/App.vue" <<'EOF'
<template>
  <div class="app">
    <nav>
      <span class="brand">🛒 Lunx Shop</span>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/products">Products</RouterLink>
      <RouterLink to="/cart">Cart ({{ cartCount }})</RouterLink>
      <RouterLink to="/login">Login</RouterLink>
    </nav>
    <RouterView/>
  </div>
</template>
<script setup lang="ts">
import { useCartStore } from './stores/cart';
import { computed } from 'vue';
const cart = useCartStore();
const cartCount = computed(() => cart.items.reduce((a,i) => a + i.qty, 0));
</script>
<style>
* { box-sizing: border-box; margin: 0; }
body { background: #0f172a; color: #f1f5f9; font-family: system-ui; }
nav { background: #1e293b; padding: 0 24px; display: flex; gap: 20px; align-items: center; height: 56px; }
nav a { color: #94a3b8; text-decoration: none; }
nav a:hover { color: #fff; }
.brand { font-weight: 700; font-size: 18px; margin-right: 16px; }
</style>
EOF
mkdir -p "$T/vue/src/stores" "$T/vue/src/pages"
cat > "$T/vue/src/stores/cart.ts" <<'EOF'
import { defineStore } from 'pinia';
export const useCartStore = defineStore('cart', {
  state: () => ({ items: [] as {id:number;name:string;price:number;qty:number}[] }),
  actions: {
    add(product: {id:number;name:string;price:number}) {
      const ex = this.items.find(i => i.id === product.id);
      if (ex) ex.qty++; else this.items.push({...product, qty:1});
    },
    remove(id: number) { this.items = this.items.filter(i => i.id !== id); }
  }
});
EOF
cat > "$T/vue/src/pages/Home.vue" <<'EOF'
<template>
  <div style="padding:32px">
    <h1>Featured Products</h1>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;margin-top:24px">
      <div v-for="p in featured" :key="p.id" style="background:#1e293b;border-radius:12px;padding:20px">
        <div style="font-size:48px;margin-bottom:12px">{{ p.emoji }}</div>
        <h3>{{ p.name }}</h3>
        <p style="color:#94a3b8;font-size:14px;margin:8px 0">{{ p.desc }}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px">
          <strong style="color:#818cf8">${{ p.price }}</strong>
          <button @click="cart.add(p)" style="padding:8px 16px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useCartStore } from '../stores/cart';
const cart = useCartStore();
const featured = [
  {id:1,name:'Wireless Headphones',price:89.99,emoji:'🎧',desc:'Premium sound with ANC'},
  {id:2,name:'Mechanical Keyboard',price:149.99,emoji:'⌨️',desc:'TKL, Cherry MX Brown'},
  {id:3,name:'USB-C Hub',price:49.99,emoji:'🔌',desc:'7-in-1, 4K HDMI'},
  {id:4,name:'Webcam 4K',price:119.99,emoji:'📸',desc:'1080p60 / 4K30'},
];
</script>
EOF
cat > "$T/vue/src/pages/Products.vue" <<'EOF'
<template>
  <div style="padding:32px">
    <h1>All Products</h1>
    <input v-model="q" placeholder="Search products..." style="padding:10px 16px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#fff;width:100%;max-width:400px;margin:16px 0"/>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px">
      <div v-for="p in filtered" :key="p.id" style="background:#1e293b;border-radius:10px;padding:20px">
        <div style="font-size:40px">{{ p.emoji }}</div>
        <h3 style="margin:12px 0 4px">{{ p.name }}</h3>
        <div style="color:#818cf8;font-weight:700">${{ p.price }}</div>
        <button @click="cart.add(p)" style="margin-top:12px;padding:8px 16px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;width:100%">Add to Cart</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCartStore } from '../stores/cart';
const cart = useCartStore();
const q = ref('');
const all = [
  {id:1,name:'Wireless Headphones',price:89.99,emoji:'🎧'},{id:2,name:'Mechanical Keyboard',price:149.99,emoji:'⌨️'},
  {id:3,name:'USB-C Hub',price:49.99,emoji:'🔌'},{id:4,name:'Webcam 4K',price:119.99,emoji:'📸'},
  {id:5,name:'Monitor Stand',price:39.99,emoji:'🖥️'},{id:6,name:'Mouse Pad XL',price:24.99,emoji:'🖱️'},
  {id:7,name:'Cable Management Kit',price:19.99,emoji:'🗂️'},{id:8,name:'LED Desk Lamp',price:59.99,emoji:'💡'},
  {id:9,name:'Laptop Stand',price:44.99,emoji:'💻'},{id:10,name:'Ethernet Adapter',price:29.99,emoji:'🌐'},
  {id:11,name:'Screen Cleaner Kit',price:14.99,emoji:'🧹'},{id:12,name:'Portable SSD 1TB',price:99.99,emoji:'💾'},
];
const filtered = computed(() => all.filter(p => p.name.toLowerCase().includes(q.value.toLowerCase())));
</script>
EOF
cat > "$T/vue/src/pages/Cart.vue" <<'EOF'
<template>
  <div style="padding:32px;max-width:600px">
    <h1>Shopping Cart</h1>
    <div v-if="!cart.items.length" style="color:#94a3b8;margin-top:24px">Your cart is empty. <RouterLink to="/products">Shop now →</RouterLink></div>
    <div v-else>
      <div v-for="item in cart.items" :key="item.id" style="background:#1e293b;border-radius:8px;padding:16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
        <div><strong>{{ item.name }}</strong><br/><span style="color:#94a3b8">Qty: {{ item.qty }}</span></div>
        <div style="display:flex;gap:12px;align-items:center">
          <strong style="color:#818cf8">${{ (item.price * item.qty).toFixed(2) }}</strong>
          <button @click="cart.remove(item.id)" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer">✕</button>
        </div>
      </div>
      <div style="text-align:right;margin-top:20px;font-size:20px">Total: <strong style="color:#818cf8">${{ total.toFixed(2) }}</strong></div>
      <button v-if="!ordered" @click="ordered=true" style="margin-top:16px;padding:14px 32px;background:#22c55e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;width:100%">Place Order</button>
      <div v-else style="color:#22c55e;text-align:center;margin-top:16px;font-size:20px">✅ Order placed! Thank you.</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCartStore } from '../stores/cart';
const cart = useCartStore();
const ordered = ref(false);
const total = computed(() => cart.items.reduce((s,i) => s + i.price*i.qty, 0));
</script>
EOF
cat > "$T/vue/src/pages/Login.vue" <<'EOF'
<template>
  <div style="padding:32px;max-width:400px">
    <h1>Sign In</h1>
    <div v-if="ok" style="color:#22c55e;margin-top:24px">✅ Welcome back! <RouterLink to="/">Go to shop →</RouterLink></div>
    <form v-else @submit.prevent="ok=true" style="display:flex;flex-direction:column;gap:16px;margin-top:24px">
      <input type="email" placeholder="Email" required style="padding:12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#fff"/>
      <input type="password" placeholder="Password" required style="padding:12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#fff"/>
      <button type="submit" style="padding:12px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600">Sign In</button>
    </form>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const ok = ref(false);
</script>
EOF

echo "✅ react + vue done"
