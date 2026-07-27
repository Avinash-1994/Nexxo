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
