// SvelteKit test project uses Lunx to serve a static Svelte SPA
// (SSR requires SvelteKit's own adapter, this shows the SPA shell)
console.log('⚡ Lunx SvelteKit template loaded');
document.getElementById('app')!.innerHTML = `
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; background: #0f172a; color: #f1f5f9; }
  nav { background: #1e293b; padding: 0 24px; display: flex; align-items: center; gap: 24px; height: 56px; border-bottom: 1px solid #334155; }
  nav span { font-weight: 700; font-size: 18px; color: #818cf8; }
  nav a { color: #94a3b8; text-decoration: none; font-size: 14px; }
  nav a:hover { color: #f1f5f9; }
  main { max-width: 800px; margin: 0 auto; padding: 48px 24px; }
  h1 { font-size: 42px; font-weight: 800; background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 12px; }
  .subtitle { color: #64748b; margin-bottom: 40px; font-size: 18px; }
  article { background: #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 20px; border: 1px solid #334155; transition: border-color .2s; }
  article:hover { border-color: #818cf8; }
  .meta { color: #818cf8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
  h2 { font-size: 20px; margin-bottom: 8px; color: #f1f5f9; }
  p { color: #94a3b8; line-height: 1.6; font-size: 14px; }
  .tags { display: flex; gap: 8px; margin-top: 14px; }
  .tag { background: #0f172a; padding: 4px 12px; border-radius: 999px; font-size: 12px; color: #818cf8; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; background: #22c55e22; color: #22c55e; margin-left: 8px; }
</style>
<nav>
  <span>⚡ Lunx Blog</span>
  <a href="#">Home</a><a href="#">Articles</a><a href="#">Docs</a><a href="#">About</a>
</nav>
<main>
  <h1>Engineering Insights</h1>
  <p class="subtitle">From the Lunx team — built with SvelteKit <span class="badge">SvelteKit</span></p>
  <article>
    <div class="meta">Performance · May 2025</div>
    <h2>How Lunx Achieves Sub-10ms Cold Starts</h2>
    <p>We rebuilt the entire dependency graph resolver in Rust using SWC transforms and a SQLite-backed module registry to achieve near-zero cold start times for large TypeScript projects.</p>
    <div class="tags"><span class="tag">Rust</span><span class="tag">Performance</span><span class="tag">TypeScript</span></div>
  </article>
  <article>
    <div class="meta">Architecture · April 2025</div>
    <h2>Native Module Federation Without Webpack</h2>
    <p>Module Federation has always been a Webpack-exclusive feature. We redesigned it from scratch using ESM dynamic imports and a lightweight runtime registry — no bundler required.</p>
    <div class="tags"><span class="tag">MFE</span><span class="tag">ESM</span><span class="tag">Architecture</span></div>
  </article>
  <article>
    <div class="meta">DX · March 2025</div>
    <h2>Zero-Config Framework Auto-Detection</h2>
    <p>Lunx reads your package.json dependencies and infers the correct transformer, preset, and dev server config — no lunx.config.ts required for the most common setups.</p>
    <div class="tags"><span class="tag">DX</span><span class="tag">Zero-Config</span><span class="tag">Frameworks</span></div>
  </article>
</main>
`;
