import { Link, useLocation, Outlet } from 'react-router-dom'
import { Moon, Sun, FileText, Workflow, Menu, Home, BarChart2, Palette } from 'lucide-react'
import { useThemeStore } from '../../stores/themeStore'
import { cn } from '../../lib/utils'
import OfflineIndicator from '../offline/OfflineIndicator'
import MobileNav from '../mobile/MobileNav'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { useState } from 'react'

export default function AppShell() {
    const location = useLocation()
    const { theme, toggleTheme } = useThemeStore()
    const isMobile = useIsMobile()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const navigation = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Pipeline Builder', path: '/builder', icon: Workflow },
        { name: 'CSS Manager', path: '/css', icon: Palette },
        { name: 'Dashboard', path: '/dashboard', icon: BarChart2 },
        { name: 'Documentation', path: '/docs', icon: FileText },
    ]

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top Navigation */}
            <header
                className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                role="banner"
            >
                <div className="container flex h-16 items-center px-4 sm:px-8">
                    {/* Mobile menu button */}
                    {isMobile && (
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="mr-3 p-2 hover:bg-accent rounded-lg transition-colors lg:hidden"
                            aria-label="Open navigation menu"
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-navigation"
                        >
                            <Menu className="h-5 w-5" aria-hidden="true" />
                        </button>
                    )}

                    {/* Logo */}
                    <div className="mr-4 sm:mr-8 flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary" aria-hidden="true">
                            <span className="text-lg font-bold text-primary-foreground">N</span>
                        </div>
                        <span className="hidden sm:inline-block font-bold">
                            NextGen Visual Builder
                        </span>
                    </div>

                    {/* Navigation Links - Desktop only */}
                    <nav
                        className="hidden lg:flex flex-1 items-center space-x-6"
                        role="navigation"
                        aria-label="Main navigation"
                    >
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname.startsWith(item.path)
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary',
                                        isActive
                                            ? 'text-foreground'
                                            : 'text-muted-foreground'
                                    )}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                    <span>{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Spacer for mobile */}
                    <div className="flex-1 lg:hidden" />

                    {/* Right side actions */}
                    <div className="flex items-center gap-3" role="toolbar" aria-label="Utility actions">
                        <OfflineIndicator />

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                            aria-pressed={theme === 'dark'}
                        >
                            {theme === 'light' ? (
                                <Moon className="h-4 w-4" aria-hidden="true" />
                            ) : (
                                <Sun className="h-4 w-4" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1" id="main-content" role="main">
                <Outlet />
            </main>

            {/* Mobile Navigation */}
            <MobileNav
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />
        </div>
    )
}
