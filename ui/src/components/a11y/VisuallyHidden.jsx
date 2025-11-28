/**
 * Accessibility utility component for screen-reader-only text
 * Content is hidden visually but still accessible to screen readers
 */
export default function VisuallyHidden({ children, as: Component = 'span', ...props }) {
    return (
        <Component
            className="sr-only"
            {...props}
        >
            {children}
        </Component>
    )
}
