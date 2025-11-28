import { useState } from 'react'
import { X, Menu, FileText, Workflow, Github, Book } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useEscapeKey, useFocusManagement } from '../../hooks/useKeyboardNav'

export default function MobileNav({ isOpen, onClose }) {
    const location = useLocation()

    // Keyboard navigation
    useEscapeKey(isOpen, onClose)
    useFocusManagement(isOpen)

    const navigation = [
        { name: 'Pipeline Builder', path: '/builder', icon: Workflow, description: 'Visual build pipeline editor' },
        { name: 'Documentation', path: '/docs', icon: FileText, description: 'Complete guides and API reference' },
    ]

    const resources = [
        { name: 'GitHub', href: 'https://github.com/nextgen-build-tool', icon: Github },
        { name: 'Tutorials', path: '/docs/tutorials', icon: Book },
    ]

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slide-in menu */}
            <div
                id="mobile-navigation"
                className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-background border-r shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden"
                role="dialog"
                aria-label="Mobile navigation menu"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <span className="text-lg font-bold text-primary-foreground">N</span>
                        </div>
                        <span className="font-bold">NextGen</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2" aria-label="Mobile main navigation">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Main Navigation
                    </div>
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname.startsWith(item.path)
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={`flex items-start gap-3 p-3 rounded-lg transition-all ${isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent hover:text-accent-foreground'
                                    }`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className={`text-xs mt-0.5 ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                        }`}>
                                        {item.description}
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Resources */}
                <div className="p-4 border-t mt-auto absolute bottom-0 left-0 right-0">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Resources
                    </div>
                    <div className="space-y-2">
                        {resources.map((item) => {
                            const Icon = item.icon
                            return (
                                <a
                                    key={item.name}
                                    href={item.href || item.path}
                                    target={item.href ? '_blank' : undefined}
                                    rel={item.href ? 'noopener noreferrer' : undefined}
                                    onClick={item.path ? onClose : undefined}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors text-sm"
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.name}
                                </a>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}
