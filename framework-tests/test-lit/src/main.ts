import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`p { color: blue }`;
  @property() name = 'Lunx Lit';
  render() { return html`<p>Hello, ${this.name}!</p>`; }
}
