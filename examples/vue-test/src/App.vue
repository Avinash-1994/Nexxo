<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++
</script>

<template>
  <div class="vue-container">
    <h1 style="color: #42b883">🖖 Urja Build Tool - Vue 3 Test</h1>
    <p>Framework: <strong>Vue 3.x (SFC + Script Setup)</strong></p>
    <p>Status: ✅ Verified Compatible</p>
    <button @click="increment">Interactive Count: {{ count }}</button>
  </div>
</template>

<style scoped>
.vue-container {
  font-family: sans-serif;
  text-align: center;
  padding: 2rem;
}
button {
  padding: 10px 20px;
  font-size: 1.2rem;
  cursor: pointer;
}
</style>
