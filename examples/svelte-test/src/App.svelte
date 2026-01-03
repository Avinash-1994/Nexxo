<script>
  let count = 0;
  function handleClick() {
    count += 1;
  }
</script>

<main>
  <h1 style="color: #ff3e00">🔥 Urja Build Tool - Svelte Test</h1>
  <p>Framework: <strong>Svelte 4.x</strong></p>
  <p>Status: ✅ HMR Stable</p>
  <button on:click={handleClick}>
    Reactive Clicks: {count}
  </button>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 2em;
    font-weight: 100;
  }
</style>
