import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import * as serviceWorker from './lib/serviceWorker'
import db from './lib/db'

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
