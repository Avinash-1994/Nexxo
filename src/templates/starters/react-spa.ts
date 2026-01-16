/**
 * React SPA Starter Template
 * Production-ready React 18+ setup with TypeScript
 */

import { TemplateConfig } from '../manager.js';

export const reactSpaTemplate: TemplateConfig = {
    id: 'react-spa',
    name: 'React SPA (TypeScript)',
    description: 'Modern React 18+ Single Page Application with TypeScript',
    framework: 'react',
    type: 'spa',
    dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
    },
    devDependencies: {
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@nexxo/plugin-react": "^1.0.0"
    },
    files: {
        'nexxo.config.ts': `
import { defineConfig } from 'nexxo';
import react from '@nexxo/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true
    }
});
`,
        'src/main.tsx': `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'; // Note: .js extension for ESM
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`,
        'src/App.tsx': `
import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Nexxo + React</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Nexxo logo to learn more
        </p>
      </header>
    </div>
  );
}

export default App;
`,
        'src/index.css': `
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}
`,
        'src/App.css': `
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
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
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
    }
};
