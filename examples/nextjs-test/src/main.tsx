import React from 'react';
import ReactDOM from 'react-dom/client';

// Import all pages to test routing
import Home from '../pages/index';
import About from '../pages/about';

const App = () => {
    return (
        <div>
            <h1>Next.js Test App - Routing Validation</h1>
            <nav>
                <a href="/">Home</a> | <a href="/about">About</a>
            </nav>
            <Home />
        </div>
    );
};

const root = document.getElementById('root');
if (root) {
    ReactDOM.createRoot(root).render(<App />);
}
