import { LitElement, html, css } from 'lit';

export class UrHome extends LitElement {
    static styles = css`
    :host {
      display: block;
    }
    .hero {
      margin-bottom: 4rem;
    }
    h1 {
      font-size: 3.5rem;
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: -0.05em;
      margin-bottom: 1.5rem;
      color: var(--text-primary);
      line-height: 1.1;
    }
    .tagline {
      font-size: 1.25rem;
      color: var(--text-secondary);
      margin-bottom: 3rem;
      max-width: 60ch;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 4rem;
    }
    .card {
      padding: 2.5rem;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: var(--surface-color);
      transition: border-color 0.2s;
    }
    .card:hover {
      border-color: var(--accent-primary);
    }
    .card h2 {
      margin-top: 0;
      font-size: 1.5rem;
      font-family: 'Space Grotesk', sans-serif;
      margin-bottom: 1rem;
    }
    .card p {
      color: var(--text-secondary);
      font-size: 0.95rem;
    }
    .alert {
      padding: 1.5rem;
      border-left: 4px solid var(--accent-warning);
      background: rgba(245, 158, 11, 0.05);
      margin: 3rem 0;
      border-radius: 0 8px 8px 0;
    }
    .alert-title {
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--accent-warning);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .framework-pill {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: 20px;
        background: var(--border-color);
        font-size: 0.75rem;
        font-weight: 600;
        margin-right: 0.5rem;
    }
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      margin: 3rem 0;
      font-size: 0.9rem;
    }
    .comparison-table th, .comparison-table td {
      padding: 1.25rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    .comparison-table th {
      color: var(--text-secondary);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .cta-button {
        background: var(--accent-primary);
        color: white;
        padding: 0.8rem 2rem;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none;
        display: inline-block;
        transition: opacity 0.2s;
    }
    .cta-button:hover {
        opacity: 0.9;
        text-decoration: none;
    }
  `;

    render() {
        return html`
      <div class="hero">
        <h1>Energy-Powered Built Interface.</h1>
        <p class="tagline">Urja is a production-grade build tool that enforces architectural discipline through a frozen core and strictly isolated framework adapters.</p>
        <a href="/docs/getting-started" class="cta-button">Get Started →</a>
      </div>

      <div class="grid">
        <div class="card">
          <h2>Isolated Adapters</h2>
          <p>Whether you're using React, Vue, or Angular, Urja ensures that framework logic never leaks into your core engine. Each adapter operates as a pure data producer.</p>
          <div style="margin-top: 1rem;">
            <span class="framework-pill">React</span>
            <span class="framework-pill">Vue</span>
            <span class="framework-pill">Angular</span>
          </div>
        </div>
        <div class="card">
          <h2>Frozen Core</h2>
          <p>Our core orchestration logic is locked. This eliminates architectural drift and ensures that your build process remains deterministic and predictable for years.</p>
        </div>
        <div class="card">
          <h2>Neutral HMR</h2>
          <p>Urja's Hot Module Replacement uses a standard invalidation model that works universally across VDOM, DOM, and Web Component paradigms.</p>
        </div>
      </div>

      <div class="alert">
        <div class="alert-title">⚠️ Non-Goal: Meta-Framework Logic</div>
        <p>Urja is a <strong>Bundler</strong>, not a framework. It does not provide built-in SSR, file-system routing, or data-fetching hooks. It is designed to be the foundation for your custom architecture.</p>
      </div>

      <h2>How Urja Compares</h2>
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Axis</th>
            <th>Urja</th>
            <th>Vite / Webpack</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Framework Coupling</strong></td>
            <td>Zero. Logic lives in isolated adapters.</td>
            <td>High. Global plugin context.</td>
          </tr>
          <tr>
            <td><strong>Architectural Drift</strong></td>
            <td>Impossible. Core is frozen.</td>
            <td>Common over time.</td>
          </tr>
          <tr>
            <td><strong>Bundle Ownership</strong></td>
            <td>Full control over lifecycle hooks.</td>
            <td>Abstracted by complex plugin chains.</td>
          </tr>
          <tr>
            <td><strong>Performance</strong></td>
            <td>Standardized sub-50ms HMR.</td>
            <td>Variable based on plugin load.</td>
          </tr>
        </tbody>
      </table>

      <h2>Who is this for?</h2>
      <p>Urja is built for <strong>Technical Architects</strong> who are tired of their build tool dictating their project's structure. If you need a stable, long-term foundation for a multi-framework organization, Urja is your tool.</p>
    `;
    }
}

customElements.define('ur-home', UrHome);
