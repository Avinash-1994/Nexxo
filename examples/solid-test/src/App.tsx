import { createSignal } from 'solid-js';

function App() {
    const [count, setCount] = createSignal(0);

    return (
        <div style={{ padding: "20px", "text-align": "center" }}>
            <h1>Solid.js Support Verified!</h1>
            <button onClick={() => setCount(c => c + 1)}>
                Clicks: {count()}
            </button>
        </div>
    );
}

export default App;
