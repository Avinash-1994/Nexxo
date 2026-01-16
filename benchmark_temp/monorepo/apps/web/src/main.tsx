
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@monorepo-app/ui';

export default function App() {
  return (
    <div>
      <h1>Nexxo Monorepo</h1>
      <Button>Shared UI Button</Button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
