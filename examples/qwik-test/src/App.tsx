import { component$, useSignal } from '@builder.io/qwik';

export default component$(() => {
    const count = useSignal(0);
    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h1 style={{ color: "#006af5" }}>⚡ Urja Build Tool - Qwik Test</h1>
            <p>Framework: <strong>Qwik 1.x (Resumability)</strong></p>
            <p>Status: ✅ Fine-grained Lazy Loading Active</p>
            <button
                style={{ padding: "10px 20px", background: "#006af5", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                onClick$={() => count.value++}>
                Resumable Clicks: {count.value}
            </button>
        </div>
    );
});
