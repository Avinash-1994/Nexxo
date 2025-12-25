import React, { Suspense, lazy, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { registerRemote, loadRemote } from '../../src/runtime/federation.js';

// Lazy load the remote button
const RemoteButton = lazy(async () => {
    // Register the remote
    await registerRemote('remote', 'http://localhost:3002');

    // Load the module
    const module = await loadRemote('remote', './Button');
    return { default: module.default };
});

function App() {
    const [count, setCount] = useState(0);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>🌐 Module Federation Host</h1>
            <p>This app loads a Button component from a remote application.</p>

            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <h2>Local Counter: {count}</h2>
                <button
                    onClick={() => setCount(count + 1)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Local Button (+1)
                </button>

                <Suspense fallback={<div>Loading remote button...</div>}>
                    <RemoteButton onClick={() => setCount(count + 10)}>
                        Remote Button (+10)
                    </RemoteButton>
                </Suspense>
            </div>

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <p>✅ The green button is from THIS app (host)</p>
                <p>✅ The blue button is loaded from REMOTE app (http://localhost:3002)</p>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
