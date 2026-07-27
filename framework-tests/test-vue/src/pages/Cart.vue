<template>
  <div style="padding:32px;max-width:600px">
    <h1>Shopping Cart</h1>
    <div v-if="!cart.items.length" style="color:#94a3b8;margin-top:24px">Your cart is empty. <RouterLink to="/products">Shop now →</RouterLink></div>
    <div v-else>
      <div v-for="item in cart.items" :key="item.id" style="background:#1e293b;border-radius:8px;padding:16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
        <div><strong>{{ item.name }}</strong><br/><span style="color:#94a3b8">Qty: {{ item.qty }}</span></div>
        <div style="display:flex;gap:12px;align-items:center">
          <strong style="color:#818cf8">${{ (item.price * item.qty).toFixed(2) }}</strong>
          <button @click="cart.remove(item.id)" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer">✕</button>
        </div>
      </div>
      <div style="text-align:right;margin-top:20px;font-size:20px">Total: <strong style="color:#818cf8">${{ total.toFixed(2) }}</strong></div>
      <button v-if="!ordered" @click="ordered=true" style="margin-top:16px;padding:14px 32px;background:#22c55e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;width:100%">Place Order</button>
      <div v-else style="color:#22c55e;text-align:center;margin-top:16px;font-size:20px">✅ Order placed! Thank you.</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCartStore } from '../stores/cart';
const cart = useCartStore();
const ordered = ref(false);
const total = computed(() => cart.items.reduce((s,i) => s + i.price*i.qty, 0));
</script>
