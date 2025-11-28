import { Link } from 'react-router-dom'

/**
 * Skip navigation links for keyboard users
 * Allows jumping to main content without tabbing through navigation
 */
export default function SkipLinks() {
    return (
        <div className="skip-links">
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>
            <a href="#navigation" className="skip-link">
                Skip to navigation
            </a>
        </div>
    )
}
