<template>
  <div>
    <p style="color:#94a3b8;font-size:14px">Vue 3.4.27 — Module Federation Remote</p>
    <div style="margin-top:12px">
      <div v-for="stat in stats" :key="stat.label" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #334155">
        <span style="color:#94a3b8">{{ stat.label }}</span>
        <strong style="color:#42b883">{{ stat.value }}</strong>
      </div>
    </div>
    <button @click="count++" style="margin-top:16px;padding:10px 20px;background:#42b883;color:#000;border:none;border-radius:8px;cursor:pointer;font-weight:600">Clicked {{ count }}×</button>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
const stats = [{ label:'Framework', value:'Vue 3' },{ label:'Build tool', value:'Lunx' },{ label:'MFE', value:'Module Federation' }];
</script>
