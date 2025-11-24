// Service Worker Registration
// This file registers the service worker for offline support

export function register() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const swUrl = `${import.meta.env.BASE_URL}service-worker.js`

            navigator.serviceWorker
                .register(swUrl)
                .then((registration) => {
                    console.log('[SW] Service Worker registered:', registration)

                    // Check for updates periodically
                    setInterval(() => {
                        registration.update()
                    }, 60 * 60 * 1000) // Check every hour

                    // Listen for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing

                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New service worker available
                                showUpdateNotification()
                            }
                        })
                    })
                })
                .catch((error) => {
                    console.error('[SW] Service Worker registration failed:', error)
                })
        })

        // Listen for controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[SW] Controller changed, reloading page')
            window.location.reload()
        })
    }
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister()
            })
            .catch((error) => {
                console.error('[SW] Error unregistering service worker:', error)
            })
    }
}

function showUpdateNotification() {
    // Show a notification to the user
    if (window.confirm('A new version is available! Click OK to update.')) {
        // Tell the service worker to skip waiting
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
    }
}

// Utility functions for client-side service worker control

export async function cacheDocs() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel()

        return new Promise((resolve, reject) => {
            messageChannel.port1.onmessage = (event) => {
                if (event.data.success) {
                    resolve()
                } else {
                    reject(new Error(event.data.error))
                }
            }

            navigator.serviceWorker.controller.postMessage(
                { type: 'CACHE_DOCS' },
                [messageChannel.port2]
            )
        })
    }
}

export async function clearCache() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel()

        return new Promise((resolve, reject) => {
            messageChannel.port1.onmessage = (event) => {
                if (event.data.success) {
                    resolve()
                } else {
                    reject(new Error(event.data.error))
                }
            }

            navigator.serviceWorker.controller.postMessage(
                { type: 'CLEAR_CACHE' },
                [messageChannel.port2]
            )
        })
    }
}

export function isOnline() {
    return navigator.onLine
}

export function onOnlineStatusChange(callback) {
    window.addEventListener('online', () => callback(true))
    window.addEventListener('offline', () => callback(false))

    return () => {
        window.removeEventListener('online', callback)
        window.removeEventListener('offline', callback)
    }
}
