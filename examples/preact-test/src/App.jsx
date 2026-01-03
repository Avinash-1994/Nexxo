import { useState } from 'preact/hooks';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app" style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#673ab8" }}>⚛️ Urja Build Tool - Preact Test</h1>
      <p>Framework: <strong>Preact 10.x</strong></p>
      <p>Status: ✅ Virtual DOM Optimized</p>

      <div className="card" style={{ padding: "20px", background: "#f3e5f5", borderRadius: "8px" }}>
        <button
          style={{ padding: "8px 16px", background: "#673ab8", color: "white", border: "none", cursor: "pointer" }}
          onClick={() => setCount(count + 1)}>
          Fast Count: {count}
        </button>
        <p>Testing reactive state and pre-bundled hooks.</p>
      </div>

      <div className="features" style={{ marginTop: "20px" }}>
        <h2>✨ Features Verified:</h2>
        <ul>
          <li>✅ Pre-rendering support</li>
          <li>✅ Signals & Hooks</li>
          <li>✅ Seamless HMR</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
