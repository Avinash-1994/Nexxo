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
      
      <footer className="footer">
        <p>© 2025 Urja Build Tool - React Complete Test</p>
        <p>Testing: TypeScript, Routing, Lazy Loading, HMR, Production Build</p>
      </footer>
    </div>
  );
}

export default App;
