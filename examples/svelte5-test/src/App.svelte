<script>
    let count = $state(0);
</script>

<button onclick={() => count++}>
    Count: {count}
</button>

<style>
    button {
        font-family: sans-serif;
        padding: 1rem;
        border-radius: 8px;
        background: #ff3e00;
        color: white;
        border: none;
        cursor: pointer;
    }
</style>
