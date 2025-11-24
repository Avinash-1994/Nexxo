// IndexedDB wrapper for offline storage

const DB_NAME = 'nextgen-build-tool'
const DB_VERSION = 1

// Object stores
const STORES = {
    PIPELINES: 'pipelines',
    PREFERENCES: 'preferences',
    CACHE: 'cache'
}

class NextGenDB {
    constructor() {
        this.db = null
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION)

            request.onerror = () => {
                console.error('[IndexedDB] Error opening database:', request.error)
                reject(request.error)
            }

            request.onsuccess = () => {
                this.db = request.result
                console.log('[IndexedDB] Database opened successfully')
                resolve(this.db)
            }

            request.onupgradeneeded = (event) => {
                const db = event.target.result
                console.log('[IndexedDB] Upgrading database schema')

                // Pipelines store
                if (!db.objectStoreNames.contains(STORES.PIPELINES)) {
                    const pipelineStore = db.createObjectStore(STORES.PIPELINES, {
                        keyPath: 'id',
                        autoIncrement: true
                    })
                    pipelineStore.createIndex('name', 'name', { unique: false })
                    pipelineStore.createIndex('created', 'created', { unique: false })
                    pipelineStore.createIndex('modified', 'modified', { unique: false })
                }

                // Preferences store
                if (!db.objectStoreNames.contains(STORES.PREFERENCES)) {
                    db.createObjectStore(STORES.PREFERENCES, { keyPath: 'key' })
                }

                // Cache store
                if (!db.objectStoreNames.contains(STORES.CACHE)) {
                    const cacheStore = db.createObjectStore(STORES.CACHE, { keyPath: 'url' })
                    cacheStore.createIndex('timestamp', 'timestamp', { unique: false })
                }
            }
        })
    }

    // Pipeline operations

    async savePipeline(pipeline) {
        const transaction = this.db.transaction([STORES.PIPELINES], 'readwrite')
        const store = transaction.objectStore(STORES.PIPELINES)

        const data = {
            ...pipeline,
            modified: new Date().toISOString()
        }

        if (!data.created) {
            data.created = data.modified
        }

        return new Promise((resolve, reject) => {
            const request = data.id ? store.put(data) : store.add(data)

            request.onsuccess = () => {
                console.log('[IndexedDB] Pipeline saved:', request.result)
                resolve(request.result)
            }

            request.onerror = () => {
                console.error('[IndexedDB] Error saving pipeline:', request.error)
                reject(request.error)
            }
        })
    }

    async loadPipeline(id) {
        const transaction = this.db.transaction([STORES.PIPELINES], 'readonly')
        const store = transaction.objectStore(STORES.PIPELINES)

        return new Promise((resolve, reject) => {
            const request = store.get(id)

            request.onsuccess = () => {
                resolve(request.result)
            }

            request.onerror = () => {
                reject(request.error)
            }
        })
    }

    async listPipelines() {
        const transaction = this.db.transaction([STORES.PIPELINES], 'readonly')
        const store = transaction.objectStore(STORES.PIPELINES)

        return new Promise((resolve, reject) => {
            const request = store.getAll()

            request.onsuccess = () => {
                const pipelines = request.result.sort((a, b) => {
                    return new Date(b.modified) - new Date(a.modified)
                })
                resolve(pipelines)
            }

            request.onerror = () => {
                reject(request.error)
            }
        })
    }

    async deletePipeline(id) {
        const transaction = this.db.transaction([STORES.PIPELINES], 'readwrite')
        const store = transaction.objectStore(STORES.PIPELINES)

        return new Promise((resolve, reject) => {
            const request = store.delete(id)

            request.onsuccess = () => {
                console.log('[IndexedDB] Pipeline deleted:', id)
                resolve()
            }

            request.onerror = () => {
                reject(request.error)
            }
        })
    }

    // Preference operations

    async savePreference(key, value) {
        const transaction = this.db.transaction([STORES.PREFERENCES], 'readwrite')
        const store = transaction.objectStore(STORES.PREFERENCES)

        return new Promise((resolve, reject) => {
            const request = store.put({ key, value, timestamp: new Date().toISOString() })

            request.onsuccess = () => {
                resolve()
            }

            request.onerror = () => {
                reject(request.error)
            }
        })
    }

    async getPreference(key) {
        const transaction = this.db.transaction([STORES.PREFERENCES], 'readonly')
        const store = transaction.objectStore(STORES.PREFERENCES)

        return new Promise((resolve, reject) => {
            const request = store.get(key)

            request.onsuccess = () => {
                resolve(request.result?.value)
            }

            request.onerror = () => {
                reject(request.error)
            }
        })
    }

    async getAllPreferences() {
        const transaction = this.db.transaction([STORES.PREFERENCES], 'readonly')
        const store = transaction.objectStore(STORES.PREFERENCES)

        return new Promise((resolve, reject) => {
            const request = store.getAll()

            request.onsuccess = () => {
                const prefs = {}
                request.result.forEach(item => {
                    prefs[item.key] = item.value
                })
                resolve(prefs)
            }

            request.onerror = () => {
                reject(request.error)
            }
        })
    }

    // Cache operations

    async cacheData(url, data) {
        const transaction = this.db.transaction([STORES.CACHE], 'readwrite')
        const store = transaction.objectStore(STORES.CACHE)

        return new Promise((resolve, reject) => {
            const request = store.put({
                url,
                data,
                timestamp: new Date().toISOString()
            })

            request.onsuccess = () => {
                resolve()
            }

            request.onerror = () => {
                reject(request.error)
            }
        })
    }

    async getCachedData(url) {
        const transaction = this.db.transaction([STORES.CACHE], 'readonly')
        const store = transaction.objectStore(STORES.CACHE)

        return new Promise((resolve, reject) => {
            const request = store.get(url)

            request.onsuccess = () => {
                resolve(request.result?.data)
            }

            request.onerror = () => {
                reject(request.error)
            }
        })
    }

    async clearOldCache(olderThan = 7 * 24 * 60 * 60 * 1000) {
        // Clear cache older than 7 days by default
        const transaction = this.db.transaction([STORES.CACHE], 'readwrite')
        const store = transaction.objectStore(STORES.CACHE)
        const index = store.index('timestamp')

        const cutoffDate = new Date(Date.now() - olderThan).toISOString()

        return new Promise((resolve, reject) => {
            const request = index.openCursor()
            let deleteCount = 0

            request.onsuccess = (event) => {
                const cursor = event.target.result
                if (cursor) {
                    if (cursor.value.timestamp < cutoffDate) {
                        cursor.delete()
                        deleteCount++
                    }
                    cursor.continue()
                } else {
                    console.log('[IndexedDB] Cleared', deleteCount, 'old cache entries')
                    resolve(deleteCount)
                }
            }

            request.onerror = () => {
                reject(request.error)
            }
        })
    }

    // Utility methods

    async exportData() {
        const pipelines = await this.listPipelines()
        const preferences = await this.getAllPreferences()

        return {
            version: DB_VERSION,
            exported: new Date().toISOString(),
            pipelines,
            preferences
        }
    }

    async importData(data) {
        if (data.pipelines) {
            for (const pipeline of data.pipelines) {
                await this.savePipeline(pipeline)
            }
        }

        if (data.preferences) {
            for (const [key, value] of Object.entries(data.preferences)) {
                await this.savePreference(key, value)
            }
        }
    }

    async clearAll() {
        const storeNames = [STORES.PIPELINES, STORES.PREFERENCES, STORES.CACHE]
        const transaction = this.db.transaction(storeNames, 'readwrite')

        return Promise.all(
            storeNames.map(storeName => {
                return new Promise((resolve, reject) => {
                    const request = transaction.objectStore(storeName).clear()
                    request.onsuccess = () => resolve()
                    request.onerror = () => reject(request.error)
                })
            })
        )
    }
}

// Create singleton instance
const db = new NextGenDB()

export default db
