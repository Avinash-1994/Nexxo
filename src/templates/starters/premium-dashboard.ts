/**
 * Premium React Dashboard Template
 * Ultra-modern design with glassmorphism, gradients, and animations
 */

import { TemplateConfig } from '../manager.js';

export const premiumDashboardTemplate: TemplateConfig = {
  id: 'premium-dashboard',
  name: 'Premium React Dashboard',
  description: 'Stunning modern dashboard with glassmorphism, gradients, and animations',
  framework: 'react',
  type: 'spa',
  dependencies: {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "framer-motion": "^11.0.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.300.0"
  },
  devDependencies: {
    "@types/react": "^19.2.8",
    "@types/react-dom": "^19.2.3",
    "typescript": "^5.4.2",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  },
  files: {
    'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`,

    'src/App.tsx': `import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Rocket, Code2, Package, Layers } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import './App.css';

const performanceData = [
  { value: 120 }, { value: 95 }, { value: 85 }, 
  { value: 75 }, { value: 69 }, { value: 69 }
];

const frameworks = ['React', 'Vue', 'Svelte', 'Angular', 'Solid', 'Preact', 'Qwik', 'Lit', 'Astro', 'Vanilla'];

function App() {
  const [currentFramework, setCurrentFramework] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFramework((prev) => (prev + 1) % frameworks.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      {/* Animated Background */}
      <div className="background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Main Content - Single Viewport */}
      <div className="viewport-container">
        {/* Header */}
        <motion.div 
          className="header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="logo">⚡ Lunx Build Tool</h1>
          <div className="stats-bar">
            <div className="stat-pill">
              <Zap size={16} />
              <span>Production Ready</span>
            </div>
            <div className="stat-pill success">
              <Activity size={16} />
              <span>11/11 Tests Passed</span>
            </div>
          </div>
        </motion.div>

        {/* Main Grid - Fits in viewport */}
        <div className="main-grid">
          {/* Left: Performance Metrics */}
          <motion.div 
            className="glass-card feature-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-header">
              <Rocket className="icon" />
              <h3>Lightning Fast</h3>
            </div>
            <div className="metric-display">
              <div className="metric-value">69ms</div>
              <div className="metric-label">Cold Start Time</div>
            </div>
            <div className="metric-display">
              <div className="metric-value">10-60ms</div>
              <div className="metric-label">HMR Update Speed</div>
            </div>
            <div className="feature-badge">
              <Zap size={16} />
              <span>3-10x Faster with Rust</span>
            </div>
          </motion.div>

          {/* Right: Build Performance Chart */}
          <motion.div 
            className="glass-card chart-card"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card-header">
              <Activity className="icon" />
              <h3>Build Performance</h3>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#00d4ff" 
                    strokeWidth={3}
                    dot={{ fill: '#b537f2', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="chart-label">Cold Start Optimization (ms)</div>
            </div>
          </motion.div>

          {/* Bottom Left: Framework Support */}
          <motion.div 
            className="glass-card feature-card"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="card-header">
              <Code2 className="icon" />
              <h3>Universal Framework Support</h3>
            </div>
            <div className="framework-showcase">
              <motion.div 
                className="framework-name"
                key={currentFramework}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {frameworks[currentFramework]}
              </motion.div>
              <div className="framework-count">10+ Frameworks</div>
            </div>
            <div className="feature-list">
              <div className="feature-item">✓ Auto-detection</div>
              <div className="feature-item">✓ Zero config</div>
              <div className="feature-item">✓ HMR enabled</div>
            </div>
          </motion.div>

          {/* Bottom Right: Key Features */}
          <motion.div 
            className="glass-card feature-card"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card-header">
              <Package className="icon" />
              <h3>Production Features</h3>
            </div>
            <div className="features-grid">
              <div className="feature-box">
                <Layers size={24} className="feature-icon" />
                <span>Module Federation</span>
              </div>
              <div className="feature-box">
                <Zap size={24} className="feature-icon" />
                <span>Tree Shaking</span>
              </div>
              <div className="feature-box">
                <Code2 size={24} className="feature-icon" />
                <span>TypeScript</span>
              </div>
              <div className="feature-box">
                <Rocket size={24} className="feature-icon" />
                <span>SSR Ready</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div 
          className="footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>Edit <code>src/App.tsx</code> to see HMR in action • Built with ⚡ Lunx</p>
        </motion.div>
      </div>
    </div>
  );
}

export default App;`,

    'src/App.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden; /* NO SCROLL */
}

.app {
  width: 100vw;
  height: 100vh;
  position: relative;
  color: white;
  overflow: hidden; /* NO SCROLL */
}

/* Animated Background */
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a0b2e 0%, #16213e 100%);
  z-index: -1;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #b537f2 0%, transparent 70%);
  top: -100px;
  left: -100px;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #00d4ff 0%, transparent 70%);
  bottom: -150px;
  right: -150px;
  animation-delay: -10s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #ff2e63 0%, transparent 70%);
  top: 50%;
  left: 50%;
  animation-delay: -5s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(50px, -50px) scale(1.1); }
  66% { transform: translate(-50px, 50px) scale(0.9); }
}

/* Viewport Container - NO SCROLL */
.viewport-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  gap: 1.5rem;
  overflow: hidden; /* NO SCROLL */
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.logo {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00d4ff 0%, #b537f2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-bar {
  display: flex;
  gap: 1rem;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
}

/* Main Grid - Fits in remaining viewport */
.main-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto;
  gap: 1.5rem;
  min-height: 0; /* Important for grid overflow */
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #00d4ff, #b537f2, #ff2e63);
  opacity: 0.8;
}

/* Hero Card (Counter) */
.hero-card {
  grid-row: 1 / 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.counter-display {
  display: flex;
  gap: 1rem;
}

.digit {
  width: 70px;
  height: 90px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(181, 55, 242, 0.5);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #00d4ff;
  box-shadow: 0 0 30px rgba(181, 55, 242, 0.3),
              inset 0 0 20px rgba(0, 212, 255, 0.1);
}

.gradient-button {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #b537f2 0%, #00d4ff 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(181, 55, 242, 0.4);
  transition: all 0.3s ease;
}

.hint-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* Chart Card */
.chart-card {
  grid-row: 1 / 2;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.card-header .icon {
  color: #00d4ff;
  width: 20px;
  height: 20px;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

/* Stats Card */
.stats-card {
  grid-column: 1 / 3;
  grid-row: 2 / 3;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding: 1.5rem;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #00d4ff;
}

.stat-value.badge {
  background: linear-gradient(135deg, #ff2e63, #b537f2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 1.5rem;
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Feature Card Styles */
.feature-card {
  gap: 1rem;
}

.metric-display {
  text-align: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00d4ff 0%, #b537f2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.metric-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.5rem;
}

.feature-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, rgba(181, 55, 242, 0.2), rgba(0, 212, 255, 0.2));
  border-radius: 12px;
  border: 1px solid rgba(181, 55, 242, 0.3);
  font-size: 0.9rem;
  color: #00d4ff;
}

/* Chart Wrapper */
.chart-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chart-label {
  text-align: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.5rem;
}

/* Framework Showcase */
.framework-showcase {
  text-align: center;
  padding: 2rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.framework-name {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00d4ff 0%, #b537f2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.framework-count {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-item {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  flex: 1;
}

.feature-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.feature-box:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.3);
  transform: translateY(-2px);
}

.feature-icon {
  color: #00d4ff;
}

.feature-box span {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.stat-pill.success {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

/* Footer */
.footer {
  text-align: center;
  flex-shrink: 0;
}

.footer p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin: 0;
}

.footer code {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #00d4ff;
}

/* Responsive - Still no scroll */
@media (max-width: 768px) {
  .viewport-container {
    padding: 1rem;
    gap: 1rem;
  }
  
  .logo {
    font-size: 1.5rem;
  }
  
  .stats-bar {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .main-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  
  .stats-card {
    grid-column: 1 / 2;
    grid-row: 3 / 4;
    flex-direction: row;
    padding: 1rem;
  }
  
  .digit {
    width: 50px;
    height: 70px;
    font-size: 2rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
}`,

    'src/index.css': `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}`,

    'lunx.config.js': `module.exports = {
  entry: ['./src/main.tsx'],
  outDir: './dist',
  framework: 'react',
  
  build: {
    minify: true,
    sourcemap: 'external',
  },
  
  dev: {
    port: 3000,
    hmr: true,
    open: true,
  },
};`,

    'package.json': `{
  "name": "lunx-premium-dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "lunx dev",
    "build": "lunx build",
    "preview": "lunx preview"
  },
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "framer-motion": "^11.0.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@types/react": "^19.2.8",
    "@types/react-dom": "^19.2.3",
    "typescript": "^5.4.2"
  }
}`,

    'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}`,

    'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Premium Dashboard - Lunx</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  }
};
