<script>
  let count = 0;

  function increment() {
    count += 1;
  }
</script>

<main>
  <h1>Lunx + Svelte</h1>
  <p>A minimal Svelte component served by Lunx.</p>
  <button on:click={increment}>
    Count: {count}
  </button>
</main>

<style>
  main {
    font-family: system-ui, sans-serif;
    max-width: 640px;
    margin: 2rem auto;
    padding: 1rem;
  }
  h1 { color: #4a90d9; }
  button {
    padding: 0.5rem 1.25rem;
    background: #4a90d9;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
