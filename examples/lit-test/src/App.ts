import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('simple-greeting')
export class SimpleGreeting extends LitElement {
    static styles = css`
        :host { display: block; padding: 16px; font-family: sans-serif; }
        h1 { color: #325cff; }
        button { padding: 8px 16px; background: #325cff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    `;

    @property({ type: Number })
    count = 0;

    render() {
        return html`
            <h1>💡 Urja Build Tool - Lit Test</h1>
            <p>Framework: <strong>Lit 3.x</strong></p>
            <p>Status: ✅ Web Components Verified</p>
            <button @click=${() => this.count++}>
                Properties & Events: ${this.count}
            </button>
        `;
    }
}
