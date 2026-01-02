import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
    @property()
    name = 'World';

    render() {
        return html`<p>Hello, ${this.name}!</p>`;
    }
}
