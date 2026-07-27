<template>
  <div class="app">
    <nav>
      <span class="brand">🛒 Lunx Shop</span>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/products">Products</RouterLink>
      <RouterLink to="/cart">Cart ({{ cartCount }})</RouterLink>
      <RouterLink to="/login">Login</RouterLink>
    </nav>
    <RouterView/>
  </div>
</template>
<script setup lang="ts">
import { useCartStore } from './stores/cart';
import { computed } from 'vue';
const cart = useCartStore();
const cartCount = computed(() => cart.items.reduce((a,i) => a + i.qty, 0));
</script>
<style>
* { box-sizing: border-box; margin: 0; }
body { background: #0f172a; color: #f1f5f9; font-family: system-ui; }
nav { background: #1e293b; padding: 0 24px; display: flex; gap: 20px; align-items: center; height: 56px; }
nav a { color: #94a3b8; text-decoration: none; }
nav a:hover { color: #fff; }
.brand { font-weight: 700; font-size: 18px; margin-right: 16px; }
</style>
