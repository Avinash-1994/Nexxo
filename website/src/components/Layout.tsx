import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { Sun, Moon, Zap, Menu, Github, Search, ArrowLeft, ArrowRight, Languages } from 'lucide-react';
import { BackgroundAnimation } from './BackgroundAnimation';
import { Logo } from './Logo';
import { useI18n } from './I18nContext';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { theme, toggleTheme } = useTheme();
    const { lang, setLang, t } = useI18n();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const [searchQuery, setSearchQuery] = React.useState('');

    const navLinks = [
        { label: t('nav.home'), href: '/' },
        { label: 'Features', href: '/features' },
        { label: 'Benchmarks', href: '/benchmarks' },
        { label: t('nav.docs'), href: '/docs/getting-started' },
        { label: t('nav.guides'), href: '/guides/react' },
    ];

    const sidebarSections = [
        {
            title: 'Getting Started',
            links: [
                { label: 'Installation', href: '/docs/getting-started' },
                { label: 'Features', href: '/features' },
                { label: 'Architecture', href: '/docs/core-concepts' },
                { label: 'Audits & Reports', href: '/docs/quality' },
                { label: 'Technical Specs', href: '/docs/tech-specs' },
                { label: 'Glossary', href: '/docs/glossary' },
            ]
        },
        {
            title: 'Ecosystem',
            links: [
                { label: 'Plugins', href: '/plugins' },
                { label: 'Templates', href: '/templates' },
                { label: 'Migration Guide', href: '/migration' },
            ]
        },
        {
            title: 'Security & Ops',
            links: [
                { label: 'Security Guide', href: '/security' },
                { label: 'Audits & Reports', href: '/docs/quality' },
                { label: 'Governance', href: '/docs/governance' },
            ]
        },
        {
            title: 'Framework Guides',
            links: [
                { label: 'React (Tier 1)', href: '/guides/react' },
                { label: 'Vue (Tier 1)', href: '/guides/vue' },
                { label: 'Svelte (Tier 1)', href: '/guides/svelte' },
                { label: 'SolidJS (Tier 1)', href: '/guides/solid' },
                { label: 'Preact (Tier 1)', href: '/guides/preact' },
                { label: 'Lit (Verified)', href: '/guides/lit' },
                { label: 'Alpine (Verified)', href: '/guides/alpine' },
                { label: 'Qwik (Experimental)', href: '/guides/qwik' },
                { label: 'Mithril (Legacy)', href: '/guides/mithril' },
            ]
        },
        {
            title: 'Orientation',
            links: [
                { label: 'Is Nexxo for you?', href: '/docs/decision-guide' },
                { label: 'Governance & Stability', href: '/docs/governance' },
            ]
        },
        {
            title: 'Micro-Frontends',
            links: [
                { label: 'Overview', href: '/mfe/overview' },
                { label: 'Architecture & Graph', href: '/mfe/architecture' },
                { label: 'Getting Started', href: '/mfe/getting-started' },
                { label: 'Supported Patterns', href: '/mfe/patterns' },
                { label: 'Risks & Limitations', href: '/mfe/risks' },
                { label: 'Framework Policy', href: '/mfe/framework-policy' },
            ]
        },
        {
            title: 'CSS & Styles',
            links: [
                { label: 'Tailwind CSS', href: '/infra/tailwind' },
                { label: 'SASS / SCSS', href: '/infra/sass' },
                { label: 'PostCSS', href: '/infra/postcss' },
            ]
        },
        {
            title: 'Experimental & Fun',
            links: [
                { label: 'Dependency Defender', href: '/play' },
            ]
        }
    ];

    const flattenLinks = sidebarSections.flatMap(s => s.links);

    // Calculate navigation links
    const currentIndex = flattenLinks.findIndex(l => l.href === currentPath);
    const prevLink = currentIndex > 0 ? flattenLinks[currentIndex - 1] : null;
    const nextLink = currentIndex >= 0 && currentIndex < flattenLinks.length - 1 ? flattenLinks[currentIndex + 1] : null;

    const searchResults = searchQuery
        ? flattenLinks.filter(l => l.label.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
        : [];

    return (
        <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)] transition-colors duration-300">
            <BackgroundAnimation />
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--surface-color)]/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 lg:hidden"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            aria-label="Toggle Navigation Menu"
                        >
                            <Menu size={20} />
                        </button>
                        <Link to="/">
                            <Logo />
                        </Link>
                    </div>

                    <div className="hidden md:flex flex-1 max-w-sm mx-12">
                        <div className="relative w-full group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input
                                type="text"
                                aria-label="Search documentation"
                                placeholder="Search docs (Ctrl+K)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-color)]/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                            {searchQuery && (
                                <div className="absolute top-12 left-0 w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden z-50">
                                    {searchResults.length > 0 ? (
                                        searchResults.map(result => (
                                            <Link
                                                key={result.href}
                                                to={result.href}
                                                onClick={() => setSearchQuery('')}
                                                className="block p-3 text-sm hover:bg-blue-500/10 border-b border-[var(--border-color)] last:border-none transition-colors"
                                            >
                                                {result.label}
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-4 text-xs text-[var(--text-secondary)]">No results found for "{searchQuery}"</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map(link => {
                            const isActive = currentPath === link.href;
                            return (
                                <Link
                                    key={link.label}
                                    to={link.href}
                                    className={`text-sm font-medium transition-colors ${isActive
                                        ? 'text-blue-500'
                                        : 'text-[var(--text-secondary)] hover:text-blue-500'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-4">
                        <a href="https://github.com/avinash-1994/nexxo" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 text-sm font-medium">
                            <Github size={20} />
                            <span className="hidden sm:inline">Star</span>
                        </a>
                        <button
                            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                            title="Switch Language"
                            aria-label="Switch Language"
                        >
                            <Languages size={20} />
                            <span className="text-xs font-bold uppercase">{lang}</span>
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className={`
            fixed inset-y-0 left-0 z-40 w-64 transform bg-[var(--bg-color)] border-r border-[var(--border-color)] transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:bg-transparent lg:border-none
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
                        <div className="h-full overflow-y-auto py-8 lg:py-12 pr-4 custom-scrollbar text-left">
                            {sidebarSections.map(section => (
                                <div key={section.title} className="mb-8">
                                    <h5 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                                        {section.title}
                                    </h5>
                                    <ul className="space-y-1">
                                        {section.links.map(link => {
                                            const isActive = currentPath === link.href;
                                            return (
                                                <li key={link.label}>
                                                    <Link
                                                        to={link.href}
                                                        className={`block text-sm py-2 px-3 rounded-lg font-medium transition-all ${isActive
                                                            ? 'text-blue-600 bg-blue-500/10 border-l-4 border-blue-600'
                                                            : 'text-[var(--text-secondary)] hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                            }`}
                                                    >
                                                        {link.label}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 py-8 lg:py-12 min-w-0">
                        <div className="min-h-[calc(100vh-280px)]">
                            {children}
                        </div>

                        {/* Page Navigation */}
                        {(prevLink || nextLink) && (
                            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[var(--border-color)] pt-8">
                                {prevLink ? (
                                    <Link
                                        to={prevLink.href}
                                        className="group p-6 rounded-2xl border border-[var(--border-color)] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left"
                                    >
                                        <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest mb-2">
                                            <ArrowLeft size={14} /> Previous
                                        </div>
                                        <div className="text-lg font-bold group-hover:text-blue-500 transition-colors">
                                            {prevLink.label}
                                        </div>
                                    </Link>
                                ) : <div />}

                                {nextLink ? (
                                    <Link
                                        to={nextLink.href}
                                        className="group p-6 rounded-2xl border border-[var(--border-color)] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-right"
                                    >
                                        <div className="flex items-center justify-end gap-2 text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest mb-2">
                                            Next <ArrowRight size={14} />
                                        </div>
                                        <div className="text-lg font-bold group-hover:text-blue-500 transition-colors">
                                            {nextLink.label}
                                        </div>
                                    </Link>
                                ) : <div />}
                            </div>
                        )}

                        <footer className="mt-20 pt-8 border-t border-[var(--border-color)] text-[var(--text-secondary)] text-sm flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex items-center gap-2">
                                © 2026 NEXXO Build Systems. All rights reserved.
                            </div>
                            <a href="https://github.com/avinash-1994/nexxo/edit/main/website/docs" className="hover:text-indigo-500 transition-colors">
                                Edit this page on GitHub
                            </a>
                        </footer>
                    </main>
                </div>
            </div>
        </div>
    );
};
