import { LitElement, html, css } from 'lit';

export class UrGuideReact extends LitElement {
    static styles = css`
    :host { display: block; }
    h1 { font-size: 2.5rem; font-family: 'Space Grotesk', sans-serif; }
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      background: var(--accent-primary);
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
    .info-box {
        padding: 1.5rem;
        background: rgba(47, 128, 237, 0.05);
        border-left: 4px solid var(--accent-primary);
        border-radius: 0 8px 8px 0;
        margin: 2rem 0;
    }
  `;

    render() {
        return html`
      <div class="status-badge">MAINSTREAM ADAPTER</div>
      <h1>React Strategy</h1>
      <p>Urja's React adapter focuses on absolute decoupling. It leverages <code>@babel/preset-react</code> or <code>esbuild</code> internally to handle JSX while maintaining Urja's strict HMR contract.</p>

      <div class="info-box">
        <strong>Optimization Tip</strong>: The React adapter uses the automatic JSX runtime by default. You do not need to import React in every <code>.jsx</code> or <code>.tsx</code> file.
      </div>

      <h2>Installation</h2>
      <pre><code>npm install -D @urja/react-adapter react react-dom</code></pre>

      <h2>Configuration</h2>
      <pre><code>module.exports = {
  adapter: 'react-adapter',
  entryPoints: ['src/main.jsx'],
  presets: ['spa']
};</code></pre>

      <h2>HMR & State</h2>
      <p>Urja implements a "Fast Refresh" bridge that preserves component state during development. Unlike standard Vite/Webpack plugins, this bridge is isolated within the <code>react-adapter</code> and does not modify the Urja core graph.</p>

      <h2>Handling CSS-in-JS</h2>
      <p>Whether you use Emotion, Styled Components, or Tailwind, the React adapter treats them as standard asset dependencies, ensuring they are bundled deterministically in production.</p>
    `;
    }
}

customElements.define('ur-guide-react', UrGuideReact);
