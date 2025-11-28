/**
 * Accessibility utility functions
 */

/**
 * Announces a message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - Priority level: 'polite' | 'assertive'
 */
export function announce(message, priority = 'polite') {
    const liveRegion = document.getElementById('a11y-announcer')
    if (liveRegion) {
        liveRegion.setAttribute('aria-live', priority)
        liveRegion.textContent = message
        // Clear after a delay
        setTimeout(() => {
            liveRegion.textContent = ''
        }, 1000)
    }
}

/**
 * Creates a focus trap within an element
 * @param {HTMLElement} element - Element to trap focus within
 * @returns {Function} Cleanup function
 */
export function createFocusTrap(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    function handleKeyDown(e) {
        if (e.key !== 'Tab') return

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus()
                e.preventDefault()
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus()
                e.preventDefault()
            }
        }
    }

    element.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    // Return cleanup function
    return () => {
        element.removeEventListener('keydown', handleKeyDown)
    }
}

/**
 * Gets color contrast ratio
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @returns {number} Contrast ratio
 */
export function getContrastRatio(color1, color2) {
    const luminance1 = getLuminance(color1)
    const luminance2 = getLuminance(color2)
    const lighter = Math.max(luminance1, luminance2)
    const darker = Math.min(luminance1, luminance2)
    return (lighter + 0.05) / (darker + 0.05)
}

function getLuminance(hex) {
    const rgb = hexToRgb(hex)
    const [r, g, b] = rgb.map(val => {
        val = val / 255
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [0, 0, 0]
}

/**
 * Checks if element is visible to screen readers
 * @param {HTMLElement} element - Element to check
 * @returns {boolean}
 */
export function isVisibleToScreenReader(element) {
    return (
        element.getAttribute('aria-hidden') !== 'true' &&
        element.style.display !== 'none' &&
        element.style.visibility !== 'hidden' &&
        element.getAttribute('hidden') !== ''
    )
}
