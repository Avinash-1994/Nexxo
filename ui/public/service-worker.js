const CACHE_NAME = 'nextgen-build-tool-v1'
const STATIC_CACHE = 'nextgen-static-v1'
const DOCS_CACHE = 'nextgen-docs-v1'
const RUNTIME_CACHE = 'nextgen-runtime-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico'
]

// Documentation pages to pre-cache
const DOCS_PAGES = [
    '/docs/getting-started/introduction',
    '/docs/getting-started/installation',
    '/docs/getting-started/quick-start',
    '/docs/guide/visual-builder',
    '/docs/guide/node-types',
    '/docs/guide/configuration',
    '/docs/api/cli-reference',
    '/docs/tutorials/first-pipeline'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...')

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(async (cache) => {
                console.log('[ServiceWorker] Caching static assets')
                // Cache files individually to handle missing files gracefully
                const cachePromises = STATIC_ASSETS.map(async (url) => {
                    try {
                        const response = await fetch(url)
                        if (response.ok) {
                            await cache.put(url, response)
                            console.log('[ServiceWorker] Cached:', url)
                        } else {
                            console.warn('[ServiceWorker] Failed to cache (not found):', url)
                        }
                    } catch (error) {
                        console.warn('[ServiceWorker] Failed to cache:', url, error)
                    }
                })
                await Promise.all(cachePromises)
            })
            .then(() => {
                console.log('[ServiceWorker] Skip waiting')
                return self.skipWaiting()
            })
            .catch((error) => {
                console.error('[ServiceWorker] Install failed:', error)
                // Still skip waiting even if caching fails
                return self.skipWaiting()
            })
    )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...')

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE &&
                            cacheName !== DOCS_CACHE &&
                            cacheName !== RUNTIME_CACHE) {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName)
                            return caches.delete(cacheName)
                        }
                    })
                )
            })
            .then(() => {
                console.log('[ServiceWorker] Claiming clients')
                return self.clients.claim()
            })
    )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return
    }

    // Skip chrome extensions and external requests
    if (!url.origin.includes(self.location.origin)) {
        return
    }

    // Documentation pages - Network first, fallback to cache
    if (url.pathname.startsWith('/docs/')) {
        event.respondWith(
            networkFirst(request, DOCS_CACHE)
        )
        return
    }

    // Static assets - Cache first, fallback to network
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf)$/)) {
        event.respondWith(
            cacheFirst(request, STATIC_CACHE)
        )
        return
    }

    // HTML pages - Network first, fallback to cache
    if (request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            networkFirst(request, RUNTIME_CACHE)
        )
        return
    }

    // API calls - Network only (don't cache API responses)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
        )
        return
    }

    // Default - try network first
    event.respondWith(
        networkFirst(request, RUNTIME_CACHE)
    )
})

// Caching strategies

// Cache first, fallback to network
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName)
    const cached = await cache.match(request)

    if (cached) {
        console.log('[ServiceWorker] Cache hit:', request.url)
        return cached
    }

    console.log('[ServiceWorker] Cache miss, fetching:', request.url)
    try {
        const response = await fetch(request)
        if (response.ok) {
            cache.put(request, response.clone())
        }
        return response
    } catch (error) {
        console.error('[ServiceWorker] Fetch failed:', error)
        return new Response('Offline - Resource not available', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
        })
    }
}

// Network first, fallback to cache
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName)

    try {
        const response = await fetch(request)
        if (response.ok) {
            console.log('[ServiceWorker] Network success, caching:', request.url)
            cache.put(request, response.clone())
        }
        return response
    } catch (error) {
        console.log('[ServiceWorker] Network failed, trying cache:', request.url)
        const cached = await cache.match(request)

        if (cached) {
            return cached
        }

        // Return offline page for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
            const offlinePage = await cache.match('/offline.html')
            if (offlinePage) {
                return offlinePage
            }
        }

        return new Response('Offline - Resource not available', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
        })
    }
}

// Message event - handle commands from clients
self.addEventListener('message', (event) => {
    console.log('[ServiceWorker] Message received:', event.data)

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }

    if (event.data.type === 'CACHE_DOCS') {
        event.waitUntil(
            caches.open(DOCS_CACHE)
                .then((cache) => {
                    console.log('[ServiceWorker] Pre-caching documentation')
                    return cache.addAll(DOCS_PAGES)
                })
                .then(() => {
                    event.ports[0].postMessage({ success: true })
                })
                .catch((error) => {
                    console.error('[ServiceWorker] Failed to cache docs:', error)
                    event.ports[0].postMessage({ success: false, error: error.message })
                })
        )
    }

    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys()
                .then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => caches.delete(cacheName))
                    )
                })
                .then(() => {
                    event.ports[0].postMessage({ success: true })
                })
        )
    }
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Background sync:', event.tag)

    if (event.tag === 'sync-pipelines') {
        event.waitUntil(syncPipelines())
    }
})

async function syncPipelines() {
    // This would sync local IndexedDB changes to server when back online
    console.log('[ServiceWorker] Syncing pipelines...')
    // Implementation depends on backend API
}
