import { LitElement, html, css } from 'lit';

export class UrGuideLit extends LitElement {
    static styles = css`
    :host {
      display: block;
    }
    h1 { font-size: 2.5rem; }
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      background: var(--accent-secondary);
      color: #000;
      margin-bottom: 1rem;
    }
    .warning {
      padding: 1rem;
      border-left: 4px solid var(--accent-error);
      background: rgba(239, 68, 68, 0.1);
      margin: 1.5rem 0;
    }
  `;

    render() {
        return html`
      <div class="status-badge">TIER-1 ADAPTER</div>
      <h1>Lit Guide</h1>
      <p>The Lit adapter provides first-class support for Web Components with Nexxo. It handles scoped CSS, HMR for component logic, and asset resolution within templates.</p>

      <h2>Core Guarantees</h2>
      <ul>
        <li><strong>Shadow DOM Isolation</strong>: Styles are correctly scoped to component roots.</li>
        <li><strong>Deterministic Chunks</strong>: Build outputs are bit-for-bit identical.</li>
        <li><strong>Fast HMR</strong>: Component updates in sub-50ms.</li>
      </ul>

      <div class="warning">
        <strong>Limitation</strong>: SSR for Lit is not supported in the Nexxo core. Components must be rendered on the client.
      </div>

      <h2>Setup</h2>
      <pre><code>module.exports = {
  adapter: 'lit-adapter',
  entryPoints: ['src/main.js']
};</code></pre>

      <h2>HMR Behavior</h2>
      <p>Nexxo's HMR for Lit uses a neutral invalidation model. When a component file changes, the adapter triggers a re-definition of the custom element or a full reload if state preservation is not possible.</p>
    `;
    }
}

customElements.define('ur-guide-lit', UrGuideLit);
