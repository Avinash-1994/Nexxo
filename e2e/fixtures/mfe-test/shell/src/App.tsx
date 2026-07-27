import React, { useState, Suspense } from 'react';

// Lazy load remote components via Module Federation
const CartWidget  = React.lazy(() => import('remote_cart/CartWidget'));
const HeaderBar   = React.lazy(() => import('remote_header/HeaderBar'));

export default function App() {
  const [cartCount, setCartCount] = useState(3);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <Suspense fallback={<div style={{ background: '#0a0a0b', height: 56 }} />}>
        <HeaderBar cartCount={cartCount} />
      </Suspense>

      <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ color: '#0f172a', marginBottom: 24 }}>Lunx MFE Demo</h1>
        <p style={{ color: '#64748b', marginBottom: 32 }}>
          Both components below are loaded from separate remote servers via Module Federation.
        </p>

        <Suspense fallback={<div style={{ padding: 20, border: '1px dashed #ccc', borderRadius: 8 }}>Loading Cart...</div>}>
          <CartWidget onCartChange={setCartCount} />
        </Suspense>
      </div>
    </div>
  );
}