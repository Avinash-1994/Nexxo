import { useEffect } from 'react'

/**
 * Hook for handling Escape key to close modals/dialogs
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Function to call when Escape is pressed
 */
export function useEscapeKey(isOpen, onClose) {
    useEffect(() => {
        if (!isOpen) return

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                onClose()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])
}

/**
 * Hook for general keyboard navigation
 * @param {Object} shortcuts - Object mapping key combinations to handlers
 * Example: { 'ctrl+s': handleSave, 'escape': handleClose }
 */
export function useKeyboardNav(shortcuts, enabled = true) {
    useEffect(() => {
        if (!enabled) return

        const handleKeyPress = (event) => {
            const key = event.key.toLowerCase()
            const ctrl = event.ctrlKey || event.metaKey
            const shift = event.shiftKey
            const alt = event.altKey

            // Build key combination string
            let combo = ''
            if (ctrl) combo += 'ctrl+'
            if (shift) combo += 'shift+'
            if (alt) combo += 'alt+'
            combo += key

            // Check for exact match
            if (shortcuts[combo]) {
                event.preventDefault()
                shortcuts[combo](event)
                return
            }

            // Check for simple key match
            if (shortcuts[key]) {
                shortcuts[key](event)
            }
        }

        document.addEventListener('keydown', handleKeyPress)
        return () => document.removeEventListener('keydown', handleKeyPress)
    }, [shortcuts, enabled])
}

/**
 * Hook to trap focus within an element (for modals)
 * Returns a ref to attach to the container
 */
export function useFocusManagement(isOpen) {
    useEffect(() => {
        if (!isOpen) return

        // Store the element that had focus before opening
        const previouslyFocused = document.activeElement

        // Return focus when closing
        return () => {
            if (previouslyFocused && previouslyFocused.focus) {
                previouslyFocused.focus()
            }
        }
    }, [isOpen])
}
