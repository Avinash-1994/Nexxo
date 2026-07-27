<script lang="ts">
  import { writable } from 'svelte/store';
  const notes = writable([
    { id:1, title:'Getting Started with Lunx', content:'# Getting Started\n\nLunx is a **fast** build tool powered by SWC and LightningCSS.\n\n- Zero config for all major frameworks\n- Sub-100ms HMR\n- Built-in security pipeline', folder:'work', updated: '2026-05-14' },
    { id:2, title:'Meeting Notes — Q2 Review', content:'## Q2 Review\n\n- Shipped 19 meta-framework adapters\n- 303 tests passing\n- Security gate with CVE scanning live', folder:'work', updated: '2026-05-13' },
    { id:3, title:'Book List 2026', content:'# Books to Read\n\n1. The Pragmatic Programmer\n2. Clean Architecture\n3. Designing Data-Intensive Applications', folder:'personal', updated: '2026-05-10' },
    { id:4, title:'Recipe: Pasta Arrabbiata', content:'## Ingredients\n\n- 400g penne\n- 4 cloves garlic\n- 1 can crushed tomatoes\n- Red chilli flakes', folder:'personal', updated: '2026-05-09' },
  ]);
  let selected = 1;
  let editing = false;

  $: note = $notes.find(n => n.id === selected);
  $: preview = note ? note.content : '';
</script>

<div style="display:flex;height:100vh;background:#0f172a;color:#f1f5f9;font-family:system-ui">
  <aside style="width:260px;background:#1e293b;border-right:1px solid #334155;display:flex;flex-direction:column">
    <div style="padding:16px;font-weight:700;font-size:18px;border-bottom:1px solid #334155">📝 Lunx Notes</div>
    <div style="padding:8px">
      {#each $notes as n}
        <button on:click={() => selected = n.id} style="width:100%;text-align:left;padding:12px;border-radius:8px;border:none;background:{selected===n.id?'#334155':'transparent'};color:#f1f5f9;cursor:pointer;margin-bottom:4px">
          <div style="font-weight:600;font-size:14px">{n.title}</div>
          <div style="color:#94a3b8;font-size:12px">{n.folder} · {n.updated}</div>
        </button>
      {/each}
    </div>
  </aside>
  <main style="flex:1;display:flex;flex-direction:column">
    {#if note}
      <div style="padding:16px 24px;border-bottom:1px solid #334155;display:flex;justify-content:space-between;align-items:center">
        <h2 style="margin:0">{note.title}</h2>
        <button on:click={() => editing = !editing} style="padding:8px 16px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer">{editing ? 'Preview' : 'Edit'}</button>
      </div>
      <div style="flex:1;padding:24px;overflow:auto">
        {#if editing}
          <textarea bind:value={note.content} style="width:100%;height:100%;background:#1e293b;color:#f1f5f9;border:1px solid #334155;border-radius:8px;padding:16px;font-size:15px;font-family:monospace;resize:none"/>
        {:else}
          <div style="max-width:720px">{@html preview}</div>
        {/if}
      </div>
    {/if}
  </main>
</div>
