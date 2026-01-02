import { LitElement, html, css } from 'lit';

export class UrLayout extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }
    header {
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--surface-color);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .logo {
      font-weight: 700;
      font-size: 1.5rem;
      color: var(--text-primary);
      letter-spacing: -0.05em;
      text-decoration: none;
    }
    nav ul {
      display: flex;
      gap: 1.5rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    nav a {
      color: var(--text-secondary);
      font-size: 0.9rem;
      text-decoration: none;
      transition: color 0.2s;
    }
    nav a:hover, nav a.active {
      color: var(--accent-primary);
    }
    .main-grid {
      display: grid;
      grid-template-columns: 250px 1fr;
      max-width: 1200px;
      margin: 0 auto;
    }
    aside {
      padding: 2rem;
      border-right: 1px solid var(--border-color);
      height: calc(100vh - 64px);
      position: sticky;
      top: 64px;
      overflow-y: auto;
    }
    .sidebar-section {
      margin-bottom: 2rem;
    }
    .sidebar-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
      font-weight: 600;
    }
    .sidebar-link {
      display: block;
      padding: 0.4rem 0;
      color: var(--text-primary);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    .sidebar-link:hover, .sidebar-link.active {
      color: var(--accent-primary);
    }
    .sidebar-link.active {
      font-weight: 600;
    }
    main {
      padding: 2.5rem 4rem;
      min-width: 0;
    }
    @media (max-width: 1024px) {
      .main-grid {
        grid-template-columns: 200px 1fr;
      }
      main {
        padding: 2rem;
      }
    }
    @media (max-width: 768px) {
      .main-grid {
        grid-template-columns: 1fr;
      }
      aside {
        display: none;
      }
    }
  `;

  render() {
    const hash = window.location.hash || '#/';
    return html`
      <header>
        <a href="#/" class="logo">URJA</a>
        <nav>
          <ul>
            <li><a href="#/" class="${hash === '#/' ? 'active' : ''}">Introduction</a></li>
            <li><a href="#/docs/getting-started" class="${hash.startsWith('#/docs') ? 'active' : ''}">Docs</a></li>
            <li><a href="#/guides/lit" class="${hash.startsWith('#/guides') ? 'active' : ''}">Guides</a></li>
          </ul>
        </nav>
      </header>
      <div class="main-grid">
        <aside>
          <div class="sidebar-section">
            <div class="sidebar-title">Getting Started</div>
            <a href="#/docs/getting-started" class="sidebar-link ${hash === '#/docs/getting-started' ? 'active' : ''}">Installation</a>
            <a href="#" class="sidebar-link">Quick Start</a>
          </div>
          <div class="sidebar-section">
            <div class="sidebar-title">Framework Guides</div>
            <a href="#/guides/lit" class="sidebar-link ${hash === '#/guides/lit' ? 'active' : ''}">Lit (Tier 1)</a>
            <a href="#" class="sidebar-link">Alpine.js (Tier 1)</a>
            <a href="#" class="sidebar-link">Mithril.js (Tier 1)</a>
            <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); opacity: 0.9;">
              <div class="sidebar-title" style="font-size: 0.65rem;">Mainstream Adapters</div>
              <a href="#/guides/react" class="sidebar-link ${hash === '#/guides/react' ? 'active' : ''}">React (Stable)</a>
              <a href="#/guides/vue" class="sidebar-link ${hash === '#/guides/vue' ? 'active' : ''}">Vue (Stable)</a>
              <a href="#/guides/angular" class="sidebar-link ${hash === '#/guides/angular' ? 'active' : ''}">Angular (Stable)</a>
            </div>
          </div>
          <div class="sidebar-section">
            <div class="sidebar-title">Deep Dives</div>
            <a href="#" class="sidebar-link">Frozen Core Philosphy</a>
            <a href="#" class="sidebar-link">Adapter Authoring</a>
            <a href="#" class="sidebar-link">Governance</a>
          </div>
        </aside>
        <main>
          <slot></slot>
        </main>
      </div>
    `;
  }
}

customElements.define('ur-layout', UrLayout);
