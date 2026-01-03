<script>
    let count = $state(0);
</script>

<main>
    <h1>🔥 Urja Build Tool - Svelte 5 Test</h1>
    <p>Framework: <strong>Svelte 5.x (Runes)</strong></p>
    <p>Status: ✅ Fine-grained Reactivity ($state) Verified</p>

    <button onclick={() => count++}>
        Rune-based Count: {count}
    </button>
</main>

<style>
    main {
        padding: 2rem;
        font-family: "Outfit", sans-serif;
        text-align: center;
    }
    h1 {
        color: #ff3e00;
    }
    button {
        font-size: 1.2rem;
        padding: 1rem 2rem;
        border-radius: 50px;
        background: linear-gradient(135deg, #ff3e00 0%, #ff8e53 100%);
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 10px 20px rgba(255, 62, 0, 0.3);
        transition: transform 0.2s;
    }
    button:active {
        transform: scale(0.95);
    }
</style>
