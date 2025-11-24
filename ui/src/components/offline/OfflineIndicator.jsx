import { useState, useEffect } from 'react'
import { WifiOff, Wifi, Download } from 'lucide-react'
import { isOnline, onOnlineStatusChange, cacheDocs } from '../../lib/serviceWorker'

export default function OfflineIndicator() {
    const [online, setOnline] = useState(isOnline())
    const [caching, setCaching] = useState(false)
    const [showNotification, setShowNotification] = useState(false)

    useEffect(() => {
        // Listen for online/offline events
        const cleanup = onOnlineStatusChange((status) => {
            setOnline(status)
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 3000)
        })

        return cleanup
    }, [])

    const handleCacheDocs = async () => {
        setCaching(true)
        try {
            await cacheDocs()
            alert('Documentation cached successfully! You can now access it offline.')
        } catch (error) {
            console.error('Failed to cache documentation:', error)
            alert('Failed to cache documentation. Please try again.')
        } finally {
            setCaching(false)
        }
    }

    return (
        <>
            {/* Status in header */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${online
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                {online ? (
                    <>
                        <Wifi className="h-4 w-4" />
                        <span className="font-medium">Online</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="h-4 w-4" />
                        <span className="font-medium">Offline</span>
                    </>
                )}
            </div>

            {/* Cache documentation button (when online) */}
            {online && (
                <button
                    onClick={handleCacheDocs}
                    disabled={caching}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                    title="Cache documentation for offline access"
                >
                    <Download className="h-4 w-4" />
                    {caching ? 'Caching...' : 'Cache Docs'}
                </button>
            )}

            {/* Toast notification */}
            {showNotification && (
                <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${online
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}>
                        {online ? (
                            <>
                                <Wifi className="h-5 w-5" />
                                <span className="font-medium">You're back online!</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="h-5 w-5" />
                                <span className="font-medium">You're offline. Using cached content.</span>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
