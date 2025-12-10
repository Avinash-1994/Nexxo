import { render } from 'preact';
import { useState } from 'preact/hooks';

function App() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Preact Fresh Test</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

render(<App />, document.getElementById('root'));
