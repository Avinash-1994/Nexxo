const fs = require('fs');
const path = require('path');

const fixtureDir = path.join(__dirname);

function ensureDir(subpath) {
  const dir = path.join(fixtureDir, subpath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir('pages');
ensureDir('server/api');
ensureDir('store');

// Generate 50 Pages (SaaS platform routes)
for (let i = 1; i <= 50; i++) {
  fs.writeFileSync(path.join(fixtureDir, 'pages', `page-${i}.vue`), `
<template>
  <div>
    <h1>Nuxt Page ${i}</h1>
    <p>{{ count }}</p>
  </div>
</template>
<script setup>
const count = ref(${i});
</script>
`);
}

// Generate 20 API Routes (Nitro Bridge)
for (let i = 1; i <= 20; i++) {
  fs.writeFileSync(path.join(fixtureDir, 'server/api', `endpoint-${i}.ts`), `
export default defineEventHandler((event) => {
  return { endpointId: ${i}, status: 'active' };
});
`);
}

// Generate 10 Pinia Stores
for (let i = 1; i <= 10; i++) {
  fs.writeFileSync(path.join(fixtureDir, 'store', `store-${i}.ts`), `
import { defineStore } from 'pinia';
export const useStore${i} = defineStore('store-${i}', {
  state: () => ({ data: ${i * 100} })
});
`);
}

// Write the main index and dashboard
fs.writeFileSync(path.join(fixtureDir, 'pages', 'index.vue'), `
<template>
  <div>Index</div>
</template>
`);

fs.writeFileSync(path.join(fixtureDir, 'pages', 'dashboard.vue'), `
<template>
  <div>Dashboard</div>
</template>
`);
