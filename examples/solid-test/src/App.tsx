import { createSignal } from 'solid-js';

function App() {
    const [count, setCount] = createSignal(0);

    return (
        <div style={{ padding: "20px", textAlign: "center", color: "#2c4f7c" }}>
            <h1>💙 Urja Build Tool - Solid.js Test</h1>
            <p>Framework: <strong>Solid 1.8.x</strong></p>
            <p>Status: ✅ Fine-grained Reactivity Active</p>
            <button
                style={{ padding: "10px 20px", fontSize: "1.2rem", cursor: "pointer" }}
                onClick={() => setCount(c => c + 1)}>
                Reactive Signal: {count()}
            </button>
        </div>
    );
}

export default App;
