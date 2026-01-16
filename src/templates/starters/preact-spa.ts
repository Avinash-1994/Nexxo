/**
 * Preact SPA Starter Template
 * Lightweight React alternative with Vite-compatible setup
 */

import { TemplateConfig } from '../manager.js';

export const preactSpaTemplate: TemplateConfig = {
    id: 'preact-spa',
    name: 'Preact SPA (Lightweight)',
    description: 'Ultra-lightweight 3kb alternative to React',
    framework: 'react', // Uses React-like ecosystem
    type: 'spa',
    dependencies: {
        "preact": "^10.19.0"
    },
    devDependencies: {
        "@preact/preset-vite": "^2.8.1",
        "typescript": "^5.2.0",
        "@nexxo/plugin-preact": "^1.0.0"
    },
    files: {
        'nexxo.config.ts': `
import { defineConfig } from 'nexxo';
import preact from '@preact/preset-vite';

export default defineConfig({
    plugins: [preact()],
    server: {
        port: 3000
    }
});
`,
        'src/main.tsx': `
import { render } from 'preact';
import { App } from './app';
import './index.css';

render(<App />, document.getElementById('app')!);
`,
        'src/app.tsx': `
import { useState } from 'preact/hooks';
import './app.css';

export function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div class="card">
        <h1>Nexxo + Preact</h1>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/app.tsx</code> to test HMR
        </p>
      </div>
    </>
  );
}
`,
        'src/index.css': `
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  background-color: #242424;
  color: rgba(255, 255, 255, 0.87);
}
body { margin: 0; min-height: 100vh; display: flex; place-items: center; }
`,
        'src/app.css': `
.card {
  padding: 2em;
  text-align: center;
}
button { 
  font-size: 1.2em; 
  padding: 0.6em 1.2em; 
  cursor: pointer; 
}
`,
        'index.html': `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{PROJECT_NAME}}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
    }
};
