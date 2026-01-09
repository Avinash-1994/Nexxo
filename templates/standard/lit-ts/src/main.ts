import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './index.css';

@customElement('nexxo-app')
export class NexxoApp extends LitElement {
    render() {
        return html`
      <div class="app-container">
        <header class="hero">
          <span class="badge">v1.0.0 Stable</span>
          <h1>Nexxo</h1>
          <p class="subtitle">
            The high-performance build engine for modern web applications.<br />
            Engineered for speed. Built for stability.
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
          <span style="color: #6366F1">$</span> nexxo build --optimize
          <br />
          <span style="color: #94A3B8; opacity: 0.6">// Generating optimized production bundle...</span>
          <br />
          <span style="color: #10B981">✓ Build complete in 1.4s</span>
        </div>

        <footer class="footer">
          Powered by <a href="https://nexxo.dev" target="_blank" rel="noopener noreferrer">Nexxo Build Tool</a>
        </footer>
      </div>
    `;
    }

    // Use light DOM for global CSS to apply correctly from index.css
    createRenderRoot() {
        return this;
    }
}
