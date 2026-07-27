<template>
  <div style="padding:32px">
    <h1>Featured Products</h1>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;margin-top:24px">
      <div v-for="p in featured" :key="p.id" style="background:#1e293b;border-radius:12px;padding:20px">
        <div style="font-size:48px;margin-bottom:12px">{{ p.emoji }}</div>
        <h3>{{ p.name }}</h3>
        <p style="color:#94a3b8;font-size:14px;margin:8px 0">{{ p.desc }}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px">
          <strong style="color:#818cf8">${{ p.price }}</strong>
          <button @click="cart.add(p)" style="padding:8px 16px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useCartStore } from '../stores/cart';
const cart = useCartStore();
const featured = [
  {id:1,name:'Wireless Headphones',price:89.99,emoji:'🎧',desc:'Premium sound with ANC'},
  {id:2,name:'Mechanical Keyboard',price:149.99,emoji:'⌨️',desc:'TKL, Cherry MX Brown'},
  {id:3,name:'USB-C Hub',price:49.99,emoji:'🔌',desc:'7-in-1, 4K HDMI'},
  {id:4,name:'Webcam 4K',price:119.99,emoji:'📸',desc:'1080p60 / 4K30'},
];
</script>
