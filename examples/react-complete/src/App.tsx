import { Routes, Route, Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import './styles/components.css';

// Lazy-loaded component to test code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <Suspense fallback={<div className="loading">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="footer" style={{ borderTop: '2px solid #61dafb', marginTop: '40px', paddingTop: '20px' }}>
        <p>© 2026 Urja Build Tool - Production Ready React Stack</p>
        <p>Status: ✅ TypeScript, Routing, Lazy Loading, HMR Verified</p>
      </footer>
    </div>
  );
}

export default App;
