import { useEffect, useRef } from 'react'
import { createFocusTrap } from '../lib/a11y'

/**
 * Hook to trap focus within an element
 * Useful for modals and dialogs
 * @param {boolean} enabled - Whether focus trap is active
 * @returns {React.Ref} Ref to attach to the container element
 */
export function useFocusTrap(enabled = true) {
    const containerRef = useRef(null)

    useEffect(() => {
        if (!enabled || !containerRef.current) return

        const cleanup = createFocusTrap(containerRef.current)
        return cleanup
    }, [enabled])

    return containerRef
}
