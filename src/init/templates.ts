import fs from 'fs/promises';
import path from 'path';
import { log } from '../utils/logger.js';

export type TemplateType = 'react' | 'vue' | 'svelte' | 'vanilla';

const TEMPLATES: Record<TemplateType, Record<string, string>> = {
    react: {
        'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nexxo React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
        'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
        'src/App.jsx': `import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>Nexxo + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App`,
        'src/index.css': `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}`
    },
    vue: {
        'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nexxo Vue App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`,
        'src/main.js': `import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')`,
        'src/App.vue': `<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div>
    <h1>Nexxo + Vue</h1>
    <div class="card">
      <button type="button" @click="count++">count is {{ count }}</button>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
</style>`,
        'src/style.css': `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}`
    },
    svelte: {
        'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nexxo Svelte App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`,
        'src/main.js': `import './app.css'
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app'),
})

export default app`,
        'src/App.svelte': `<script>
  let count = 0
  const increment = () => count += 1
</script>

<main>
  <h1>Nexxo + Svelte</h1>
  <div class="card">
    <button on:click={increment}>
      count is {count}
    </button>
  </div>
</main>

<style>
  .card {
    padding: 2em;
  }
</style>`,
        'src/app.css': `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}`
    },
    vanilla: {
        'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nexxo App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`,
        'src/main.js': `import './style.css'

document.querySelector('#app').innerHTML = \`
  <div>
    <h1>Nexxo Build Tool</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
  </div>
\`

let count = 0
const element = document.querySelector('#counter')
element.innerHTML = \`count is \${count}\`
element.addEventListener('click', () => {
  count++
  element.innerHTML = \`count is \${count}\`
})`,
        'src/style.css': `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}`
    }
};

export async function scaffoldTemplate(cwd: string, type: TemplateType) {
    log.info(`Scaffolding ${type} template...`);

    const template = TEMPLATES[type];
    if (!template) {
        throw new Error(`Unknown template type: ${type}`);
    }

    for (const [filePath, content] of Object.entries(template)) {
        const fullPath = path.join(cwd, filePath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content);
        log.success(`Created ${filePath}`);
    }
}
