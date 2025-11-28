import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { docsNavigation } from '../data/docsData'
import { cn } from '../../../lib/utils'

function NavSection({ section, isActive, onNavigate }) {
    const [isOpen, setIsOpen] = useState(isActive)
    const location = useLocation()

    const hasItems = section.items && section.items.length > 0

    if (!hasItems) {
        // Single item section (like FAQ)
        const isCurrentPage = location.pathname === section.path
        return (
            <Link
                to={section.path}
                onClick={onNavigate}
                className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                    isCurrentPage
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-accent'
                )}
                aria-current={isCurrentPage ? 'page' : undefined}
            >
                <span aria-hidden="true">{section.icon}</span>
                <span>{section.title}</span>
            </Link>
        )
    }

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                aria-expanded={isOpen}
                aria-label={`${section.title} section`}
            >
                {isOpen ? (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                ) : (
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                )}
                <span aria-hidden="true">{section.icon}</span>
                <span className="font-medium">{section.title}</span>
            </button>

            {isOpen && (
                <div className="ml-6 mt-1 space-y-1" role="group" aria-label={`${section.title} pages`}>
                    {section.items.map((item) => {
                        const isCurrentPage = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onNavigate}
                                className={cn(
                                    'block px-3 py-1.5 rounded-lg text-sm transition-colors',
                                    isCurrentPage
                                        ? 'bg-primary text-primary-foreground font-medium'
                                        : 'hover:bg-accent'
                                )}
                                aria-current={isCurrentPage ? 'page' : undefined}
                            >
                                {item.title}
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default function DocsSidebar({ onNavigate }) {
    const location = useLocation()

    // Determine which section is active
    const getActiveSectionIndex = () => {
        for (let i = 0; i < docsNavigation.length; i++) {
            const section = docsNavigation[i]
            if (section.items) {
                if (section.items.some(item => item.path === location.pathname)) {
                    return i
                }
            } else if (section.path === location.pathname) {
                return i
            }
        }
        return 0 // Default to first section
    }

    return (
        <div className="space-y-1">
            {docsNavigation.map((section, index) => (
                <NavSection
                    key={section.path || section.title}
                    section={section}
                    isActive={index === getActiveSectionIndex()}
                    onNavigate={onNavigate}
                />
            ))}
        </div>
    )
}
