import { useEffect, useCallback, useState } from 'react'

/**
 * Performance monitoring utilities
 */

// Basic performance tracking (no external dependencies)
export function measureWebVitals(onPerfEntry) {
    if (onPerfEntry && onPerfEntry instanceof Function && 'performance' in window) {
        // Use basic Performance API
        if (window.performance && window.performance.timing) {
            onPerfEntry({
                name: 'page-load',
                value: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart
            })
        }

        // Monitor paint timing
        if ('PerformanceObserver' in window) {
            try {
                const paintObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        onPerfEntry({
                            name: entry.name,
                            value: entry.startTime
                        })
                    }
                })
                paintObserver.observe({ entryTypes: ['paint'] })
            } catch (e) {
                // Silently fail
            }
        }
    }
}

// Performance observer hook
export function usePerformanceMonitor() {
    useEffect(() => {
        if ('PerformanceObserver' in window) {
            // Monitor long tasks (>50ms)
            const longTaskObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn('[Performance] Long task detected:', {
                            duration: entry.duration,
                            startTime: entry.startTime,
                        })
                    }
                }
            })

            try {
                longTaskObserver.observe({ entryTypes: ['longtask'] })
            } catch (e) {
                // longtask not supported in all browsers
            }

            return () => longTaskObserver.disconnect()
        }
    }, [])
}

// Debounce utility for performance
export function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Throttle utility for performance
export function throttle(func, limit) {
    let inThrottle
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

// React hook for debounced value
export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

// Memoized callback with dependencies
export function useMemoizedCallback(callback, deps) {
    return useCallback(callback, deps)
}

// Log performance metrics
export function logPerformanceMetrics() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing
        const metrics = {
            'DNS Lookup': timing.domainLookupEnd - timing.domainLookupStart,
            'TCP Connection': timing.connectEnd - timing.connectStart,
            'Server Response': timing.responseEnd - timing.requestStart,
            'DOM Interactive': timing.domInteractive - timing.navigationStart,
            'DOM Complete': timing.domComplete - timing.navigationStart,
            'Page Load': timing.loadEventEnd - timing.navigationStart,
        }

        console.table(metrics)
    }
}

// Report bundle sizes
export function reportBundleSize() {
    if ('performance' in window && 'getEntriesByType' in window.performance) {
        const resources = window.performance.getEntriesByType('resource')
        const scripts = resources.filter((r) => r.name.endsWith('.js'))
        const styles = resources.filter((r) => r.name.endsWith('.css'))

        console.group('[Performance] Bundle Sizes')
        console.log('JavaScript:', formatBytes(scripts.reduce((acc, s) => acc + s.transferSize, 0)))
        console.log('CSS:', formatBytes(styles.reduce((acc, s) => acc + s.transferSize, 0)))
        console.groupEnd()
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
