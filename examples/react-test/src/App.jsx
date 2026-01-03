import { useState } from 'react';
import './App.css';

function App() {
    const [count, setCount] = useState(0);

    return (
        <div className="App">
            <h1 style={{ color: '#61dafb' }}>⚛️ Urja Build Tool - React Test</h1>
            <p>Framework: <strong>React 18.2.0</strong></p>
            <p>Status: 🚀 Dev Mode Stable</p>
            <p>Transformer: ✅ Universal (Babel-free)</p>

            <div className="card">
                <button onClick={() => setCount(count + 1)}>
                    Count: {count}
                </button>
                <p>Click the button to test reactivity! (Hot)</p>
            </div>

            <div className="features">
                <h2>✨ Features Working:</h2>
                <ul>
                    <li>✅ React 18 Automatic JSX</li>
                    <li>✅ useState Hook</li>
                    <li>✅ Fast Refresh (HMR)</li>
                    <li>✅ CSS Imports</li>
                    <li>✅ Universal Transformer</li>
                </ul>
            </div>
        </div>
    );
}

export default App;
