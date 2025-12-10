<script>
  let count = 0;
</script>

<div style="padding: 20px; font-family: sans-serif;">
  <h1>Svelte Fresh Test</h1>
  <p>Count: {count}</p>
  <button on:click={() => count++}>Increment</button>
</div>
