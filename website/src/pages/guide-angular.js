import { LitElement, html, css } from 'lit';

export class UrGuideAngular extends LitElement {
    static styles = css`
    :host { display: block; }
    h1 { font-size: 2.5rem; font-family: 'Space Grotesk', sans-serif; }
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      background: #dd0031;
      color: white;
      margin-bottom: 1rem;
    }
    pre {
      background: var(--border-color);
      padding: 1.5rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1.5rem 0;
      font-size: 0.9rem;
    }
  `;

    render() {
        return html`
      <div class="status-badge">ARCHITECTURAL ADAPTER</div>
      <h1>Angular Strategy</h1>
      <p>Supporting Angular in a non-Webpack/CLI environment requires a specialized AOT (Ahead-of-Time) compiler bridge. Urja's Angular adapter provides a lightweight target for Angular's <code>@angular/compiler-cli</code>.</p>

      <h2>The Urja Advantage for Angular</h2>
      <p>Angular projects often suffer from slow "Full Rebuilds." Urja's incremental graph allows the Angular adapter to only re-compile the component tree affected by a code change, significantly lowering dev loop latency.</p>

      <h2>Setup</h2>
      <pre><code>module.exports = {
  adapter: 'angular-adapter',
  entryPoints: ['src/main.ts'],
  tsConfigFile: './tsconfig.app.json'
};</code></pre>

      <h2>State Management</h2>
      <p>Urja is compatible with NgRx and other state libraries. The adapter ensures that the Zone.js runtime is correctly bootstrapped and maintained across HMR boundaries.</p>
    `;
    }
}

customElements.define('ur-guide-angular', UrGuideAngular);
