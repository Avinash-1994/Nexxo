import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    builds: 0,
    hmrUpdates: 0,
    cacheHits: 0,
  });

  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats({
        builds: 42,
        hmrUpdates: 156,
        cacheHits: 89,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="page">
      <h2>Dashboard (Lazy Loaded)</h2>
      <p>This component was lazy-loaded to test code splitting!</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.builds}</h3>
          <p>Total Builds</p>
        </div>
        <div className="stat-card">
          <h3>{stats.hmrUpdates}</h3>
          <p>HMR Updates</p>
        </div>
        <div className="stat-card">
          <h3>{stats.cacheHits}</h3>
          <p>Cache Hits</p>
        </div>
      </div>

      <div className="dashboard-info">
        <h3>Lazy Loading Test</h3>
        <p>✅ Component loaded successfully</p>
        <p>✅ Code splitting working</p>
        <p>✅ Dynamic import working</p>
      </div>
    </div>
  );
}
