
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'; // Note: .js extension for ESM
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
