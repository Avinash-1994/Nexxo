import React, { useState, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import styles from './Button.module.css'; // 1. CSS Modules test
import './index.css'; // Global CSS

// @ts-ignore
import logoSvg from './logo.svg?url'; // 2. Asset URL import test

// 3. Code Splitting (Lazy Load) test
const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  const [showLazy, setShowLazy] = useState(false);
  const [count, setCount] = useState(0);
  
  // 4. Environment Variables test
  const envMode = typeof process !== 'undefined' ? process.env.NODE_ENV : 'unknown';
  
  return (
    <div className="container">
      <div className="header">
        <img src={logoSvg} alt="Lunx Logo" className="logo" />
        <h1>Lunx <span className="highlight">Features Showcase</span></h1>
      </div>
      
      <div className="feature-grid">
        <div className="card">
          <h3>📦 Asset Bundling</h3>
          <p>The lightning logo above was imported directly as a URL asset from <code>logo.svg?url</code>.</p>
        </div>
        
        <div className="card">
          <h3>🎨 CSS Modules</h3>
          <p>This button is styled using an isolated <code>.module.css</code> file, completely hashing the class name.</p>
          <button className={styles.button} onClick={() => setCount(c => c + 1)}>
            Clicked {count} times
          </button>
        </div>
        
        <div className="card">
          <h3>🌳 Environment Variables</h3>
          <p>
            <code>process.env.NODE_ENV</code> is dynamically replaced at build time.<br/>
            Current value: <strong style={{ color: '#00ffcc' }}>{envMode}</strong>
          </p>
        </div>
      </div>
      
      <div className="lazy-section">
        <h3>🚀 Code Splitting</h3>
        <p>Click below to dynamically fetch a separate chunk (lazy loading).</p>
        <button className={styles.button} style={{ background: '#333', boxShadow: 'none' }} onClick={() => setShowLazy(true)}>
          Load Lazy Component
        </button>
        {showLazy && (
          <Suspense fallback={<p>Loading chunk...</p>}>
            <LazyComponent />
          </Suspense>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
