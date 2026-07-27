#!/bin/bash
# Upgrade existing + create missing framework-tests projects with real content
# All use local lunx: "file:../.."
ROOT="/home/avinash/Desktop/framework_practis/build"
FT="$ROOT/framework-tests"

# ── 1. UPGRADE test-react-ts → Lunx Tasks ───────────────────────
cat > "$FT/test-react-ts/src/App.tsx" <<'EOF'
import React, { useState } from 'react';

const PROJECTS = [
  { id:1, name:'Lunx Core', tasks:12, done:8 },
  { id:2, name:'Plugin Ecosystem', tasks:34, done:29 },
  { id:3, name:'Meta-Frameworks', tasks:21, done:19 },
  { id:4, name:'Security Gate', tasks:15, done:15 },
  { id:5, name:'Browser Tests', tasks:9, done:3 },
];
const TASKS = [
  { id:1, title:'Fix SvelteKit SSR adapter', project:'Lunx Core', priority:'high', status:'done' },
  { id:2, title:'Add tRPC support to Analog', project:'Meta-Frameworks', priority:'high', status:'in-progress' },
  { id:3, title:'Implement SBOM generation', project:'Security Gate', priority:'medium', status:'done' },
  { id:4, title:'Plugin sandbox permissions', project:'Security Gate', priority:'high', status:'done' },
  { id:5, title:'Playwright E2E suite', project:'Browser Tests', priority:'high', status:'todo' },
  { id:6, title:'React Query integration', project:'Lunx Core', priority:'medium', status:'done' },
  { id:7, title:'Waku RSC support', project:'Meta-Frameworks', priority:'high', status:'done' },
  { id:8, title:'SRI hash injection', project:'Security Gate', priority:'medium', status:'done' },
];

type Tab = 'dashboard' | 'projects' | 'new-task' | 'login';
const C = { bg:'#0f172a', card:'#1e293b', border:'#334155', text:'#f1f5f9', muted:'#94a3b8', purple:'#6366f1', green:'#22c55e', amber:'#f59e0b' };

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [form, setForm] = useState({ title:'', priority:'medium', due:'' });
  const [submitted, setSubmitted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const nav = (t: Tab) => { setTab(t); setSubmitted(false); };

  return (
    <div style={{minHeight:'100vh', background:C.bg, color:C.text, fontFamily:'system-ui'}}>
      {/* NAV */}
      <nav style={{background:C.card, padding:'0 24px', display:'flex', gap:24, alignItems:'center', height:56, borderBottom:`1px solid ${C.border}`}}>
        <span style={{fontWeight:700, fontSize:18, marginRight:8}}>⚡ Lunx Tasks</span>
        {(['dashboard','projects','new-task','login'] as Tab[]).map(t => (
          <button key={t} onClick={() => nav(t)}
            style={{background:'none', border:'none', color: tab===t ? C.purple : C.muted, cursor:'pointer', fontSize:15, fontWeight: tab===t ? 600 : 400, padding:'4px 0'}}>
            {t === 'new-task' ? '+ New Task' : t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </nav>

      <div style={{padding:32, maxWidth:900, margin:'0 auto'}}>
        {/* DASHBOARD */}
        {tab === 'dashboard' && <>
          <h1 style={{margin:'0 0 24px'}}>Dashboard</h1>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:32}}>
            {[['Total Tasks', TASKS.length, C.purple], ['Completed', TASKS.filter(t=>t.status==='done').length, C.green], ['In Progress', TASKS.filter(t=>t.status==='in-progress').length, C.amber]].map(([l,v,c]) => (
              <div key={l as string} style={{background:C.card, borderRadius:12, padding:24}}>
                <div style={{color:C.muted, fontSize:14}}>{l}</div>
                <div style={{color:c as string, fontSize:36, fontWeight:700}}>{v}</div>
              </div>
            ))}
          </div>
          <h2 style={{margin:'0 0 16px'}}>Recent Tasks</h2>
          {TASKS.map(t => (
            <div key={t.id} style={{background:C.card, borderRadius:8, padding:'14px 20px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontWeight:500}}>{t.title}</div>
                <div style={{color:C.muted, fontSize:13}}>{t.project}</div>
              </div>
              <span style={{fontSize:11, textTransform:'uppercase', color: t.status==='done'?C.green:t.status==='in-progress'?C.amber:C.muted, fontWeight:600}}>
                {t.status}
              </span>
            </div>
          ))}
        </>}

        {/* PROJECTS */}
        {tab === 'projects' && <>
          <h1 style={{margin:'0 0 24px'}}>Projects</h1>
          {PROJECTS.map(p => (
            <div key={p.id} style={{background:C.card, borderRadius:10, padding:20, marginBottom:12}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                <strong style={{fontSize:17}}>{p.name}</strong>
                <span style={{color:C.muted}}>{p.done}/{p.tasks} tasks</span>
              </div>
              <div style={{background:C.bg, borderRadius:4, height:8}}>
                <div style={{background:C.purple, width:`${(p.done/p.tasks)*100}%`, height:'100%', borderRadius:4, transition:'width .3s'}}/>
              </div>
            </div>
          ))}
        </>}

        {/* NEW TASK */}
        {tab === 'new-task' && <>
          <h1 style={{margin:'0 0 24px'}}>Create New Task</h1>
          {submitted
            ? <div style={{color:C.green, fontSize:22, padding:32, background:C.card, borderRadius:12, textAlign:'center'}}>✅ Task created successfully!</div>
            : <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} style={{display:'flex', flexDirection:'column', gap:16, maxWidth:500}}>
                <input required placeholder="Task title" value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))}
                  style={{padding:12, borderRadius:8, border:`1px solid ${C.border}`, background:C.card, color:C.text, fontSize:15}}/>
                <select value={form.priority} onChange={e => setForm(f => ({...f, priority:e.target.value}))}
                  style={{padding:12, borderRadius:8, border:`1px solid ${C.border}`, background:C.card, color:C.text}}>
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </select>
                <input type="date" value={form.due} onChange={e => setForm(f => ({...f, due:e.target.value}))}
                  style={{padding:12, borderRadius:8, border:`1px solid ${C.border}`, background:C.card, color:C.text}}/>
                <button type="submit" style={{padding:'13px 24px', background:C.purple, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:16}}>
                  Create Task
                </button>
              </form>
          }
        </>}

        {/* LOGIN */}
        {tab === 'login' && <>
          <h1 style={{margin:'0 0 24px'}}>Sign In</h1>
          {loggedIn
            ? <div style={{color:C.green, fontSize:22, padding:32, background:C.card, borderRadius:12, textAlign:'center'}}>✅ Welcome back! <button onClick={() => nav('dashboard')} style={{background:'none', border:'none', color:C.purple, cursor:'pointer', fontSize:18}}>Go to Dashboard →</button></div>
            : <form onSubmit={e => { e.preventDefault(); setLoggedIn(true); }} style={{display:'flex', flexDirection:'column', gap:16, maxWidth:400}}>
                <input type="email" defaultValue="dev@lunx.dev" placeholder="Email" required
                  style={{padding:12, borderRadius:8, border:`1px solid ${C.border}`, background:C.card, color:C.text}}/>
                <input type="password" defaultValue="password" placeholder="Password" required
                  style={{padding:12, borderRadius:8, border:`1px solid ${C.border}`, background:C.card, color:C.text}}/>
                <button type="submit" style={{padding:13, background:C.purple, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:16}}>
                  Sign In
                </button>
              </form>
          }
        </>}
      </div>
    </div>
  );
}
EOF

# ── 2. UPGRADE test-vue-ts → Lunx Shop ──────────────────────────
cat > "$FT/test-vue-ts/src/App.vue" <<'EOF'
<template>
  <div style="min-height:100vh;background:#0f172a;color:#f1f5f9;font-family:system-ui">
    <nav style="background:#1e293b;padding:0 24px;display:flex;gap:20px;align-items:center;height:56px;border-bottom:1px solid #334155">
      <span style="font-weight:700;font-size:18px;margin-right:8px">🛒 Lunx Shop</span>
      <button v-for="t in tabs" :key="t" @click="tab=t"
        :style="`background:none;border:none;color:${tab===t?'#6366f1':'#94a3b8'};cursor:pointer;font-size:15px;font-weight:${tab===t?600:400};padding:4px 0`">
        {{ t === 'cart' ? `Cart (${cartCount})` : t.charAt(0).toUpperCase()+t.slice(1) }}
      </button>
    </nav>
    <div style="padding:32px;max-width:960px;margin:0 auto">

      <!-- HOME -->
      <template v-if="tab==='home'">
        <h1 style="margin:0 0 8px">Featured Products</h1>
        <p style="color:#94a3b8;margin-bottom:28px">Hand-picked for developers</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px">
          <div v-for="p in products.slice(0,4)" :key="p.id" style="background:#1e293b;border-radius:12px;padding:24px">
            <div style="font-size:44px;margin-bottom:12px">{{ p.emoji }}</div>
            <h3 style="margin:0 0 6px">{{ p.name }}</h3>
            <p style="color:#94a3b8;font-size:13px;margin:0 0 16px">{{ p.desc }}</p>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <strong style="color:#818cf8;font-size:18px">${{ p.price }}</strong>
              <button @click="addToCart(p)" style="padding:8px 16px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600">Add</button>
            </div>
          </div>
        </div>
      </template>

      <!-- PRODUCTS -->
      <template v-if="tab==='products'">
        <h1 style="margin:0 0 16px">All Products</h1>
        <input v-model="search" placeholder="Search products…"
          style="padding:10px 16px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#f1f5f9;width:100%;max-width:400px;margin-bottom:24px;display:block"/>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px">
          <div v-for="p in filtered" :key="p.id" style="background:#1e293b;border-radius:10px;padding:20px">
            <div style="font-size:38px">{{ p.emoji }}</div>
            <h3 style="margin:12px 0 4px;font-size:15px">{{ p.name }}</h3>
            <div style="color:#818cf8;font-weight:700;margin-bottom:12px">${{ p.price }}</div>
            <button @click="addToCart(p)" style="width:100%;padding:8px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer">Add to Cart</button>
          </div>
        </div>
      </template>

      <!-- CART -->
      <template v-if="tab==='cart'">
        <h1 style="margin:0 0 24px">Shopping Cart</h1>
        <div v-if="!cartItems.length" style="color:#94a3b8;font-size:18px">
          Cart is empty. <button @click="tab='products'" style="background:none;border:none;color:#6366f1;cursor:pointer;font-size:18px">Browse products →</button>
        </div>
        <template v-else>
          <div v-for="item in cartItems" :key="item.id"
            style="background:#1e293b;border-radius:8px;padding:16px 20px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <strong>{{ item.name }}</strong>
              <div style="color:#94a3b8;font-size:13px">Qty: {{ item.qty }}</div>
            </div>
            <div style="display:flex;gap:12px;align-items:center">
              <strong style="color:#818cf8">${{ (item.price*item.qty).toFixed(2) }}</strong>
              <button @click="removeItem(item.id)" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer">✕</button>
            </div>
          </div>
          <div style="text-align:right;font-size:20px;margin:16px 0">
            Total: <strong style="color:#818cf8">${{ total.toFixed(2) }}</strong>
          </div>
          <div v-if="ordered" style="color:#22c55e;font-size:20px;text-align:center;padding:20px;background:#1e293b;border-radius:10px">✅ Order placed! Thank you.</div>
          <button v-else @click="ordered=true"
            style="width:100%;padding:14px;background:#22c55e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:16px">
            Place Order
          </button>
        </template>
      </template>

      <!-- LOGIN -->
      <template v-if="tab==='login'">
        <h1 style="margin:0 0 24px">Sign In</h1>
        <div v-if="loggedIn" style="color:#22c55e;font-size:20px;padding:24px;background:#1e293b;border-radius:10px;text-align:center">
          ✅ Welcome back! <button @click="tab='home'" style="background:none;border:none;color:#6366f1;cursor:pointer;font-size:20px">Shop now →</button>
        </div>
        <form v-else @submit.prevent="loggedIn=true" style="display:flex;flex-direction:column;gap:16px;max-width:400px">
          <input type="email" placeholder="Email" defaultValue="dev@lunx.dev" required
            style="padding:12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#f1f5f9"/>
          <input type="password" placeholder="Password" required
            style="padding:12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#f1f5f9"/>
          <button type="submit" style="padding:13px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:16px">Sign In</button>
        </form>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
const tabs = ['home','products','cart','login'];
const tab = ref('home');
const search = ref('');
const ordered = ref(false);
const loggedIn = ref(false);
const products = [
  {id:1,name:'Wireless Headphones',price:89.99,emoji:'🎧',desc:'Premium ANC, 30h battery'},
  {id:2,name:'Mechanical Keyboard',price:149.99,emoji:'⌨️',desc:'TKL, Cherry MX Brown'},
  {id:3,name:'USB-C Hub 7-in-1',price:49.99,emoji:'🔌',desc:'4K HDMI, 100W PD'},
  {id:4,name:'Webcam 1080p60',price:79.99,emoji:'📸',desc:'Auto-focus, privacy cover'},
  {id:5,name:'Monitor Stand Pro',price:39.99,emoji:'🖥️',desc:'Adjustable height, cable mgmt'},
  {id:6,name:'Mouse Pad XL',price:24.99,emoji:'🖱️',desc:'900×400mm, stitched edge'},
  {id:7,name:'Portable SSD 1TB',price:99.99,emoji:'💾',desc:'1050MB/s, USB 3.2 Gen 2'},
  {id:8,name:'LED Desk Lamp',price:59.99,emoji:'💡',desc:'Wireless charge, 5 color temps'},
];
const cartItems = ref<{id:number;name:string;price:number;qty:number}[]>([]);
const cartCount = computed(() => cartItems.value.reduce((s,i) => s+i.qty, 0));
const total = computed(() => cartItems.value.reduce((s,i) => s+i.price*i.qty, 0));
const filtered = computed(() => products.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase())));
function addToCart(p: typeof products[0]) {
  const ex = cartItems.value.find(i => i.id===p.id);
  if (ex) ex.qty++; else cartItems.value.push({...p, qty:1});
}
function removeItem(id: number) { cartItems.value = cartItems.value.filter(i => i.id!==id); }
</script>
EOF

# ── 3. UPGRADE test-svelte-ts → Lunx Notes ──────────────────────
cat > "$FT/test-svelte-ts/src/App.svelte" <<'EOF'
<script lang="ts">
  import { writable } from 'svelte/store';
  const notes = writable([
    {id:1,title:'Getting Started with Lunx',folder:'work',updated:'2026-05-14',
     content:'# Getting Started\n\nLunx is a **fast** build tool powered by SWC.\n\n- Zero config for 19 meta-frameworks\n- Sub-100ms HMR (p50: 12ms)\n- Built-in security pipeline'},
    {id:2,title:'Q2 Review Notes',folder:'work',updated:'2026-05-13',
     content:'## Q2 Review\n\n- 303 tests passing\n- 19 framework adapters\n- Security gate live'},
    {id:3,title:'Book List 2026',folder:'personal',updated:'2026-05-10',
     content:'# Books\n\n1. Pragmatic Programmer\n2. Clean Architecture\n3. Designing Data-Intensive Apps'},
    {id:4,title:'Recipe: Pasta Arrabbiata',folder:'personal',updated:'2026-05-09',
     content:'## Ingredients\n\n- 400g penne\n- 4 garlic cloves\n- 1 can crushed tomatoes\n- Chilli flakes'},
  ]);
  let selected = 1;
  let editing = false;
  $: note = $notes.find(n => n.id === selected);
</script>
<div style="display:flex;height:100vh;background:#0f172a;color:#f1f5f9;font-family:system-ui">
  <aside style="width:260px;background:#1e293b;border-right:1px solid #334155;display:flex;flex-direction:column">
    <div style="padding:16px 20px;font-weight:700;font-size:18px;border-bottom:1px solid #334155">📝 Lunx Notes</div>
    <div style="padding:8px;overflow-y:auto">
      {#each $notes as n}
        <button on:click={() => { selected=n.id; editing=false; }}
          style="width:100%;text-align:left;padding:12px;border-radius:8px;border:none;background:{selected===n.id?'#334155':'transparent'};color:#f1f5f9;cursor:pointer;margin-bottom:4px">
          <div style="font-weight:600;font-size:14px">{n.title}</div>
          <div style="color:#94a3b8;font-size:12px;margin-top:2px">{n.folder} · {n.updated}</div>
        </button>
      {/each}
    </div>
  </aside>
  <main style="flex:1;display:flex;flex-direction:column;overflow:hidden">
    {#if note}
      <div style="padding:14px 24px;border-bottom:1px solid #334155;display:flex;justify-content:space-between;align-items:center;background:#1e293b">
        <h2 style="margin:0;font-size:18px">{note.title}</h2>
        <button on:click={() => editing=!editing}
          style="padding:7px 16px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600">
          {editing?'Preview':'Edit'}
        </button>
      </div>
      <div style="flex:1;padding:28px;overflow:auto">
        {#if editing}
          <textarea bind:value={note.content}
            style="width:100%;height:100%;background:#1e293b;color:#f1f5f9;border:1px solid #334155;border-radius:8px;padding:16px;font-size:14px;font-family:monospace;resize:none;line-height:1.6"/>
        {:else}
          <pre style="white-space:pre-wrap;font-family:system-ui;line-height:1.8;color:#e2e8f0;font-size:15px">{note.content}</pre>
        {/if}
      </div>
    {/if}
  </main>
</div>
EOF

# ── 4. UPGRADE test-vue-ts index.html ─────────────────────────────
cat > "$FT/test-vue-ts/index.html" <<'EOF'
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Lunx Shop</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>
EOF

# ── 5. Fix index.html for react-ts ───────────────────────────────
cat > "$FT/test-react-ts/index.html" <<'EOF'
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Lunx Tasks</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>
EOF

cat > "$FT/test-svelte-ts/index.html" <<'EOF'
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Lunx Notes</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>
EOF

echo "✅ React, Vue, Svelte upgraded"
