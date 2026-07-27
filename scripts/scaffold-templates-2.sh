#!/bin/bash
# Part 2: sveltekit, nuxt, remix, nextjs, astro, solidstart, qwik, tanstack-start, analog, waku, react-router-v7, vitepress, electron, tauri, vanilla, svelte, solid, preact, angular
set -e
ROOT="/home/avinash/Desktop/framework_practis/build"
T="$ROOT/templates"
mk() { mkdir -p "$T/$1/src"; }

# ── SVELTE ────────────────────────────────────────────────────────
mk svelte
cat > "$T/svelte/package.json" <<'EOF'
{"name":"lunx-svelte-template","version":"0.0.1","private":true,"type":"module","scripts":{"dev":"lunx dev","build":"lunx build","preview":"lunx preview"},"lunx":{"template":true,"framework":"svelte","description":"Lunx Notes — markdown note-taking app"},"dependencies":{"svelte":"4.2.18","marked":"12.0.0"},"devDependencies":{"lunx":"file:../..","typescript":"5.4.5"}}
EOF
cat > "$T/svelte/lunx.config.ts" <<'EOF'
import { defineConfig } from 'lunx';
export default defineConfig({ framework: 'svelte' });
EOF
cat > "$T/svelte/index.html" <<'EOF'
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Lunx Notes</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>
EOF
cat > "$T/svelte/src/main.ts" <<'EOF'
import App from './App.svelte';
const app = new (App as any)({ target: document.getElementById('app') });
export default app;
EOF
cat > "$T/svelte/src/App.svelte" <<'EOF'
<script lang="ts">
  import { writable } from 'svelte/store';
  const notes = writable([
    { id:1, title:'Getting Started with Lunx', content:'# Getting Started\n\nLunx is a **fast** build tool powered by SWC and LightningCSS.\n\n- Zero config for all major frameworks\n- Sub-100ms HMR\n- Built-in security pipeline', folder:'work', updated: '2026-05-14' },
    { id:2, title:'Meeting Notes — Q2 Review', content:'## Q2 Review\n\n- Shipped 19 meta-framework adapters\n- 303 tests passing\n- Security gate with CVE scanning live', folder:'work', updated: '2026-05-13' },
    { id:3, title:'Book List 2026', content:'# Books to Read\n\n1. The Pragmatic Programmer\n2. Clean Architecture\n3. Designing Data-Intensive Applications', folder:'personal', updated: '2026-05-10' },
    { id:4, title:'Recipe: Pasta Arrabbiata', content:'## Ingredients\n\n- 400g penne\n- 4 cloves garlic\n- 1 can crushed tomatoes\n- Red chilli flakes', folder:'personal', updated: '2026-05-09' },
  ]);
  let selected = 1;
  let editing = false;

  $: note = $notes.find(n => n.id === selected);
  $: preview = note ? note.content : '';
</script>

<div style="display:flex;height:100vh;background:#0f172a;color:#f1f5f9;font-family:system-ui">
  <aside style="width:260px;background:#1e293b;border-right:1px solid #334155;display:flex;flex-direction:column">
    <div style="padding:16px;font-weight:700;font-size:18px;border-bottom:1px solid #334155">📝 Lunx Notes</div>
    <div style="padding:8px">
      {#each $notes as n}
        <button on:click={() => selected = n.id} style="width:100%;text-align:left;padding:12px;border-radius:8px;border:none;background:{selected===n.id?'#334155':'transparent'};color:#f1f5f9;cursor:pointer;margin-bottom:4px">
          <div style="font-weight:600;font-size:14px">{n.title}</div>
          <div style="color:#94a3b8;font-size:12px">{n.folder} · {n.updated}</div>
        </button>
      {/each}
    </div>
  </aside>
  <main style="flex:1;display:flex;flex-direction:column">
    {#if note}
      <div style="padding:16px 24px;border-bottom:1px solid #334155;display:flex;justify-content:space-between;align-items:center">
        <h2 style="margin:0">{note.title}</h2>
        <button on:click={() => editing = !editing} style="padding:8px 16px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer">{editing ? 'Preview' : 'Edit'}</button>
      </div>
      <div style="flex:1;padding:24px;overflow:auto">
        {#if editing}
          <textarea bind:value={note.content} style="width:100%;height:100%;background:#1e293b;color:#f1f5f9;border:1px solid #334155;border-radius:8px;padding:16px;font-size:15px;font-family:monospace;resize:none"/>
        {:else}
          <div style="max-width:720px">{@html preview}</div>
        {/if}
      </div>
    {/if}
  </main>
</div>
EOF

# ── SOLID ────────────────────────────────────────────────────────
mk solid
cat > "$T/solid/package.json" <<'EOF'
{"name":"lunx-solid-template","version":"0.0.1","private":true,"type":"module","scripts":{"dev":"lunx dev","build":"lunx build","preview":"lunx preview"},"lunx":{"template":true,"framework":"solid","description":"Lunx Analytics — website analytics dashboard"},"dependencies":{"solid-js":"1.8.17"},"devDependencies":{"lunx":"file:../..","typescript":"5.4.5"}}
EOF
cat > "$T/solid/lunx.config.ts" <<'EOF'
import { defineConfig } from 'lunx';
export default defineConfig({ framework: 'solid' });
EOF
cat > "$T/solid/index.html" <<'EOF'
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Lunx Analytics</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>
EOF
cat > "$T/solid/src/main.tsx" <<'EOF'
import { render } from 'solid-js/web';
import { createSignal, For, Show } from 'solid-js';

const genDays = (n: number) => Array.from({length:n}, (_,i) => {
  const d = new Date(); d.setDate(d.getDate()-i);
  return { date: d.toISOString().slice(0,10), visitors: Math.floor(800+Math.random()*1200), pageviews: Math.floor(1500+Math.random()*3000), bounce: Math.floor(30+Math.random()*25) };
}).reverse();

const data = genDays(30);
const SOURCES = [['Organic Search', 45, '#6366f1'], ['Direct', 28, '#22c55e'], ['Social', 17, '#f59e0b'], ['Referral', 10, '#ef4444']];

function App() {
  const [tab, setTab] = createSignal('overview');
  const totalVisitors = data.reduce((s,d) => s+d.visitors, 0);
  const totalViews = data.reduce((s,d) => s+d.pageviews, 0);
  const avgBounce = Math.round(data.reduce((s,d) => s+d.bounce, 0)/data.length);

  return (
    <div style="min-height:100vh;background:#0f172a;color:#f1f5f9;font-family:system-ui">
      <nav style="background:#1e293b;padding:0 24px;display:flex;gap:24px;align-items:center;height:56px">
        <span style="font-weight:700;font-size:18px;margin-right:16px">📊 Lunx Analytics</span>
        {(['overview','pages','sources','events'] as const).map(t => (
          <button onClick={() => setTab(t)} style={`background:none;border:none;color:${tab()===t?'#818cf8':'#94a3b8'};cursor:pointer;font-size:15px;font-weight:${tab()===t?'600':'400'}`}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
        ))}
      </nav>
      <div style="padding:32px">
        <Show when={tab() === 'overview'}>
          <h1 style="margin:0 0 24px">Last 30 Days</h1>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px">
            {[[`${totalVisitors.toLocaleString()}`, 'Visitors', '#818cf8'],
              [`${totalViews.toLocaleString()}`, 'Page Views', '#22c55e'],
              [`${avgBounce}%`, 'Avg Bounce Rate', '#f59e0b']].map(([v,l,c]) => (
              <div style="background:#1e293b;border-radius:12px;padding:24px">
                <div style={`color:${c};font-size:32px;font-weight:700`}>{v}</div>
                <div style="color:#94a3b8;margin-top:4px">{l}</div>
              </div>
            ))}
          </div>
          <div style="background:#1e293b;border-radius:12px;padding:24px">
            <h3 style="margin:0 0 16px">Daily Visitors</h3>
            <div style="display:flex;align-items:flex-end;gap:4px;height:120px">
              <For each={data.slice(-14)}>{d => {
                const h = Math.round((d.visitors/2000)*100);
                return <div title={`${d.date}: ${d.visitors}`} style={`flex:1;background:#6366f1;border-radius:4px 4px 0 0;height:${h}%;min-width:8px`}/>;
              }}</For>
            </div>
          </div>
        </Show>
        <Show when={tab() === 'sources'}>
          <h1 style="margin:0 0 24px">Traffic Sources</h1>
          <For each={SOURCES}>{([name, pct, color]) => (
            <div style="background:#1e293b;border-radius:8px;padding:20px;margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <span>{name}</span><span style={`color:${color};font-weight:700`}>{pct}%</span>
              </div>
              <div style="background:#0f172a;border-radius:4px;height:8px">
                <div style={`background:${color};width:${pct}%;height:100%;border-radius:4px`}/>
              </div>
            </div>
          )}</For>
        </Show>
        <Show when={tab() === 'pages'}>
          <h1 style="margin:0 0 24px">Top Pages</h1>
          <For each={[['/', 18420], ['/docs', 9310], ['/pricing', 6820], ['/blog', 5640], ['/download', 4290]]}>{([path, views]) => (
            <div style="background:#1e293b;border-radius:8px;padding:16px 20px;margin-bottom:8px;display:flex;justify-content:space-between">
              <span style="font-family:monospace;color:#818cf8">{path}</span>
              <span style="color:#94a3b8">{(views as number).toLocaleString()} views</span>
            </div>
          )}</For>
        </Show>
        <Show when={tab() === 'events'}>
          <h1 style="margin:0 0 24px">Custom Events</h1>
          <For each={[['button_click', 'CTA Download', 4820], ['form_submit', 'Newsletter', 1230], ['video_play', 'Demo video', 890], ['upgrade_click', 'Pricing page', 672]]}>{([type, name, count]) => (
            <div style="background:#1e293b;border-radius:8px;padding:16px 20px;margin-bottom:8px;display:flex;justify-content:space-between">
              <div><span style="color:#818cf8;font-size:12px;font-family:monospace">{type}</span><br/><span>{name}</span></div>
              <strong>{(count as number).toLocaleString()}</strong>
            </div>
          )}</For>
        </Show>
      </div>
    </div>
  );
}
render(() => <App/>, document.getElementById('root')!);
EOF

# ── PREACT ───────────────────────────────────────────────────────
mk preact
cat > "$T/preact/package.json" <<'EOF'
{"name":"lunx-preact-template","version":"0.0.1","private":true,"type":"module","scripts":{"dev":"lunx dev","build":"lunx build","preview":"lunx preview"},"lunx":{"template":true,"framework":"preact","description":"Lunx Weather — real weather dashboard"},"dependencies":{"preact":"10.22.0"},"devDependencies":{"lunx":"file:../..","typescript":"5.4.5"}}
EOF
cat > "$T/preact/lunx.config.ts" <<'EOF'
import { defineConfig } from 'lunx';
export default defineConfig({ framework: 'preact' });
EOF
cat > "$T/preact/index.html" <<'EOF'
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Lunx Weather</title></head><body><div id="app"></div><script type="module" src="/src/main.tsx"></script></body></html>
EOF
cat > "$T/preact/src/main.tsx" <<'EOF'
import { render } from 'preact';
import { signal, effect } from '@preact/signals';
import { useEffect } from 'preact/hooks';

const cities = signal([
  { name:'Mumbai', lat:19.0760, lon:72.8777 },
  { name:'London', lat:51.5074, lon:-0.1278 },
  { name:'New York', lat:40.7128, lon:-74.0060 },
]);
const selected = signal(0);
const weather = signal<any>(null);
const loading = signal(true);
const unit = signal<'C'|'F'>('C');

async function fetchWeather(lat: number, lon: number) {
  loading.value = true;
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,uv_index,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=7`);
    weather.value = await r.json();
  } catch { weather.value = null; }
  loading.value = false;
}

function toF(c: number) { return Math.round(c * 9/5 + 32); }
function temp(c: number) { return unit.value === 'C' ? `${Math.round(c)}°C` : `${toF(c)}°F`; }
const WX: Record<number, string> = {0:'☀️ Clear',1:'🌤 Mainly clear',2:'⛅ Partly cloudy',3:'☁️ Overcast',45:'🌫 Foggy',48:'🌫 Icy fog',51:'🌦 Light drizzle',61:'🌧 Light rain',63:'🌧 Moderate rain',71:'🌨 Light snow',80:'🌦 Showers',95:'⛈ Thunderstorm'};

function App() {
  useEffect(() => { const c = cities.value[selected.value]; fetchWeather(c.lat, c.lon); }, []);
  const c = cities.value[selected.value];
  const w = weather.value;
  return (
    <div style="min-height:100vh;background:linear-gradient(135deg,#0f172a,#1e293b);color:#f1f5f9;font-family:system-ui;padding:24px">
      <div style="max-width:600px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
          <h1 style="margin:0">⛅ Lunx Weather</h1>
          <button onClick={() => unit.value = unit.value === 'C' ? 'F' : 'C'} style="padding:8px 16px;background:#334155;color:#fff;border:none;border-radius:8px;cursor:pointer">°{unit.value === 'C' ? 'F' : 'C'}</button>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:24px">
          {cities.value.map((city, i) => (
            <button onClick={() => { selected.value = i; fetchWeather(city.lat, city.lon); }} style={`padding:8px 16px;border-radius:8px;border:none;cursor:pointer;background:${selected.value===i?'#6366f1':'#1e293b'};color:#fff`}>{city.name}</button>
          ))}
        </div>
        {loading.value ? <div style="text-align:center;padding:60px;color:#94a3b8">Loading weather data...</div> : !w ? <div style="color:#ef4444">Failed to load. Check connection.</div> : (
          <>
            <div style="background:#1e293b;border-radius:16px;padding:32px;margin-bottom:16px;text-align:center">
              <div style="font-size:80px;font-weight:700;color:#818cf8">{temp(w.current.temperature_2m)}</div>
              <div style="font-size:20px;color:#94a3b8;margin-top:8px">{WX[w.current.weathercode] || 'Unknown'}</div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px">
                {[['💧', `${w.current.relative_humidity_2m}%`, 'Humidity'],['💨', `${w.current.wind_speed_10m} km/h`, 'Wind'],['☀️', `UV ${w.current.uv_index}`, 'UV Index']].map(([e,v,l]) => (
                  <div style="background:#0f172a;border-radius:10px;padding:12px">
                    <div style="font-size:24px">{e}</div>
                    <div style="font-weight:700;margin:4px 0">{v}</div>
                    <div style="color:#94a3b8;font-size:12px">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <h3>7-Day Forecast</h3>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px">
              {w.daily.time.map((date: string, i: number) => (
                <div style="background:#1e293b;border-radius:10px;padding:12px;text-align:center">
                  <div style="color:#94a3b8;font-size:12px">{new Date(date).toLocaleDateString('en',{weekday:'short'})}</div>
                  <div style="margin:8px 0">{WX[w.daily.weathercode[i]]?.split(' ')[0] || '❓'}</div>
                  <div style="font-size:13px;font-weight:700">{temp(w.daily.temperature_2m_max[i])}</div>
                  <div style="font-size:11px;color:#64748b">{temp(w.daily.temperature_2m_min[i])}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
render(<App/>, document.getElementById('app')!);
EOF

# ── VANILLA ──────────────────────────────────────────────────────
mk vanilla
cat > "$T/vanilla/package.json" <<'EOF'
{"name":"lunx-vanilla-template","version":"0.0.1","private":true,"type":"module","scripts":{"dev":"lunx dev","build":"lunx build","preview":"lunx preview"},"lunx":{"template":true,"framework":"vanilla","description":"Lunx Kanban — drag-and-drop board"},"devDependencies":{"lunx":"file:../..","typescript":"5.4.5"}}
EOF
cat > "$T/vanilla/lunx.config.ts" <<'EOF'
import { defineConfig } from 'lunx';
export default defineConfig({ framework: 'vanilla', entry: 'src/main.ts' });
EOF
cat > "$T/vanilla/index.html" <<'EOF'
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Lunx Kanban</title><style>*{box-sizing:border-box;margin:0}body{background:#0f172a;color:#f1f5f9;font-family:system-ui;min-height:100vh}</style></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>
EOF
cat > "$T/vanilla/src/main.ts" <<'EOF'
interface Card { id: string; title: string; priority: 'low'|'medium'|'high'; }
interface Col { id: string; title: string; cards: Card[]; }

const SEED: Col[] = [
  { id:'backlog', title:'📋 Backlog', cards: [
    {id:'1',title:'Implement OAuth 2.0 login',priority:'high'},
    {id:'2',title:'Add CSV export to reports',priority:'medium'},
    {id:'3',title:'Write API documentation',priority:'low'},
  ]},
  { id:'todo', title:'📝 To Do', cards: [
    {id:'4',title:'Set up CI/CD pipeline',priority:'high'},
    {id:'5',title:'Design onboarding flow',priority:'medium'},
    {id:'6',title:'Performance audit on /dashboard',priority:'high'},
  ]},
  { id:'doing', title:'⚡ In Progress', cards: [
    {id:'7',title:'Integrate Stripe billing',priority:'high'},
    {id:'8',title:'Fix SvelteKit SSR adapter',priority:'high'},
    {id:'9',title:'Add dark mode toggle',priority:'low'},
  ]},
  { id:'done', title:'✅ Done', cards: [
    {id:'10',title:'Security gate with CVE scanning',priority:'high'},
    {id:'11',title:'Playwright E2E test suite',priority:'medium'},
    {id:'12',title:'Plugin system documentation',priority:'low'},
  ]},
];

let state: Col[] = JSON.parse(localStorage.getItem('lunx-kanban') || 'null') ?? SEED;
let dragCard: {cardId:string; fromCol:string} | null = null;

function save() { localStorage.setItem('lunx-kanban', JSON.stringify(state)); }
function priorityColor(p: string) { return p==='high'?'#ef4444':p==='medium'?'#f59e0b':'#22c55e'; }

function render() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div style="padding:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <h1>🗂️ Lunx Kanban</h1>
        <span style="color:#94a3b8;font-size:14px">${state.reduce((s,c)=>s+c.cards.length,0)} cards total</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
        ${state.map(col => `
          <div class="col" data-col="${col.id}" style="background:#1e293b;border-radius:12px;padding:16px;min-height:400px" ondragover="event.preventDefault()" ondrop="window._drop('${col.id}')">
            <div style="font-weight:700;margin-bottom:16px;display:flex;justify-content:space-between">
              ${col.title} <span style="background:#0f172a;border-radius:999px;padding:2px 10px;font-size:13px;font-weight:400">${col.cards.length}</span>
            </div>
            ${col.cards.map(card => `
              <div draggable="true" class="card" data-id="${card.id}" data-col="${col.id}" style="background:#0f172a;border-radius:8px;padding:14px;margin-bottom:10px;border-left:3px solid ${priorityColor(card.priority)};cursor:grab">
                <div style="font-size:14px">${card.title}</div>
                <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center">
                  <span style="color:${priorityColor(card.priority)};font-size:11px;text-transform:uppercase">${card.priority}</span>
                  <button onclick="window._del('${card.id}','${col.id}')" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:16px">🗑</button>
                </div>
              </div>
            `).join('')}
            <button onclick="window._add('${col.id}')" style="width:100%;padding:10px;background:#334155;color:#94a3b8;border:none;border-radius:8px;cursor:pointer;margin-top:8px">+ Add Card</button>
          </div>
        `).join('')}
      </div>
    </div>`;

  document.querySelectorAll('.card').forEach(el => {
    el.addEventListener('dragstart', () => {
      dragCard = { cardId: (el as HTMLElement).dataset.id!, fromCol: (el as HTMLElement).dataset.col! };
    });
  });
}

(window as any)._drop = (toCol: string) => {
  if (!dragCard || dragCard.fromCol === toCol) return;
  const from = state.find(c => c.id === dragCard!.fromCol)!;
  const to = state.find(c => c.id === toCol)!;
  const idx = from.cards.findIndex(c => c.id === dragCard!.cardId);
  const [card] = from.cards.splice(idx, 1);
  to.cards.push(card);
  dragCard = null;
  save(); render();
};
(window as any)._del = (cardId: string, colId: string) => {
  const col = state.find(c => c.id === colId)!;
  col.cards = col.cards.filter(c => c.id !== cardId);
  save(); render();
};
(window as any)._add = (colId: string) => {
  const title = prompt('Card title:');
  if (!title) return;
  const col = state.find(c => c.id === colId)!;
  col.cards.unshift({ id: Date.now().toString(), title, priority: 'medium' });
  save(); render();
};

render();
EOF

echo "✅ svelte, solid, preact, vanilla done"
