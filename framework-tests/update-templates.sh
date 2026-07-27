#!/bin/bash
# Script to update all 24 framework test projects with premium Lunx branded starter templates

TESTS="framework-tests"

# ─── Shared CSS template function ─────────────────────────────────────────────
write_shared_css() {
cat << 'CSS'
:root {
  --bg: #0f172a;
  --surface: #1e293b;
  --border: #334155;
  --primary: #818cf8;
  --primary-dark: #6366f1;
  --accent: #22d3ee;
  --text: #f1f5f9;
  --muted: #94a3b8;
  --success: #22c55e;
  --card-hover: #263448;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: var(--bg); color: var(--text); font-family: system-ui, -apple-system, sans-serif; min-height: 100vh; }
header { background: linear-gradient(135deg, #0f172a 0%, #1a1f3a 50%, #0f172a 100%); border-bottom: 1px solid var(--border); padding: 64px 24px 48px; text-align: center; position: relative; overflow: hidden; }
header::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, #6366f133 0%, transparent 70%); pointer-events: none; }
.badge { display: inline-block; padding: 4px 14px; background: var(--primary-dark); color: #fff; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 20px; }
.framework-badge { display: inline-block; padding: 6px 18px; background: #22d3ee22; color: var(--accent); border: 1px solid #22d3ee55; border-radius: 999px; font-size: 13px; font-weight: 600; margin-left: 8px; vertical-align: middle; }
h1 { font-size: clamp(40px, 6vw, 72px); font-weight: 900; background: linear-gradient(135deg, #c7d2fe, #818cf8, #a5b4fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.1; margin-bottom: 16px; }
.subtitle { color: var(--muted); font-size: 18px; max-width: 560px; margin: 0 auto 32px; line-height: 1.6; }
.hero-meta { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
.hero-meta span { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 16px; font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 6px; }
.hero-meta span strong { color: var(--text); }
main { max-width: 1100px; margin: 0 auto; padding: 48px 24px; }
.section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: var(--primary); font-weight: 700; margin-bottom: 20px; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 48px; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; transition: all 0.2s; cursor: default; }
.card:hover { border-color: var(--primary); background: var(--card-hover); transform: translateY(-2px); }
.card-icon { font-size: 32px; margin-bottom: 14px; }
.card h3 { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.card p { font-size: 14px; color: var(--muted); line-height: 1.6; }
.terminal { background: #020617; border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 48px; font-family: 'Courier New', monospace; position: relative; }
.terminal-header { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
.dot { width: 12px; height: 12px; border-radius: 50%; }
.dot.red { background: #ef4444; } .dot.yellow { background: #f59e0b; } .dot.green { background: #22c55e; }
.terminal-lang { position: absolute; top: 16px; right: 16px; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
.line { font-size: 14px; line-height: 2; }
.line .cmd { color: #818cf8; } .line .cmt { color: #475569; } .line .ok { color: #22c55e; }
.steps { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 48px; }
.step { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 20px; display: flex; align-items: flex-start; gap: 14px; }
.step-num { background: var(--primary-dark); color: #fff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
.step-content h4 { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.step-content code { font-size: 12px; color: var(--primary); background: #6366f122; padding: 2px 6px; border-radius: 4px; }
footer { border-top: 1px solid var(--border); text-align: center; padding: 32px 24px; color: var(--muted); font-size: 13px; }
footer a { color: var(--primary); text-decoration: none; }
footer a:hover { text-decoration: underline; }
CSS
}

echo "Shared CSS function ready"
