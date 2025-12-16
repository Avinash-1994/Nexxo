import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter-card">
      <h3>Counter Component</h3>
      <p>Testing: useState, HMR, Event Handling</p>
      <div className="counter-display">
        <button onClick={() => setCount(count - 1)} className="btn btn-secondary">-</button>
        <span className="count">{count}</span>
        <button onClick={() => setCount(count + 1)} className="btn btn-primary">+</button>
      </div>
      <button onClick={() => setCount(0)} className="btn btn-outline">Reset</button>
    </div>
  );
}
