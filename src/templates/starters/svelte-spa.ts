/**
 * Svelte SPA Starter Template
 * Production-ready Svelte 4 setup with TypeScript
 */

import { TemplateConfig } from '../manager.js';

export const svelteSpaTemplate: TemplateConfig = {
    id: 'svelte-spa',
    name: 'Svelte SPA (TypeScript)',
    description: 'Modern Svelte 4 Single Page Application with TypeScript',
    framework: 'svelte',
    type: 'spa',
    dependencies: {
        "svelte": "^4.2.0"
    },
    devDependencies: {
        "@sveltejs/vite-plugin-svelte": "^2.4.5",
        "svelte-check": "^3.5.0",
        "tslib": "^2.6.2",
        "typescript": "^5.2.2",
        "@nexxo/plugin-svelte": "^1.0.0"
    },
    files: {
        'nexxo.config.ts': `
import { defineConfig } from 'nexxo';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte()],
    server: {
        port: 3000
    }
});
`,
        'src/main.ts': `
import './app.css'
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app')!,
})

export default app
`,
        'src/App.svelte': `
<script lang="ts">
  import Counter from './lib/Counter.svelte'

  let nexxoLogo = '/nexxo.svg'
</script>

<main>
  <h1>Nexxo + Svelte</h1>

  <div class="card">
    <Counter />
  </div>

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">
    Click on the Nexxo and Svelte logos to learn more
  </p>
</main>

<style>
  .read-the-docs {
    color: #888;
  }
</style>
`,
        'src/lib/Counter.svelte': `
<script lang="ts">
  let count: number = 0
  const increment = () => {
    count += 1
  }
</script>

<button on:click={increment}>
  count is {count}
</button>
`,
        'src/app.css': `
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
        'src/vite-env.d.ts': `/// <reference types="svelte" />
/// <reference types="vite/client" />`,
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
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`
    }
};
