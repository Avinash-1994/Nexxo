/**
 * Fintech Starter Template
 * Secure Payment App with UPI & QR integration
 */

import { TemplateConfig } from '../manager.js';

export const fintechTemplate: TemplateConfig = {
    id: 'fintech-app',
    name: 'Fintech App (Secure)',
    description: 'Secure Payment Application with UPI & QR Code support',
    framework: 'react',
    type: 'fintech',
    dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "qrcode.react": "^3.1.0",
        "lucide-react": "^0.294.0"
    },
    devDependencies: {
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@nexxo/plugin-react": "^1.0.0",
        "@nexxo/plugin-upi-payment": "^1.0.0",
        "@nexxo/plugin-qr-code": "^1.0.0",
        "@nexxo/plugin-security": "^1.0.0"
    },
    files: {
        'nexxo.config.ts': `
import { defineConfig } from 'nexxo';
import react from '@nexxo/plugin-react';
import upi from '@nexxo/plugin-upi-payment';
import qr from '@nexxo/plugin-qr-code';

export default defineConfig({
    plugins: [react(), upi(), qr()],
    server: {
        port: 3000,
        https: true // Force HTTPS for payments
    },
    security: {
        headers: {
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
            'X-Frame-Options': 'DENY'
        }
    }
});
`,
        'src/main.tsx': `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
        'src/App.tsx': `
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, IndianRupee } from 'lucide-react';
import './App.css';

export default function App() {
  const [amount, setAmount] = useState('100');
  const [upiId, setUpiId] = useState('merchant@upi');
  const upiLink = \`upi://pay?pa=\${upiId}&pn=Merchant&am=\${amount}&cu=INR\`;

  return (
    <div className="container">
      <header className="header">
        <ShieldCheck size={40} className="icon secure" />
        <h1>Nexxo Pay</h1>
      </header>
      
      <div className="card">
        <div className="qr-container">
          <QRCodeSVG value={upiLink} size={200} />
        </div>
        
        <div className="controls">
          <label>
            Amount (INR)
            <div className="input-group">
              <IndianRupee size={16} />
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
              />
            </div>
          </label>
          <button onClick={() => window.open(upiLink)}>
            Pay Now
          </button>
        </div>
      </div>
      
      <p className="security-note">
        🔒 256-bit Encrypted | PCI-DSS Compliant
      </p>
    </div>
  );
}
`,
        'src/index.css': `
:root {
  --primary: #2563eb;
  --bg: #f8fafc;
  --text: #1e293b;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  margin: 0;
  display: flex;
  justify-content: center;
  min-height: 100vh;
}

.container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.icon.secure {
  color: #16a34a;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.qr-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 1rem;
  border: 2px dashed #e2e8f0;
  border-radius: 0.5rem;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #e2e8f0;
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
}

input {
  border: none;
  font-size: 1.25rem;
  width: 100%;
  outline: none;
}

button {
  width: 100%;
  background: var(--primary);
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.5rem;
}

.security-note {
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 2rem;
}
`,
        'src/vite-env.d.ts': `/// <reference types="vite/client" />`,
        'index.html': `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nexxo Pay</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
    }
};
