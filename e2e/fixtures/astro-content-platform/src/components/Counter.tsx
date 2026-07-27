import { useState } from 'react';

interface Props { initialCount?: number; }

export default function Counter({ initialCount = 0 }: Props) {
  const [count, setCount] = useState(initialCount);
  return (
    <div class="counter" data-island="Counter">
      <button onClick={() => setCount(c => c - 1)}>−</button>
      <span>{count}</span>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
