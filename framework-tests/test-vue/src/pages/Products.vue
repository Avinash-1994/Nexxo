<template>
  <div style="padding:32px">
    <h1>All Products</h1>
    <input v-model="q" placeholder="Search products..." style="padding:10px 16px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#fff;width:100%;max-width:400px;margin:16px 0"/>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px">
      <div v-for="p in filtered" :key="p.id" style="background:#1e293b;border-radius:10px;padding:20px">
        <div style="font-size:40px">{{ p.emoji }}</div>
        <h3 style="margin:12px 0 4px">{{ p.name }}</h3>
        <div style="color:#818cf8;font-weight:700">${{ p.price }}</div>
        <button @click="cart.add(p)" style="margin-top:12px;padding:8px 16px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;width:100%">Add to Cart</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCartStore } from '../stores/cart';
const cart = useCartStore();
const q = ref('');
const all = [
  {id:1,name:'Wireless Headphones',price:89.99,emoji:'🎧'},{id:2,name:'Mechanical Keyboard',price:149.99,emoji:'⌨️'},
  {id:3,name:'USB-C Hub',price:49.99,emoji:'🔌'},{id:4,name:'Webcam 4K',price:119.99,emoji:'📸'},
  {id:5,name:'Monitor Stand',price:39.99,emoji:'🖥️'},{id:6,name:'Mouse Pad XL',price:24.99,emoji:'🖱️'},
  {id:7,name:'Cable Management Kit',price:19.99,emoji:'🗂️'},{id:8,name:'LED Desk Lamp',price:59.99,emoji:'💡'},
  {id:9,name:'Laptop Stand',price:44.99,emoji:'💻'},{id:10,name:'Ethernet Adapter',price:29.99,emoji:'🌐'},
  {id:11,name:'Screen Cleaner Kit',price:14.99,emoji:'🧹'},{id:12,name:'Portable SSD 1TB',price:99.99,emoji:'💾'},
];
const filtered = computed(() => all.filter(p => p.name.toLowerCase().includes(q.value.toLowerCase())));
</script>
