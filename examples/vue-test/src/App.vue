<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++
</script>

<template>
  <div class="vue-container">
    <h1>Vue 3 Support Verified!</h1>
    <button @click="increment">Count is: {{ count }}</button>
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
