/**
 * Solid SPA Starter Template
 * Production-ready SolidJS setup with TypeScript
 */

import { TemplateConfig } from '../manager.js';

export const solidSpaTemplate: TemplateConfig = {
    id: 'solid-spa',
    name: 'SolidJS SPA (TypeScript)',
    description: 'Modern SolidJS Single Page Application with TypeScript',
    framework: 'solid',
    type: 'spa',
    dependencies: {
        "solid-js": "^1.8.1"
    },
    devDependencies: {
        "vite-plugin-solid": "^2.7.2",
        "typescript": "^5.2.2",
        "@nexxo/plugin-solid": "^1.0.0"
    },
    files: {
        'nexxo.config.ts': `
import { defineConfig } from 'nexxo';
import solid from 'vite-plugin-solid';

export default defineConfig({
    plugins: [solid()],
    server: {
        port: 3000
    }
});
`,
        'src/index.tsx': `
/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './App';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <App />, root!);
`,
        'src/App.tsx': `
import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';

import logo from './logo.svg';
import styles from './App.module.css';

const App: Component = () => {
  const [count, setCount] = createSignal(0);

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <p>
          Nexxo + SolidJS
        </p>
        <button class={styles.button} onClick={() => setCount((c) => c + 1)}>
            Count: {count()}
        </button>
        <a
          class={styles.link}
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>
      </header>
    </div>
  );
};

export default App;
`,
        'src/App.module.css': `
.App {
  text-align: center;
}

.logo {
  animation: logo-spin infinite 20s linear;
  height: 40vmin;
  pointer-events: none;
}

.header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.link {
  color: #b318f0;
}

.button {
    margin: 2rem;
    padding: 1rem 2rem;
    font-size: 1.5rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`,
        'src/index.css': `
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
`,
        'src/vite-env.d.ts': `/// <reference types="vite/client" />`,
        'index.html': `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{PROJECT_NAME}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
`
    }
};
