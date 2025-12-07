import React, { useState } from 'react';
import './App.css';
import UrjaFeatureTests from './components/UrjaFeatureTests';
import HMRTest from './components/HMRTest';
import PerformanceTest from './components/PerformanceTest';

function App() {
    const [activeTab, setActiveTab] = useState('features');

    return (
        <div className="app">
            <header className="app-header">
                <h1>⚡ Urja Build Tool - Test Suite</h1>
                <p>Testing all Urja modules and facilities</p>
            </header>

            <nav className="tabs">
                <button
                    className={activeTab === 'features' ? 'active' : ''}
                    onClick={() => setActiveTab('features')}
                >
                    Feature Tests
                </button>
                <button
                    className={activeTab === 'hmr' ? 'active' : ''}
                    onClick={() => setActiveTab('hmr')}
                >
                    HMR Test
                </button>
                <button
                    className={activeTab === 'performance' ? 'active' : ''}
                    onClick={() => setActiveTab('performance')}
                >
                    Performance Test
                </button>
            </nav>

            <main className="content">
                {activeTab === 'features' && <UrjaFeatureTests />}
                {activeTab === 'hmr' && <HMRTest />}
                {activeTab === 'performance' && <PerformanceTest />}
            </main>

            <footer className="app-footer">
                <p>Powered by Urja v0.1.1 | Build Tool Test Suite</p>
            </footer>
        </div>
    );
}

export default App;
