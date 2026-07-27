import { component$, Slot } from '@builder.io/qwik';

export default component$(() => {
  return (
    <div>
      <header><a href="/">⚡ Lunx Qwik Store</a></header>
      <main><Slot /></main>
      <footer><p>Phase 2.5 — Qwik City</p></footer>
    </div>
  );
});
