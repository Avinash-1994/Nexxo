import React from 'react';

interface HeaderBarProps {
  cartCount?: number;
}

export default function HeaderBar({ cartCount = 0 }: HeaderBarProps) {
  return (
    <header
      data-testid="header-bar"
      style={{
        background: '#0a0a0b',
        color: '#fff',
        padding: '0 32px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 0 rgba(255,255,255,.08)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>
          ⚡ Lunx Shop
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <a
          href="#"
          data-testid="nav-home"
          style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500, fontSize: 15 }}
        >
          Home
        </a>
        <a
          href="#"
          data-testid="nav-products"
          style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500, fontSize: 15 }}
        >
          Products
        </a>
        <a
          href="#"
          data-testid="nav-cart"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          Cart
          {cartCount > 0 && (
            <span
              data-testid="cart-badge"
              style={{
                background: '#eab308',
                color: '#000',
                borderRadius: 999,
                padding: '1px 8px',
                fontSize: 12,
                fontWeight: 700,
                minWidth: 20,
                textAlign: 'center',
              }}
            >
              {cartCount}
            </span>
          )}
        </a>
      </nav>
    </header>
  );
}
