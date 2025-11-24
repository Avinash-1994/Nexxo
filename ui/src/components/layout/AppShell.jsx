```
import { Link, useLocation, Outlet } from 'react-router-dom'
import { Moon, Sun, FileText, Workflow } from 'lucide-react'
import { useThemeStore } from '../../stores/themeStore'
import { cn } from '../../lib/utils'
import OfflineIndicator from '../offline/OfflineIndicator'

export default function AppShell() {
    const location = useLocation()
    const { theme, toggleTheme } = useThemeStore()

    const navigation = [
        { name: 'Pipeline Builder', path: '/builder', icon: Workflow },
        { name: 'Documentation', path: '/docs', icon: FileText },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center px-4 sm:px-8">
                    {/* Logo */}
                    <div className="mr-8 flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <span className="text-lg font-bold text-primary-foreground">N</span>
                        </div>
                        <span className="hidden font-bold sm:inline-block">
                            NextGen Visual Builder
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-1 items-center space-x-6">
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
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>

                        ) : (
                            <Sun className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </header>

            {/* Main Content - Use Outlet for nested routes */}
            <main>
                <Outlet />
            </main>
        </div>
    )
}
