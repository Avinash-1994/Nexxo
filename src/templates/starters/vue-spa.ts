/**
 * Vue SPA Starter Template
 * Production-ready Vue 3 setup with TypeScript
 */

import { TemplateConfig } from '../manager.js';

export const vueSpaTemplate: TemplateConfig = {
    id: 'vue-spa',
    name: 'Vue 3 SPA (TypeScript)',
    description: 'Modern Vue 3 Single Page Application with TypeScript',
    framework: 'vue',
    type: 'spa',
    dependencies: {
        "vue": "^3.3.4"
    },
    devDependencies: {
        "@vitejs/plugin-vue": "^4.2.3",
        "vue-tsc": "^1.8.8",
        "@nexxo/plugin-vue": "^1.0.0"
    },
    files: {
        'nexxo.config.ts': `
import { defineConfig } from 'nexxo';
import vue from '@nexxo/plugin-vue';

export default defineConfig({
    plugins: [vue()],
    server: {
        port: 3000,
        open: true
    }
});
`,
        'src/main.ts': `
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
`,
        'src/App.vue': `
<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div>
    <h1>Nexxo + Vue</h1>
  </div>
  <HelloWorld msg="Nexxo + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
`,
        'src/components/HelloWorld.vue': `
<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
`,
        'src/style.css': `
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
`,
        'env.d.ts': `/// <reference types="vite/client" />`,
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
