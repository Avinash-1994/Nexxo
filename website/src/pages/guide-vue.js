import { LitElement, html, css } from 'lit';

export class UrGuideVue extends LitElement {
    static styles = css`
    :host { display: block; }
    h1 { font-size: 2.5rem; font-family: 'Space Grotesk', sans-serif; }
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      background: #42b883;
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
      <div class="status-badge">MAINSTREAM ADAPTER</div>
      <h1>Vue Strategy</h1>
      <p>Nexxo supports Vue Single File Components (SFCs) via a specialized compiler adapter. It separates the template, script, and style blocks and injects them into the Nexxo dependency graph as discrete modules.</p>

      <h2>Installation</h2>
      <pre><code>npm install -D @nexxo/vue-adapter vue</code></pre>

      <h2>Configuration</h2>
      <pre><code>module.exports = {
  adapter: 'vue-adapter',
  entryPoints: ['src/main.js']
};</code></pre>

      <h2>Scoped CSS</h2>
      <p>Nexxo's CSS engine fully respects <code>&lt;style scoped&gt;</code>. The Vue adapter handles the unique attribute injection required to maintain scope across HMR updates.</p>

      <h2>Performance</h2>
      <p>By isolating the SFC compiler in the adapter, Nexxo can parallelize the compilation of hundreds of Vue components across the native Rust worker pool.</p>
    `;
    }
}

customElements.define('ur-guide-vue', UrGuideVue);
