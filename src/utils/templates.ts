export interface ThemeColors {
  hexBase: string;
  hexRgbMap: string;
  buttonColor: string;
  shadowHex: string;
  frameworkLogoHex: string;
}

export function getPremiumCss(colors: ThemeColors) {
  return `
:root {
  --primary: ${colors.hexBase};
  --primary-rgb: ${colors.hexRgbMap};
  --bg-dark: #020617;
  --text-main: #ffffff;
  --text-muted: #94a3b8;
}

body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  position: relative;
}

body::before {
  content: '';
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1000px;
  height: 600px;
  background: radial-gradient(circle at 50% 10%, rgba(var(--primary-rgb), 0.15), transparent 60%);
  z-index: -1;
  pointer-events: none;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: #fff;
  text-decoration: none;
  font-family: 'Arial Black', Impact, sans-serif;
  text-transform: uppercase;
}

.navbar-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--text-main);
}

.nav-btn {
  background: var(--primary);
  color: #000;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0 15px ${colors.shadowHex};
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px ${colors.shadowHex};
  filter: brightness(1.1);
}

.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 1rem;
  max-width: 800px;
  margin: 0 auto;
  flex: 1;
}

.badge {
  background: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
  padding: 0.4rem 1.2rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(var(--primary-rgb), 0.2);
  margin-bottom: 2rem;
  display: inline-block;
  backdrop-filter: blur(4px);
  box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.1);
}

.hero-title {
  font-size: clamp(3rem, 6vw, 4.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.02em;
}

.hero-title .highlight {
  color: var(--primary);
  text-shadow: 0 0 30px ${colors.shadowHex};
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.15rem);
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0 auto 3rem;
  max-width: 600px;
}

.action-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 4rem;
  flex-wrap: wrap;
}

.btn-primary {
  background: var(--primary);
  color: #000;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0 20px ${colors.shadowHex}, inset 0 -2px 0 rgba(0,0,0,0.2);
}

.btn-primary:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 0 30px ${colors.shadowHex}, inset 0 -2px 0 rgba(0,0,0,0.2);
  filter: brightness(1.1);
}

.btn-primary:active {
  transform: translateY(1px);
}

.btn-secondary {
  background: transparent;
  color: var(--text-main);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.8rem 2rem;
  border-radius: 9999px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.2);
}

.terminal-window {
  background: #0f172a;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  text-align: left;
}

.terminal-header {
  background: rgba(0,0,0,0.2);
  padding: 0.75rem 1rem;
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.02);
}

.term-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.term-dot.red { background: #ef4444; }
.term-dot.yellow { background: #f59e0b; }
.term-dot.green { background: #10b981; }

.terminal-body {
  padding: 1.5rem;
  font-family: "Fira Code", "JetBrains Mono", ui-monospace, monospace;
  font-size: 0.9rem;
  line-height: 1.7;
}

.term-comment { color: #64748b; }
.term-cmd { color: #e2e8f0; }
.term-prompt { color: #ec4899; margin-right: 0.5rem; }
.term-success { color: #10b981; }

@media (max-width: 640px) {
  .navbar-links { display: none; }
  .action-buttons { flex-direction: column; }
}
`;
}

export const reactTemplateMain = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

export const getReactTemplateApp = (color: string) => `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <nav className="navbar">
        <a href="/" className="navbar-brand">LUNX</a>
        <div className="navbar-links">
          <a href="#" className="nav-link">Features</a>
          <a href="#" className="nav-link">Docs</a>
          <button className="nav-btn">Get Started</button>
        </div>
      </nav>

      <main className="hero-section">
        <div className="badge">{{FRAMEWORK_NAME}} v{{FRAMEWORK_VERSION}} · Lunx v{{LUNX_VERSION}}</div>
        
        <h1 className="hero-title">
          The Nucleus for<br/>
          <span className="highlight">Stunning React Apps</span>
        </h1>
        
        <p className="hero-subtitle">
          Experience the next generation of build speed with Lunx. 
          Instant HMR, native performance, and a developer experience that feels like magic.
        </p>

        <div className="action-buttons">
          <button className="btn-primary" onClick={() => setCount(c => c + 1)}>
            Interactions: {count}
          </button>
          <a href="https://lunx.dev" target="_blank" rel="noopener noreferrer" className="btn-secondary">
            Read Documentation
          </a>
        </div>

        <div className="terminal-window">
          <div className="terminal-header">
            <div className="term-dot red"></div>
            <div className="term-dot yellow"></div>
            <div className="term-dot green"></div>
          </div>
          <div className="terminal-body">
            <span className="term-comment">// Initializing the nucleus...</span><br/>
            <span className="term-prompt">$</span><span className="term-cmd">npm install lunx</span><br/>
            <span className="term-prompt">$</span><span className="term-cmd">npm run dev</span><br/><br/>
            <span className="term-success">✓ Core Ready in 3.15ms</span>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;`;

export const preactTemplateMain = `import { render } from 'preact';
import { App } from './App';
import './index.css';

render(<App />, document.getElementById('root') as HTMLElement);`;

export const getPreactTemplateApp = (color: string) => `import { useState } from 'preact/hooks';

export function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <nav className="navbar">
        <a href="/" className="navbar-brand">LUNX</a>
        <div className="navbar-links">
          <a href="#" className="nav-link">Features</a>
          <a href="#" className="nav-link">Docs</a>
          <button className="nav-btn">Get Started</button>
        </div>
      </nav>

      <main className="hero-section">
        <div className="badge">{{FRAMEWORK_NAME}} v{{FRAMEWORK_VERSION}} · Lunx v{{LUNX_VERSION}}</div>
        
        <h1 className="hero-title">
          The Nucleus for<br/>
          <span className="highlight">Stunning Preact Apps</span>
        </h1>
        
        <p className="hero-subtitle">
          Experience the next generation of build speed with Lunx. 
          Instant HMR, native performance, and a developer experience that feels like magic.
        </p>

        <div className="action-buttons">
          <button className="btn-primary" onClick={() => setCount(c => c + 1)}>
            Interactions: {count}
          </button>
          <a href="https://lunx.dev" target="_blank" rel="noopener noreferrer" className="btn-secondary">
            Read Documentation
          </a>
        </div>

        <div className="terminal-window">
          <div className="terminal-header">
            <div className="term-dot red"></div>
            <div className="term-dot yellow"></div>
            <div className="term-dot green"></div>
          </div>
          <div className="terminal-body">
            <span className="term-comment">// Initializing the nucleus...</span><br/>
            <span className="term-prompt">$</span><span className="term-cmd">npm install lunx</span><br/>
            <span className="term-prompt">$</span><span class="term-cmd">npm run dev</span><br/><br/>
            <span className="term-success">✓ Core Ready in 3.15ms</span>
          </div>
        </div>
      </main>
    </>
  );
}`;

export const vueTemplateMain = `import { createApp } from 'vue';
import App from './App.vue';
import './index.css';

createApp(App).mount('#root');`;

export const getVueTemplateApp = (color: string) => `<template>
    <nav class="navbar">
      <a href="/" class="navbar-brand">LUNX</a>
      <div class="navbar-links">
        <a href="#" class="nav-link">Features</a>
        <a href="#" class="nav-link">Docs</a>
        <button class="nav-btn">Get Started</button>
      </div>
    </nav>

    <main class="hero-section">
      <div class="badge">{{FRAMEWORK_NAME}} v{{FRAMEWORK_VERSION}} · Lunx v{{LUNX_VERSION}}</div>
      
      <h1 class="hero-title">
        The Nucleus for<br/>
        <span class="highlight">Stunning Vue Apps</span>
      </h1>
      
      <p class="hero-subtitle">
        Experience the next generation of build speed with Lunx. 
        Instant HMR, native performance, and a developer experience that feels like magic.
      </p>

      <div class="action-buttons">
        <button class="btn-primary" @click="count++">
          Interactions: {{ count }}
        </button>
        <a href="https://lunx.dev" target="_blank" rel="noopener noreferrer" class="btn-secondary">
          Read Documentation
        </a>
      </div>

      <div class="terminal-window">
        <div class="terminal-header">
          <div class="term-dot red"></div>
          <div class="term-dot yellow"></div>
          <div class="term-dot green"></div>
        </div>
        <div class="terminal-body">
          <span class="term-comment">// Initializing the nucleus...</span><br/>
          <span class="term-prompt">$</span><span class="term-cmd">npm install lunx</span><br/>
          <span class="term-prompt">$</span><span class="term-cmd">npm run dev</span><br/><br/>
          <span class="term-success">✓ Core Ready in 3.15ms</span>
        </div>
      </div>
    </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
</script>`;

export const solidTemplateMain = `/* @refresh reload */
import { render } from 'solid-js/web';
import App from './App';
import './index.css';

const root = document.getElementById('root');
if (root) {
  render(() => <App />, root);
}`;

export const getSolidTemplateApp = (color: string) => `import { createSignal } from 'solid-js';

function App() {
  const [count, setCount] = createSignal(0);

  return (
    <>
      <nav class="navbar">
        <a href="/" class="navbar-brand">LUNX</a>
        <div class="navbar-links">
          <a href="#" class="nav-link">Features</a>
          <a href="#" class="nav-link">Docs</a>
          <button class="nav-btn">Get Started</button>
        </div>
      </nav>

      <main class="hero-section">
        <div class="badge">{{FRAMEWORK_NAME}} v{{FRAMEWORK_VERSION}} · Lunx v{{LUNX_VERSION}}</div>
        
        <h1 class="hero-title">
          The Nucleus for<br/>
          <span class="highlight">Stunning SolidJS Apps</span>
        </h1>
        
        <p class="hero-subtitle">
          Experience the next generation of build speed with Lunx. 
          Instant HMR, native performance, and a developer experience that feels like magic.
        </p>

        <div class="action-buttons">
          <button class="btn-primary" onClick={() => setCount(c => c + 1)}>
            Interactions: {count()}
          </button>
          <a href="https://lunx.dev" target="_blank" rel="noopener noreferrer" class="btn-secondary">
            Read Documentation
          </a>
        </div>

        <div class="terminal-window">
          <div class="terminal-header">
            <div class="term-dot red"></div>
            <div class="term-dot yellow"></div>
            <div class="term-dot green"></div>
          </div>
          <div class="terminal-body">
            <span class="term-comment">// Initializing the nucleus...</span><br/>
            <span class="term-prompt">$</span><span class="term-cmd">npm install lunx</span><br/>
            <span class="term-prompt">$</span><span class="term-cmd">npm run dev</span><br/><br/>
            <span class="term-success">✓ Core Ready in 3.15ms</span>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;`;

export const svelteTemplateMain = `import App from './App.svelte';
import './index.css';

const app = new App({
  target: document.getElementById('root')!,
});

export default app;`;

export const getSvelteTemplateApp = (color: string) => `<script lang="ts">
  let count = 0;
</script>

<nav class="navbar">
  <a href="/" class="navbar-brand">LUNX</a>
  <div class="navbar-links">
    <a href="#" class="nav-link">Features</a>
    <a href="#" class="nav-link">Docs</a>
    <button class="nav-btn">Get Started</button>
  </div>
</nav>

<main class="hero-section">
  <div class="badge">{{FRAMEWORK_NAME}} v{{FRAMEWORK_VERSION}} · Lunx v{{LUNX_VERSION}}</div>
  
  <h1 class="hero-title">
    The Nucleus for<br/>
    <span class="highlight">Stunning Svelte Apps</span>
  </h1>
  
  <p class="hero-subtitle">
    Experience the next generation of build speed with Lunx. 
    Instant HMR, native performance, and a developer experience that feels like magic.
  </p>

  <div class="action-buttons">
    <button class="btn-primary" on:click={() => count++}>
      Interactions: {count}
    </button>
    <a href="https://lunx.dev" target="_blank" rel="noopener noreferrer" class="btn-secondary">
      Read Documentation
    </a>
  </div>

  <div class="terminal-window">
    <div class="terminal-header">
      <div class="term-dot red"></div>
      <div class="term-dot yellow"></div>
      <div class="term-dot green"></div>
    </div>
    <div class="terminal-body">
      <span class="term-comment">// Initializing the nucleus...</span><br/>
      <span class="term-prompt">$</span><span class="term-cmd">npm install lunx</span><br/>
      <span class="term-prompt">$</span><span class="term-cmd">npm run dev</span><br/><br/>
      <span class="term-success">✓ Core Ready in 3.15ms</span>
    </div>
  </div>
</main>`;

export const qwikTemplateMainTSX = `import { component$, useSignal, render } from '@builder.io/qwik';
import '@builder.io/qwik/qwikloader.js';
import './index.css';

const App = component$(() => {
  const count = useSignal(0);

  return (
    <div>
      <nav class="navbar">
        <a href="/" class="navbar-brand">LUNX</a>
        <div class="navbar-links">
          <a href="#" class="nav-link">Features</a>
          <a href="#" class="nav-link">Docs</a>
          <button class="nav-btn">Get Started</button>
        </div>
      </nav>

      <main class="hero-section">
        <div class="badge">{{FRAMEWORK_NAME}} v{{FRAMEWORK_VERSION}} · Lunx v{{LUNX_VERSION}}</div>
        
        <h1 class="hero-title">
          The Nucleus for<br />
          <span class="highlight">Stunning Qwik Apps</span>
        </h1>

        <p class="hero-subtitle">
          Experience the next generation of build speed with Lunx.
          Instant HMR, native performance, and a developer experience that feels like magic.
        </p>

        <div class="action-buttons">
          <button class="btn-primary" onClick$={() => count.value++}>
            Interactions: {count.value}
          </button>
          <a href="https://lunx.dev" target="_blank" rel="noopener noreferrer" class="btn-secondary">
            Read Documentation
          </a>
        </div>

        <div class="terminal-window">
          <div class="terminal-header">
            <div class="term-dot red"></div>
            <div class="term-dot yellow"></div>
            <div class="term-dot green"></div>
          </div>
          <div class="terminal-body">
            <span class="term-comment">// Initializing the nucleus...</span><br />
            <span class="term-prompt">$</span><span class="term-cmd">npm install lunx</span><br />
            <span class="term-prompt">$</span><span class="term-cmd">npm run dev</span><br /><br />
            <span class="term-success">✓ Core Ready in 3.15ms</span>
          </div>
        </div>
      </main>
    </div>
  );
});

export default App;

// Mount the app
if (typeof document !== 'undefined') {
  render(document.getElementById('root')!, <App />);
}
`;

export const litTemplateMain = `import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css\`
    :host {
      display: flex;
      flex-direction: column;
      color: #ffffff;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
    }
    .navbar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; max-width: 1200px; margin: 0 auto; box-sizing: border-box; width: 100%; }
    .navbar-brand { font-size: 1.5rem; font-weight: 900; letter-spacing: 0.1em; color: #fff; text-decoration: none; font-family: 'Arial Black', Impact, sans-serif; text-transform: uppercase; }
    .navbar-links { display: flex; gap: 2rem; align-items: center; }
    .nav-link { color: #94a3b8; text-decoration: none; font-size: 0.95rem; font-weight: 500; transition: color 0.2s; }
    .nav-link:hover { color: #ffffff; }
    .nav-btn { background: var(--primary); color: #000; border: none; padding: 0.6rem 1.25rem; border-radius: 9999px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 0 15px rgba(48, 140, 253, 0.4); }
    .nav-btn:hover { transform: translateY(-2px); box-shadow: 0 0 25px rgba(48, 140, 253, 0.6); filter: brightness(1.1); }
    .hero-section { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 4rem 1rem; max-width: 800px; margin: 0 auto; flex: 1; }
    .badge { background: rgba(48, 140, 253, 0.1); color: var(--primary); padding: 0.4rem 1rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(48, 140, 253, 0.2); margin-bottom: 2rem; display: inline-block; backdrop-filter: blur(4px); box-shadow: 0 0 20px rgba(48, 140, 253, 0.1); }
    .hero-title { font-size: clamp(3rem, 6vw, 4.5rem); font-weight: 800; line-height: 1.1; margin: 0 0 1.5rem 0; letter-spacing: -0.02em; }
    .hero-title .highlight { color: var(--primary); text-shadow: 0 0 30px rgba(48, 140, 253, 0.4); }
    .hero-subtitle { font-size: clamp(1rem, 2vw, 1.15rem); color: #94a3b8; line-height: 1.6; margin: 0 auto 3rem; max-width: 600px; }
    .action-buttons { display: flex; gap: 1.5rem; justify-content: center; margin-bottom: 4rem; flex-wrap: wrap; }
    .btn-primary { background: var(--primary); color: #000; border: none; padding: 0.8rem 2rem; border-radius: 9999px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 0 20px rgba(48, 140, 253, 0.4), inset 0 -2px 0 rgba(0,0,0,0.2); }
    .btn-primary:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 0 30px rgba(48, 140, 253, 0.6), inset 0 -2px 0 rgba(0,0,0,0.2); filter: brightness(1.1); }
    .btn-secondary { background: transparent; color: #ffffff; border: 1px solid rgba(255,255,255,0.1); padding: 0.8rem 2rem; border-radius: 9999px; font-weight: 500; font-size: 1rem; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; }
    .btn-secondary:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.2); }
    .terminal-window { background: #0f172a; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); width: 100%; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); text-align: left; }
    .terminal-header { background: rgba(0,0,0,0.2); padding: 0.75rem 1rem; display: flex; gap: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.02); }
    .term-dot { width: 12px; height: 12px; border-radius: 50%; }
    .term-dot.red { background: #ef4444; }
    .term-dot.yellow { background: #f59e0b; }
    .term-dot.green { background: #10b981; }
    .terminal-body { padding: 1.5rem; font-family: 'Fira Code', 'JetBrains Mono', monospace; font-size: 0.9rem; line-height: 1.7; }
    .term-comment { color: #64748b; }
    .term-cmd { color: #e2e8f0; }
    .term-prompt { color: #ec4899; margin-right: 0.5rem; }
    .term-success { color: #10b981; }
  \`;

  @property() count = 0;

  render() {
    return html\`
      <nav class="navbar">
        <a href="/" class="navbar-brand">LUNX</a>
        <div class="navbar-links">
          <a href="#" class="nav-link">Features</a>
          <a href="#" class="nav-link">Docs</a>
          <button class="nav-btn">Get Started</button>
        </div>
      </nav>

      <main class="hero-section">
        <div class="badge">{{FRAMEWORK_NAME}} v{{FRAMEWORK_VERSION}} · Lunx v{{LUNX_VERSION}}</div>
        
        <h1 class="hero-title">
          The Nucleus for<br/>
          <span class="highlight">Stunning Lit Apps</span>
        </h1>
        
        <p class="hero-subtitle">
          Experience the next generation of build speed with Lunx. 
          Instant HMR, native performance, and a developer experience that feels like magic.
        </p>

        <div class="action-buttons">
          <button class="btn-primary" @click=\${() => this.count++}>
            Interactions: \${this.count}
          </button>
          <a href="https://lunx.dev" target="_blank" rel="noopener noreferrer" class="btn-secondary">
            Read Documentation
          </a>
        </div>

        <div class="terminal-window">
          <div class="terminal-header">
            <div class="term-dot red"></div>
            <div class="term-dot yellow"></div>
            <div class="term-dot green"></div>
          </div>
          <div class="terminal-body">
            <span class="term-comment">// Initializing the nucleus...</span><br/>
            <span class="term-prompt">$</span><span class="term-cmd">npm install lunx</span><br/>
            <span class="term-prompt">$</span><span class="term-cmd">npm run dev</span><br/><br/>
            <span class="term-success">✓ Core Ready in 3.15ms</span>
          </div>
        </div>
      </main>
    \`;
  }
}`;

export const alpineTemplateHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lunx + Alpine.js App</title>
    <link rel="stylesheet" href="/src/index.css" />
</head>
<body>
    <div id="root" x-data="{ count: 0 }">
        <nav class="navbar">
          <a href="/" class="navbar-brand">LUNX</a>
          <div class="navbar-links">
            <a href="#" class="nav-link">Features</a>
            <a href="#" class="nav-link">Docs</a>
            <button class="nav-btn">Get Started</button>
          </div>
        </nav>

        <main class="hero-section">
          <div class="badge">{{FRAMEWORK_NAME}} v{{FRAMEWORK_VERSION}} · Lunx v{{LUNX_VERSION}}</div>
          
          <h1 class="hero-title">
            The Nucleus for<br/>
            <span class="highlight" style="color: #77C1D2; text-shadow: 0 0 30px rgba(119, 193, 210, 0.4);">Stunning Alpine Apps</span>
          </h1>
          
          <p class="hero-subtitle">
            Experience the next generation of build speed with Lunx. 
            Instant HMR, native performance, and a developer experience that feels like magic.
          </p>

          <div class="action-buttons">
            <button class="btn-primary" @click="count++">
              Interactions: <span x-text="count"></span>
            </button>
            <a href="https://lunx.dev" target="_blank" rel="noopener noreferrer" class="btn-secondary">
              Read Documentation
            </a>
          </div>

          <div class="terminal-window">
            <div class="terminal-header">
              <div class="term-dot red"></div>
              <div class="term-dot yellow"></div>
              <div class="term-dot green"></div>
            </div>
            <div class="terminal-body">
              <span class="term-comment">// Initializing the nucleus...</span><br/>
              <span class="term-prompt">$</span><span class="term-cmd">npm install lunx</span><br/>
              <span class="term-prompt">$</span><span class="term-cmd">npm run dev</span><br/><br/>
              <span class="term-success">✓ Core Ready in 3.15ms</span>
            </div>
          </div>
        </main>
    </div>
    <script type="module" src="/src/main.js"></script>
</body>
</html>`;

export const mithrilTemplateMain = `import m from "mithril";
import "./index.css";

const App = {
  count: 0,
  view: function() {
    return m("div", [
      m("nav", { class: "navbar" }, [
        m("a", { href: "/", class: "navbar-brand" }, "LUNX"),
        m("div", { class: "navbar-links" }, [
          m("a", { href: "#", class: "nav-link" }, "Features"),
          m("a", { href: "#", class: "nav-link" }, "Docs"),
          m("button", { class: "nav-btn" }, "Get Started")
        ])
      ]),
      m("main", { class: "hero-section" }, [
        m("div", { class: "badge" }, "Engine v{{LUNX_VERSION}} Ready"),
        m("h1", { class: "hero-title" }, [
          "The Nucleus for", m("br"),
          "", m("span", { class: "highlight" }, "Stunning Mithril Apps")
        ]),
        m("p", { class: "hero-subtitle" }, "Experience the next generation of build speed with Lunx. Instant HMR, native performance, and a developer experience that feels like magic."),
        m("div", { class: "action-buttons" }, [
          m("button", { class: "btn-primary", onclick: () => App.count++ }, "Interactions: " + App.count),
          m("a", { class: "btn-secondary", href: "https://lunx.dev", target: "_blank" }, "Read Documentation")
        ]),
        m("div", { class: "terminal-window" }, [
          m("div", { class: "terminal-header" }, [
            m("div", { class: "term-dot red" }),
            m("div", { class: "term-dot yellow" }),
            m("div", { class: "term-dot green" })
          ]),
          m("div", { class: "terminal-body" }, [
            m("span", { class: "term-comment" }, "// Initializing the nucleus..."), m("br"),
            m("span", { class: "term-prompt" }, "$"), m("span", { class: "term-cmd" }, "npm install lunx"), m("br"),
            m("span", { class: "term-prompt" }, "$"), m("span", { class: "term-cmd" }, "npm run dev"), m("br"), m("br"),
            m("span", { class: "term-success" }, "✓ Core Ready in 3.15ms")
          ])
        ])
      ])
    ]);
  }
};

m.mount(document.getElementById("root")!, App);`;

export const vanillaTemplateHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lunx + Vanilla App</title>
    <link rel="stylesheet" href="/src/index.css" />
</head>
<body>
    <div id="root">
        <nav class="navbar">
          <a href="/" class="navbar-brand">LUNX</a>
          <div class="navbar-links">
            <a href="#" class="nav-link">Features</a>
            <a href="#" class="nav-link">Docs</a>
            <button class="nav-btn">Get Started</button>
          </div>
        </nav>

        <main class="hero-section">
          <div class="badge">{{FRAMEWORK_NAME}} v{{FRAMEWORK_VERSION}} · Lunx v{{LUNX_VERSION}}</div>
          
          <h1 class="hero-title">
            The Nucleus for<br/>
            <span class="highlight" style="color: #f59f00; text-shadow: 0 0 30px rgba(245, 159, 0, 0.4);">Stunning Vanilla JS Apps</span>
          </h1>
          
          <p class="hero-subtitle">
            Experience the next generation of build speed with Lunx. 
            Instant HMR, native performance, and a developer experience that feels like magic.
          </p>

          <div class="action-buttons">
            <button class="btn-primary" onclick="alert('Hello from vanilla JS!')">
              Hello Lunx!
            </button>
            <a href="https://lunx.dev" target="_blank" rel="noopener noreferrer" class="btn-secondary">
              Read Documentation
            </a>
          </div>

          <div class="terminal-window">
            <div class="terminal-header">
              <div class="term-dot red"></div>
              <div class="term-dot yellow"></div>
              <div class="term-dot green"></div>
            </div>
            <div class="terminal-body">
              <span class="term-comment">// Initializing the nucleus...</span><br/>
              <span class="term-prompt">$</span><span class="term-cmd">npm install lunx</span><br/>
              <span class="term-prompt">$</span><span class="term-cmd">npm run dev</span><br/><br/>
              <span class="term-success">✓ Core Ready in 3.15ms</span>
            </div>
          </div>
        </main>
    </div>
    <script type="module" src="/src/main.ts"></script>
</body>
</html>`;


export interface TemplateFile {
  path: string;
  content: string;
}

export interface TemplateDef {
  id: string;
  name: string;
  description: string;
  files: TemplateFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

const COMMON_FILES: TemplateFile[] = [
  {
    path: 'lunx.config.json',
    content: `{
  "mode": "development"
}`
  },
  {
    path: 'tsconfig.json',
    content: `{
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "jsx": "preserve"
    }
}`
  }
];

export const TEMPLATES: Record<string, TemplateDef> = {
  'react-ts': {
    id: 'react-ts',
    name: 'React TypeScript',
    description: 'React 19 + TypeScript + Stunning UI',
    files: [
      ...COMMON_FILES,
      { path: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Lunx + React</title>\n    <link rel="stylesheet" href="/src/index.css" />\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>' },
      { path: 'src/main.tsx', content: reactTemplateMain },
      { path: 'src/App.tsx', content: getReactTemplateApp('#61dafb') },
      { path: 'src/index.css', content: getPremiumCss({ hexBase: '#3b8cfd', hexRgbMap: '59, 140, 253', buttonColor: '#3b8cfd', shadowHex: 'rgba(59, 140, 253, 0.4)', frameworkLogoHex: '#61dafb' }) }
    ],
    dependencies: { "react": "^19.2.3", "react-dom": "^19.2.3" },
    devDependencies: { "@types/react": "^19.2.3", "@types/react-dom": "^19.2.3", "typescript": "^5.0.0" }
  },
  'vue-ts': {
    id: 'vue-ts',
    name: 'Vue TypeScript',
    description: 'Vue 3 + TypeScript + Stunning UI',
    files: [
      ...COMMON_FILES,
      { path: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Lunx + Vue</title>\n    <link rel="stylesheet" href="/src/index.css" />\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.ts"></script>\n  </body>\n</html>' },
      { path: 'src/main.ts', content: vueTemplateMain },
      { path: 'src/App.vue', content: getVueTemplateApp('#42b883') },
      { path: 'src/index.css', content: getPremiumCss({ hexBase: '#42b883', hexRgbMap: '66, 184, 131', buttonColor: '#42b883', shadowHex: 'rgba(66, 184, 131, 0.4)', frameworkLogoHex: '#42b883' }) }
    ],
    dependencies: { "vue": "^3.3.0" },
    devDependencies: { "typescript": "^5.0.0" }
  },
  'svelte-ts': {
    id: 'svelte-ts',
    name: 'Svelte TypeScript',
    description: 'Svelte 4 + TypeScript + Stunning UI',
    files: [
      ...COMMON_FILES,
      { path: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Lunx + Svelte</title>\n    <link rel="stylesheet" href="/src/index.css" />\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.ts"></script>\n  </body>\n</html>' },
      { path: 'src/main.ts', content: svelteTemplateMain },
      { path: 'src/App.svelte', content: getSvelteTemplateApp('#ff3e00') },
      { path: 'src/index.css', content: getPremiumCss({ hexBase: '#ff3e00', hexRgbMap: '255, 62, 0', buttonColor: '#ff3e00', shadowHex: 'rgba(255, 62, 0, 0.4)', frameworkLogoHex: '#ff3e00' }) }
    ],
    dependencies: { "svelte": "^4.2.0" },
    devDependencies: { "typescript": "^5.0.0" }
  },
  'solid-ts': {
    id: 'solid-ts',
    name: 'Solid TypeScript',
    description: 'SolidJS + TypeScript + Stunning UI',
    files: [
      ...COMMON_FILES,
      { path: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Lunx + Solid</title>\n    <link rel="stylesheet" href="/src/index.css" />\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/index.tsx"></script>\n  </body>\n</html>' },
      { path: 'src/index.tsx', content: solidTemplateMain },
      { path: 'src/App.tsx', content: getSolidTemplateApp('#446b9e') },
      { path: 'src/index.css', content: getPremiumCss({ hexBase: '#446b9e', hexRgbMap: '68, 107, 158', buttonColor: '#446b9e', shadowHex: 'rgba(68, 107, 158, 0.4)', frameworkLogoHex: '#446b9e' }) }
    ],
    dependencies: { "solid-js": "^1.8.17" },
    devDependencies: { "babel-preset-solid": "^1.8.17", "@babel/core": "^7.24.0", "typescript": "^5.0.0" }
  },
  'preact-ts': {
    id: 'preact-ts',
    name: 'Preact TypeScript',
    description: 'Preact + TypeScript + Stunning UI',
    files: [
      ...COMMON_FILES,
      { path: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Lunx + Preact</title>\n    <link rel="stylesheet" href="/src/index.css" />\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>' },
      { path: 'src/main.tsx', content: preactTemplateMain },
      { path: 'src/App.tsx', content: getPreactTemplateApp('#673ab7') },
      { path: 'src/index.css', content: getPremiumCss({ hexBase: '#673ab7', hexRgbMap: '103, 58, 183', buttonColor: '#673ab7', shadowHex: 'rgba(103, 58, 183, 0.4)', frameworkLogoHex: '#673ab7' }) }
    ],
    dependencies: { "preact": "^10.19.0" },
    devDependencies: { "typescript": "^5.0.0" }
  },
  'preact-js': {
    id: 'preact-js',
    name: 'Preact JavaScript',
    description: 'Preact + JavaScript + Stunning UI',
    files: [
      ...COMMON_FILES,
      { path: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Lunx + Preact</title>\n    <link rel="stylesheet" href="/src/index.css" />\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>' },
      { path: 'src/main.jsx', content: preactTemplateMain },
      { path: 'src/App.jsx', content: getPreactTemplateApp('#673ab7') },
      { path: 'src/index.css', content: getPremiumCss({ hexBase: '#673ab7', hexRgbMap: '103, 58, 183', buttonColor: '#673ab7', shadowHex: 'rgba(103, 58, 183, 0.4)', frameworkLogoHex: '#673ab7' }) }
    ],
    dependencies: { "preact": "^10.19.0" },
    devDependencies: {}
  },
  'qwik-ts': {
    id: 'qwik-ts',
    name: 'Qwik TypeScript',
    description: 'Qwik + TypeScript + Stunning UI',
    files: [
      ...COMMON_FILES,
      { path: 'index.html', content: '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="UTF-8" />\n    <title>Lunx + Qwik</title>\n    <link rel="stylesheet" href="/src/index.css" />\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/root.tsx"></script>\n  </body>\n</html>' },
      { path: 'src/root.tsx', content: qwikTemplateMainTSX },
      { path: 'src/index.css', content: getPremiumCss({ hexBase: '#18B6F6', hexRgbMap: '24, 182, 246', buttonColor: '#18B6F6', shadowHex: 'rgba(24, 182, 246, 0.4)', frameworkLogoHex: '#18B6F6' }) }
    ],
    dependencies: { "@builder.io/qwik": "^1.4.3" },
    devDependencies: { "typescript": "^5.0.0" }
  },
  'lit-ts': {
    id: 'lit-ts',
    name: 'Lit TypeScript',
    description: 'Lit Web Components + Stunning UI',
    files: [
      ...COMMON_FILES,
      { path: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Lunx + Lit</title>\n    <link rel="stylesheet" href="/src/index.css" />\n  </head>\n  <body>\n    <my-element></my-element>\n    <script type="module" src="/src/main.ts"></script>\n  </body>\n</html>' },
      { path: 'src/main.ts', content: litTemplateMain },
      { path: 'src/index.css', content: getPremiumCss({ hexBase: '#3b8cfd', hexRgbMap: '59, 140, 253', buttonColor: '#308cfd', shadowHex: 'rgba(48, 140, 253, 0.4)', frameworkLogoHex: '#3b8cfd' }) }
    ],
    dependencies: { "lit": "^3.1.2" },
    devDependencies: { "typescript": "^5.0.0" }
  },
  'alpine': {
    id: 'alpine',
    name: 'Alpine.js',
    description: 'Alpine.js + Stunning UI',
    files: [
      ...COMMON_FILES,
      { path: 'index.html', content: alpineTemplateHtml },
      { path: 'src/main.js', content: "import AlpineModule from 'alpinejs';\nconst Alpine = AlpineModule.default ?? AlpineModule;\nwindow.Alpine = Alpine;\nAlpine.start();" },
      { path: 'src/index.css', content: getPremiumCss({ hexBase: '#77C1D2', hexRgbMap: '119, 193, 210', buttonColor: '#77C1D2', shadowHex: 'rgba(119, 193, 210, 0.4)', frameworkLogoHex: '#77C1D2' }) }
    ],
    dependencies: { "alpinejs": "^3.13.3" },
    devDependencies: {}
  },
  'alpine-ts': {
    id: 'alpine-ts',
    name: 'Alpine.js TypeScript',
    description: 'Alpine.js + TypeScript + Stunning UI',
    files: [
      ...COMMON_FILES,
      { path: 'index.html', content: alpineTemplateHtml.replace('src/main.js', 'src/main.ts') },
      { path: 'src/main.ts', content: "import AlpineModule from 'alpinejs';\nconst Alpine = AlpineModule.default ?? AlpineModule;\n(window as any).Alpine = Alpine;\nAlpine.start();" },
      { path: 'src/index.css', content: getPremiumCss({ hexBase: '#77C1D2', hexRgbMap: '119, 193, 210', buttonColor: '#77C1D2', shadowHex: 'rgba(119, 193, 210, 0.4)', frameworkLogoHex: '#77C1D2' }) }
    ],
    dependencies: { "alpinejs": "^3.13.3" },
    devDependencies: { "@types/alpinejs": "^3.13.10", "typescript": "^5.0.0" }
  },
  'mithril': {
    id: 'mithril',
    name: 'Mithril.js',
    description: 'Mithril.js + Stunning UI',
    files: [
      ...COMMON_FILES,
      { path: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Lunx + Mithril</title>\n    <link rel="stylesheet" href="/src/index.css" />\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.js"></script>\n  </body>\n</html>' },
      { path: 'src/main.js', content: mithrilTemplateMain },
      { path: 'src/index.css', content: getPremiumCss({ hexBase: '#22d3ee', hexRgbMap: '34, 211, 238', buttonColor: '#22d3ee', shadowHex: 'rgba(34, 211, 238, 0.4)', frameworkLogoHex: '#22d3ee' }) }
    ],
    dependencies: { "mithril": "^2.2.2" },
    devDependencies: {}
  },
  'mithril-ts': {
    id: 'mithril-ts',
    name: 'Mithril.js TypeScript',
    description: 'Mithril.js + TypeScript + Stunning UI',
    files: [
      ...COMMON_FILES,
      { path: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Lunx + Mithril TS</title>\n    <link rel="stylesheet" href="/src/index.css" />\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.ts"></script>\n  </body>\n</html>' },
      { path: 'src/main.ts', content: mithrilTemplateMain },
      { path: 'src/index.css', content: getPremiumCss({ hexBase: '#22d3ee', hexRgbMap: '34, 211, 238', buttonColor: '#22d3ee', shadowHex: 'rgba(34, 211, 238, 0.4)', frameworkLogoHex: '#22d3ee' }) }
    ],
    dependencies: { "mithril": "^2.2.2" },
    devDependencies: { "@types/mithril": "^2.2.6", "typescript": "^5.0.0" }
  },
  'vanilla': {
    id: 'vanilla',
    name: 'Vanilla JS',
    description: 'Vanilla JS + Stunning UI',
    files: [
      ...COMMON_FILES,
      { path: 'index.html', content: vanillaTemplateHtml.replace('src/main.ts', 'src/main.js') },
      { path: 'src/main.js', content: 'console.log("Hello from Lunx Vanilla!");\n\nconst countBtn = document.querySelector(".btn-primary");\nlet count = 0;\ncountBtn.onclick = () => {\n  count++;\n  countBtn.innerText = "Interactions: " + count;\n};' },
      { path: 'src/index.css', content: getPremiumCss({ hexBase: '#f59f00', hexRgbMap: '245, 159, 0', buttonColor: '#f59f00', shadowHex: 'rgba(245, 159, 0, 0.4)', frameworkLogoHex: '#f59f00' }) }
    ],
    dependencies: {},
    devDependencies: {}
  },
  'vanilla-ts': {
    id: 'vanilla-ts',
    name: 'Vanilla TypeScript',
    description: 'Vanilla TypeScript + Stunning UI',
    files: [
      ...COMMON_FILES,
      { path: 'index.html', content: vanillaTemplateHtml },
      { path: 'src/main.ts', content: 'console.log("Hello from Lunx Vanilla TS!");\n\nconst countBtn = document.querySelector(".btn-primary") as HTMLButtonElement;\nlet count = 0;\ncountBtn.onclick = () => {\n  count++;\n  countBtn.innerText = "Interactions: " + count;\n};' },
      { path: 'src/index.css', content: getPremiumCss({ hexBase: '#3178c6', hexRgbMap: '49, 120, 198', buttonColor: '#3178c6', shadowHex: 'rgba(49, 120, 198, 0.4)', frameworkLogoHex: '#3178c6' }) }
    ],
    dependencies: {},
    devDependencies: { "typescript": "^5.0.0" }
  }
};
