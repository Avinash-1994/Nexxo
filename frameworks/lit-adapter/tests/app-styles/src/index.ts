import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import styles from './style.css?inline'; // Lit often uses inline or we just import it to see if adapter handles it.
// Standard Vite/Lit setup usually imports CSS as string or side-effect.
// Urja LitAdapter should handle `import './style.css'` by emitting a CSS file OR injecting it.
// Requirements say: "CSS must be extracted to separate files in production".
import './style.css';
import logo from './logo.png';

@customElement('my-styles')
export class MyStyles extends LitElement {
    render() {
        return html`<img src="${logo}" />`;
    }
}
