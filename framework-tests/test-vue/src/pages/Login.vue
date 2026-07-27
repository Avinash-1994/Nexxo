<template>
  <div style="padding:32px;max-width:400px">
    <h1>Sign In</h1>
    <div v-if="ok" style="color:#22c55e;margin-top:24px">✅ Welcome back! <RouterLink to="/">Go to shop →</RouterLink></div>
    <form v-else @submit.prevent="ok=true" style="display:flex;flex-direction:column;gap:16px;margin-top:24px">
      <input type="email" placeholder="Email" required style="padding:12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#fff"/>
      <input type="password" placeholder="Password" required style="padding:12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#fff"/>
      <button type="submit" style="padding:12px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600">Sign In</button>
    </form>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const ok = ref(false);
</script>
