# Module Federation Guide

Build micro-frontends with Lunx's native Module Federation support.

## What is Module Federation?

Module Federation allows you to:
- Share code between independent applications at runtime
- Build micro-frontend architectures
- Load remote modules dynamically
- Share dependencies to reduce bundle size

## Quick Start

### Host Application

```javascript
// lunx.config.js
module.exports = {
  entry: ['./src/index.tsx'],
  
  federation: {
    name: 'host_app',
    filename: 'remoteEntry.js',
    
    // Consume remote modules
    remotes: {
      'cart': 'http://localhost:3001/remoteEntry.js',
      'checkout': 'http://localhost:3002/remoteEntry.js',
    },
    
    // Share dependencies
    shared: {
      'react': { singleton: true },
      'react-dom': { singleton: true },
    },
  },
};
```

```tsx
// src/App.tsx
import React, { lazy, Suspense } from 'react';

// Dynamically import remote module
const RemoteCart = lazy(() => import('cart/CartWidget'));
const RemoteCheckout = lazy(() => import('checkout/CheckoutFlow'));

function App() {
  return (
    <div>
      <h1>Host Application</h1>
      
      <Suspense fallback={<div>Loading Cart...</div>}>
        <RemoteCart />
      </Suspense>
      
      <Suspense fallback={<div>Loading Checkout...</div>}>
        <RemoteCheckout />
      </Suspense>
    </div>
  );
}

export default App;
```

### Remote Application (Cart)

```javascript
// lunx.config.js
module.exports = {
  entry: ['./src/index.tsx'],
  
  dev: {
    port: 3001,
  },
  
  federation: {
    name: 'cart',
    filename: 'remoteEntry.js',
    
    // Expose modules
    exposes: {
      './CartWidget': './src/components/CartWidget.tsx',
      './CartAPI': './src/api/cart.ts',
    },
    
    // Share dependencies
    shared: {
      'react': { singleton: true },
      'react-dom': { singleton: true },
    },
  },
};
```

```tsx
// src/components/CartWidget.tsx
import React from 'react';

export default function CartWidget() {
  return (
    <div className="cart-widget">
      <h2>Shopping Cart</h2>
      <p>Items: 3</p>
    </div>
  );
}
```

## Configuration Options

### Basic Setup

```javascript
federation: {
  // Unique application name
  name: 'my_app',
  
  // Remote entry filename
  filename: 'remoteEntry.js',
}
```

### Exposing Modules

```javascript
federation: {
  name: 'my_app',
  
  exposes: {
    // Key: module name (how others import it)
    // Value: local file path
    './Button': './src/components/Button.tsx',
    './Header': './src/components/Header.tsx',
    './utils': './src/utils/index.ts',
  },
}
```

### Consuming Remote Modules

```javascript
federation: {
  name: 'host',
  
  remotes: {
    // Key: remote name (used in imports)
    // Value: URL to remoteEntry.js
    'app1': 'http://localhost:3001/remoteEntry.js',
    'app2': 'https://cdn.example.com/app2/remoteEntry.js',
    
    // Dynamic URLs
    'app3': process.env.APP3_URL + '/remoteEntry.js',
  },
}
```

### Sharing Dependencies

```javascript
federation: {
  shared: {
    // Simple sharing
    'react': { singleton: true },
    
    // With version requirements
    'react-dom': {
      singleton: true,
      requiredVersion: '^18.0.0',
    },
    
    // With fallback
    'lodash': {
      singleton: false,
      requiredVersion: '^4.17.0',
      eager: false, // Load on demand
    },
  },
}
```

## Advanced Features

### Prefetching Remotes

```javascript
federation: {
  name: 'host',
  remotes: {
    'cart': 'http://localhost:3001/remoteEntry.js',
    'checkout': 'http://localhost:3002/remoteEntry.js',
  },
  
  // Prefetch these remotes on app load
  prefetch: ['cart'],
}
```

### Fallback URLs

```javascript
federation: {
  name: 'host',
  remotes: {
    'cart': 'http://localhost:3001/remoteEntry.js',
  },
  
  // Fallback if remote fails to load
  fallback: 'https://cdn.example.com/fallback-bundle.js',
}
```

### Health Checks

```javascript
federation: {
  name: 'my_app',
  
  // Endpoint for health monitoring
  healthCheck: '/health',
}
```

## Runtime API

### Dynamic Remote Loading

```typescript
// Load remote at runtime
import { loadRemote } from '@lunx/runtime/federation';

async function loadCartModule() {
  try {
    const CartModule = await loadRemote({
      url: 'http://localhost:3001/remoteEntry.js',
      scope: 'cart',
      module: './CartWidget',
    });
    
    return CartModule.default;
  } catch (error) {
    console.error('Failed to load remote:', error);
    return null;
  }
}
```

### Checking Remote Health

```typescript
import { checkRemoteHealth } from '@lunx/runtime/federation';

async function checkCart() {
  const isHealthy = await checkRemoteHealth('http://localhost:3001/health');
  
  if (!isHealthy) {
    console.warn('Cart service is down');
  }
}
```

## Best Practices

### 1. Version Management

```javascript
// Use semantic versioning
shared: {
  'react': {
    singleton: true,
    requiredVersion: '^18.2.0', // Allow minor updates
  },
}
```

### 2. Error Boundaries

```tsx
import React, { Component, ReactNode } from 'react';

class RemoteErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Remote module failed to load</div>;
    }
    
    return this.props.children;
  }
}

// Usage
<RemoteErrorBoundary>
  <Suspense fallback={<Loading />}>
    <RemoteComponent />
  </Suspense>
</RemoteErrorBoundary>
```

### 3. Type Safety

```typescript
// shared-types/cart.d.ts
export interface CartWidgetProps {
  userId: string;
  onCheckout: () => void;
}

export interface CartAPI {
  addItem: (id: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  getTotal: () => Promise<number>;
}
```

```tsx
// Host app
import type { CartWidgetProps } from 'shared-types/cart';

const RemoteCart = lazy<React.FC<CartWidgetProps>>(
  () => import('cart/CartWidget')
);
```

### 4. Environment-Specific Remotes

```javascript
// lunx.config.js
const getRemoteUrl = (name) => {
  const env = process.env.NODE_ENV;
  
  const urls = {
    development: `http://localhost:${name === 'cart' ? 3001 : 3002}`,
    staging: `https://staging.example.com/${name}`,
    production: `https://cdn.example.com/${name}`,
  };
  
  return `${urls[env]}/remoteEntry.js`;
};

module.exports = {
  federation: {
    name: 'host',
    remotes: {
      'cart': getRemoteUrl('cart'),
      'checkout': getRemoteUrl('checkout'),
    },
  },
};
```

## Deployment Strategies

### 1. Independent Deployment

Each micro-frontend deploys independently:

```bash
# Deploy cart service
cd apps/cart
lunx build
# Upload dist/ to CDN

# Deploy checkout service
cd apps/checkout
lunx build
# Upload dist/ to CDN

# Deploy host
cd apps/host
lunx build
# Upload dist/ to CDN
```

### 2. Versioned Releases

```javascript
// Use versioned URLs
remotes: {
  'cart': 'https://cdn.example.com/cart/v1.2.3/remoteEntry.js',
}
```

### 3. Canary Deployments

```javascript
// Route percentage of traffic to new version
const useCanary = Math.random() < 0.1; // 10% traffic

remotes: {
  'cart': useCanary
    ? 'https://cdn.example.com/cart/canary/remoteEntry.js'
    : 'https://cdn.example.com/cart/stable/remoteEntry.js',
}
```

## Troubleshooting

### Remote Not Loading

```typescript
// Add detailed logging
import { loadRemote } from '@lunx/runtime/federation';

try {
  const module = await loadRemote({
    url: 'http://localhost:3001/remoteEntry.js',
    scope: 'cart',
    module: './CartWidget',
  });
} catch (error) {
  console.error('Remote load failed:', {
    error,
    url: 'http://localhost:3001/remoteEntry.js',
    scope: 'cart',
    module: './CartWidget',
  });
}
```

### Version Conflicts

```javascript
// Check shared module versions
shared: {
  'react': {
    singleton: true,
    requiredVersion: '^18.0.0',
    // Strict version matching
    strictVersion: true,
  },
}
```

### CORS Issues

```javascript
// Dev server CORS config
dev: {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
}
```

## Examples

### E-commerce Platform

```
apps/
├── host/           # Main shell
├── cart/           # Shopping cart
├── checkout/       # Checkout flow
├── products/       # Product catalog
└── user/           # User profile
```

### Dashboard Application

```
apps/
├── shell/          # Navigation shell
├── analytics/      # Analytics widgets
├── reports/        # Report generation
└── settings/       # Settings panel
```

## Next Steps

- [Configuration Guide](./configuration.md)
- [Plugin Development](./plugins.md)
- [Deployment Guide](./deployment.md)
- [API Reference](../api/federation.md)
