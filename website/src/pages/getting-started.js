import { LitElement, html, css } from 'lit';

export class UrDocsGettingStarted extends LitElement {
    static styles = css`
    :host {
      display: block;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 2rem;
    }
    code {
      background: var(--border-color);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.9em;
    }
    pre {
      background: var(--border-color);
      padding: 1.5rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1.5rem 0;
    }
    .step {
      margin-bottom: 3rem;
    }
    .step-number {
      font-weight: 700;
      color: var(--accent-primary);
      margin-right: 0.5rem;
    }
  `;

    render() {
        return html`
      <h1>Getting Started</h1>
      
      <div class="step">
        <h2><span class="step-number">01.</span> Installation</h2>
        <p>Install the Urja CLI globally or as a dev dependency in your project.</p>
        <pre><code>npm install -D urja</code></pre>
      </div>

      <div class="step">
        <h2><span class="step-number">02.</span> Initialize Project</h2>
        <p>Use the bootstrap command to create a new project from a Tier-1 template.</p>
        <pre><code>npx urja bootstrap</code></pre>
      </div>

      <div class="step">
        <h2><span class="step-number">03.</span> Configuration</h2>
        <p>Create an <code>urja.config.js</code> file in your project root. Specify your adapter and entry points.</p>
        <pre><code>module.exports = {
  adapter: 'lit-adapter',
  entryPoints: ['src/main.js'],
  outputDir: 'dist'
};</code></pre>
      </div>

      <div class="step">
        <h2><span class="step-number">04.</span> Start Development</h2>
        <p>Run the dev server to start working with HMR support.</p>
        <pre><code>npx urja dev</code></pre>
      </div>
    `;
    }
}

customElements.define('ur-docs-getting-started', UrDocsGettingStarted);
