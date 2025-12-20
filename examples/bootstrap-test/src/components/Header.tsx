import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <h1>🚀 React Complete</h1>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        </nav>
      </div>
    </header>
  );
}
