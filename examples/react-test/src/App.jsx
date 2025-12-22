import { useState } from 'react';
import './App.css';

function App() {
    const [count, setCount] = useState(0);

    return (
        <div className="App">
            <h1>🚀 Urja Build Tool - React Test (HMR Live)</h1>
            <p>Framework: React 18 (verified)</p>
            <p>Universal Transformer: ✅ Active</p>
            <p>Version-Agnostic: ✅ Enabled</p>

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
