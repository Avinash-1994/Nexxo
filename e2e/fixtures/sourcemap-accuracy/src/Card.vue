<template>
  <!-- ── MARKER: Vue SFC template at LINE 2 ── -->
  <div class="card">
    <h2 class="card__title">{{ title }}</h2>  <!-- line 4 — ANCHOR -->
    <p>{{ message }}</p>
  </div>
</template>

<script lang="ts">
// ── MARKER: script block at LINE 10 ──
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'AccuracyCard',          // line 14 — ANCHOR
  props: {
    title: { type: String, required: true },
    message: { type: String, default: '' }
  },
  setup() {
    const count = ref(0);        // line 20 — ANCHOR
    return { count };
  }
});
</script>

<style scoped>
/* ── MARKER: SFC style block at LINE 27 ── */
.card {
  padding: 1rem;               /* line 29 — ANCHOR */
}
</style>
