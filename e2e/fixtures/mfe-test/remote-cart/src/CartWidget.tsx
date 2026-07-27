import React, { useState } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartWidgetProps {
  onCartChange?: (count: number) => void;
}

const INITIAL_ITEMS: CartItem[] = [
  { id: 1, name: 'Lunx Pro License',  price: 99,  quantity: 1 },
  { id: 2, name: 'React Masterclass',  price: 49,  quantity: 1 },
  { id: 3, name: 'Sticker Pack',       price: 5,   quantity: 2 },
];

export default function CartWidget({ onCartChange }: CartWidgetProps) {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const removeItem = (id: number) => {
    const next = items.filter(i => i.id !== id);
    setItems(next);
    const newCount = next.reduce((s, i) => s + i.quantity, 0);
    onCartChange?.(newCount);
  };

  return (
    <div
      data-testid="cart-widget"
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: 24,
        maxWidth: 440,
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,.08)',
      }}
    >
      <h2 style={{ margin: '0 0 16px', color: '#0f172a' }}>Your Cart</h2>

      {items.length === 0 && (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>Cart is empty</p>
      )}

      {items.map(item => (
        <div
          key={item.id}
          data-testid="cart-item"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div>
            <span style={{ fontWeight: 500 }}>{item.name}</span>
            <span style={{ color: '#94a3b8', marginLeft: 8 }}>×{item.quantity}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>${item.price * item.quantity}</span>
            <button
              data-testid={`remove-${item.id}`}
              onClick={() => removeItem(item.id)}
              style={{
                padding: '4px 10px',
                background: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 16,
          fontWeight: 700,
          fontSize: 18,
        }}
      >
        <span>Total</span>
        <span data-testid="cart-total">${total}</span>
      </div>

      <button
        data-testid="checkout-btn"
        style={{
          marginTop: 20,
          width: '100%',
          padding: 12,
          background: '#22c55e',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Checkout
      </button>
    </div>
  );
}
