import { useState, useEffect } from 'react'

/**
 * Custom hook for responsive design
 * @param {string} query - Media query string (e.g., '(min-width: 768px)')
 * @returns {boolean} - Whether the media query matches
 */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const media = window.matchMedia(query)

        // Set initial value
        setMatches(media.matches)

        // Create listener
        const listener = (e) => setMatches(e.matches)

        // Modern browsers
        if (media.addEventListener) {
            media.addEventListener('change', listener)
            return () => media.removeEventListener('change', listener)
        } else {
            // Legacy browsers
            media.addListener(listener)
            return () => media.removeListener(listener)
        }
    }, [query])

    return matches
}

/**
 * Predefined breakpoint hooks
 */
export function useIsMobile() {
    return useMediaQuery('(max-width: 767px)')
}

export function useIsTablet() {
    return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

export function useIsDesktop() {
    return useMediaQuery('(min-width: 1024px)')
}

export function useIsSmallMobile() {
    return useMediaQuery('(max-width: 479px)')
}

// Viewport size hook
export function useViewport() {
    const [viewport, setViewport] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    })

    useEffect(() => {
        const handleResize = () => {
            setViewport({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return viewport
}
