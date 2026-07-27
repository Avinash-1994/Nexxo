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
