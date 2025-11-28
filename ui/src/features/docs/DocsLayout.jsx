import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import DocsSidebar from './components/DocsSidebar'
import Breadcrumbs from './components/Breadcrumbs'
import DocsSearch from './components/DocsSearch'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { useEscapeKey, useFocusManagement } from '../../hooks/useKeyboardNav'
import { getBreadcrumbs } from './data/docsData'

export default function DocsLayout() {
    const isMobile = useIsMobile()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()
    const breadcrumbItems = getBreadcrumbs(location.pathname)

    // Keyboard navigation for mobile sidebar
    useEscapeKey(sidebarOpen, () => setSidebarOpen(false))
    useFocusManagement(sidebarOpen)

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            {/* Mobile Sidebar Toggle */}
            {isMobile && (
                <>
                    {/* Backdrop */}
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setSidebarOpen(false)}
                            aria-hidden="true"
                        />
                    )}

                    {/* Sidebar Drawer */}
                    <aside
                        className={`fixed inset-y-0 left-0 z-50 w-72 bg-background border-r transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                            }`}
                        role="navigation"
                        aria-label="Documentation navigation"
                    >
                        {/* Mobile sidebar header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="font-semibold">Documentation</h2>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 hover:bg-accent rounded-lg transition-colors"
                                aria-label="Close sidebar"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto h-[calc(100%-4rem)] p-4">
                            <DocsSearch />
                            <div className="mt-4">
                                <DocsSidebar onNavigate={() => setSidebarOpen(false)} />
                            </div>
                        </div>
                    </aside>
                </>
            )}

            {/* Desktop Sidebar */}
            {!isMobile && (
                <aside
                    className="w-64 border-r bg-card overflow-y-auto p-6"
                    role="navigation"
                    aria-label="Documentation navigation"
                >
                    <DocsSearch />
                    <div className="mt-6">
                        <DocsSidebar />
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto" role="main">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Mobile menu button */}
                    {isMobile && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="mb-4 p-2 hover:bg-accent rounded-lg transition-colors inline-flex items-center gap-2"
                            aria-label="Open documentation navigation"
                            aria-expanded={sidebarOpen}
                        >
                            <Menu className="h-5 w-5" aria-hidden="true" />
                            <span className="text-sm font-medium">Menu</span>
                        </button>
                    )}

                    <Breadcrumbs items={breadcrumbItems} />
                    <div className="mt-6">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    )
}
