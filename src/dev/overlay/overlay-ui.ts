
/**
 * Nexxo Error Overlay UI
 * Implementation: Web Component with Shadow DOM
 * Day 15: Reliable Error Overlay Lock
 */

const STYLE = `
:host {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  font-family: Menlo, Consolas, monospace;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}

.window {
  background: #1e1e1e;
  width: 80%;
  max-width: 800px;
  max-height: 80%;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  border: 1px solid #ff4444;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background: #ff4444;
  color: white;
  padding: 12px 20px;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: white;
}

.content {
  padding: 20px;
  overflow-y: auto;
}

.message {
  font-size: 18px;
  line-height: 1.4;
  margin-bottom: 20px;
  font-weight: 600;
  color: #ffcccc;
}

.stack {
  background: #000;
  padding: 15px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  color: #aaddff;
  white-space: pre-wrap;
  font-family: inherit;
}

.file-link {
  color: #44aaff;
  text-decoration: underline;
  cursor: pointer;
}
`;

export class NexxoErrorOverlay extends HTMLElement {
    root: ShadowRoot;

    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    showError(err: { message: string, stack?: string, file?: string, line?: number }) {
        // Clean existing
        this.root.innerHTML = '';

        const style = document.createElement('style');
        style.textContent = STYLE;
        this.root.appendChild(style);

        const win = document.createElement('div');
        win.className = 'window';

        // Header
        const header = document.createElement('div');
        header.className = 'header';
        header.innerHTML = `<span>Error in ${err.file || 'Application'}</span>`;

        const close = document.createElement('button');
        close.className = 'close-btn';
        close.textContent = '×';
        close.onclick = () => this.remove();
        header.appendChild(close);

        win.appendChild(header);

        // Content
        const content = document.createElement('div');
        content.className = 'content';

        const msg = document.createElement('div');
        msg.className = 'message';
        msg.textContent = err.message;
        content.appendChild(msg);

        if (err.stack) {
            const stack = document.createElement('pre');
            stack.className = 'stack';
            // Simple robust stack formatting
            stack.textContent = err.stack.replace(err.message, '').trim();
            content.appendChild(stack);
        }

        win.appendChild(content);
        this.root.appendChild(win);
    }

    render() {
        // Initial render logic if needed
    }
}

if (!customElements.get('nexxo-error-overlay')) {
    customElements.define('nexxo-error-overlay', NexxoErrorOverlay);
}
