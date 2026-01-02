import { LitElement, html, css } from 'lit';

export class AppRoot extends LitElement {
    static properties = {
        count: { type: Number },
        message: { type: String }
    };

    constructor() {
        super();
        this.count = 0;
        this.message = 'Hello from Urja + Lit!';
    }

    render() {
        return html`
      <div class="template-root">
        <h1>Lit Starter</h1>
        <p>${this.message}</p>
        <button @click="${this._increment}">
          Count: ${this.count}
        </button>
        <img src="/logo.svg" class="logo" alt="Logo" />
      </div>
    `;
    }

    _increment() {
        this.count++;
    }

    static styles = css`
    :host {
      display: block;
      font-family: 'Outfit', sans-serif;
      text-align: center;
    }
    .template-root {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      padding: 3rem;
      border-radius: 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      max-width: 400px;
      display: inline-block;
    }
    h1 {
      margin-top: 0;
      color: #00b09b;
      font-size: 2rem;
    }
    button {
      background: #00b09b;
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 12px;
      font-size: 1.1rem;
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
      font-family: inherit;
      font-weight: 600;
    }
    button:hover {
      background: #008f7d;
      transform: translateY(-2px);
    }
    .logo {
      margin-top: 2rem;
      width: 80px;
      height: 80px;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
  `;
}

customElements.define('app-root', AppRoot);
