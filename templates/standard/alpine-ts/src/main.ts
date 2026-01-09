import Alpine from 'alpinejs';
import './index.css';

declare global {
    interface Window {
        Alpine: any;
    }
}

window.Alpine = Alpine;
Alpine.start();

const root = document.querySelector<HTMLDivElement>('#root');
if (root) {
    root.innerHTML = `
    <div class="app-container" x-data="{ count: 0 }">
      <header class="hero">
        <span class="badge">v1.0.0 Stable</span>
        <h1>Nexxo</h1>
        <p class="subtitle">
          The high-performance build engine for modern web applications.<br />
          Built with Alpine.js + TypeScript + Nexxo.
        </p>
      </header>

      <main class="features">
        <div class="feature-card">
          <h3>Native Core</h3>
          <p>Rust-powered hashing and scanning for lightning-fast module resolution.</p>
        </div>
        <div class="feature-card">
          <h3>Sub-100ms HMR</h3>
          <p>Instant feedback loop with state preservation across all major frameworks.</p>
        </div>
        <div class="feature-card">
          <h3>10k Module Scale</h3>
          <p>Architected to handle massive module graphs without linear performance degradation.</p>
        </div>
      </main>

      <div class="code-area">
        <button @click="count++" style="background: var(--accent); border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; color: white; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600;">
          Interactions: <span x-text="count"></span>
        </button>
      </div>

      <footer class="footer">
        Powered by <a href="https://nexxo.dev" target="_blank" rel="noopener noreferrer">Nexxo Build Tool</a>
      </footer>
    </div>
  `;
}
