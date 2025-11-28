import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useEscapeKey, useFocusManagement } from '../../hooks/useKeyboardNav'

export default function BottomSheet({ isOpen, onClose, title, children, height = 'auto' }) {
    // Keyboard navigation
    useEscapeKey(isOpen, onClose)
    useFocusManagement(isOpen)

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    const heightClass = height === 'auto'
        ? 'max-h-[85vh]'
        : height === 'full'
            ? 'h-[85vh]'
            : height

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Bottom sheet */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out ${heightClass}`}
                style={{
                    animation: 'slideUp 0.3s ease-out'
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="bottom-sheet-title"
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2" aria-hidden="true">
                    <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3 border-b">
                    <h3 id="bottom-sheet-title" className="text-lg font-semibold">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                        aria-label="Close dialog"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(85vh - 80px)' }}>
                    {children}
                </div>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    )
}
