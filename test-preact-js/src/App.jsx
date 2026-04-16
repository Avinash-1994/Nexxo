import { useState } from 'preact/hooks';

export function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <nav className="navbar">
        <a href="/" className="navbar-brand">NUCLIE</a>
        <div className="navbar-links">
          <a href="#" className="nav-link">Features</a>
          <a href="#" className="nav-link">Docs</a>
          <button className="nav-btn">Get Started</button>
        </div>
      </nav>

      <main className="hero-section">
        <div className="badge">Preact vLatest · Nuclie v1.0.9</div>
        
        <h1 className="hero-title">
          The Nucleus for<br/>
          <span className="highlight">Stunning Preact Apps</span>
        </h1>
        
        <p className="hero-subtitle">
          Experience the next generation of build speed with Nuclie. 
          Instant HMR, native performance, and a developer experience that feels like magic.
        </p>

        <div className="action-buttons">
          <button className="btn-primary" onClick={() => setCount(c => c + 1)}>
            Interactions: {count}
          </button>
          <a href="https://nuclie.dev" target="_blank" rel="noopener noreferrer" className="btn-secondary">
            Read Documentation
          </a>
        </div>

        <div className="terminal-window">
          <div className="terminal-header">
            <div className="term-dot red"></div>
            <div className="term-dot yellow"></div>
            <div className="term-dot green"></div>
          </div>
          <div className="terminal-body">
            <span className="term-comment">// Initializing the nucleus...</span><br/>
            <span className="term-prompt">$</span><span className="term-cmd">npm install nuclie</span><br/>
            <span className="term-prompt">$</span><span class="term-cmd">npm run dev</span><br/><br/>
            <span className="term-success">✓ Core Ready in 3.15ms</span>
          </div>
        </div>
      </main>
    </>
  );
}