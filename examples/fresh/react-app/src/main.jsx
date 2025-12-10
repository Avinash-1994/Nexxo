import { createRoot } from 'react-dom/client';
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>React Fresh Test</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
