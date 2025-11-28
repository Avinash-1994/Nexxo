import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import './styles/keyboard-nav.css'
import './styles/landing.css'
import * as serviceWorker from './lib/serviceWorker'
import db from './lib/db'
import { measureWebVitals, logPerformanceMetrics, reportBundleSize } from './lib/performance'

// Initialize IndexedDB
db.init()
    .then(() => {
        console.log('[IndexedDB] Database initialized')
    })
    .catch((error) => {
        console.error('[IndexedDB] Failed to initialize:', error)
    })

// Register service worker for offline support
serviceWorker.register()

// Performance monitoring (development only)
if (import.meta.env.DEV) {
    measureWebVitals(console.log)
    window.addEventListener('load', () => {
        setTimeout(() => {
            logPerformanceMetrics()
            reportBundleSize()
        }, 1000)
    })
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
