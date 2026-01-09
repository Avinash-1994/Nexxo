import React from 'react';
import {
    Zap,
    ShieldCheck,
    Code2,
    Cpu,
    Globe,
    Activity,
    Palette,
    Package,
    Cloud,
    Puzzle,
    TrendingUp,
    CheckCircle2,
    Rocket
} from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        'Core': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'DevEx': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        'Styling': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
        'Federation': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'Production': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'Tools': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
        'Quality': 'bg-red-500/10 text-red-500 border-red-500/20',
        'Cloud': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        'Plugins': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
        'Advanced': 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[status] || colors.Core}`}>
            {status}
        </span>
    );
};

export const Features: React.FC = () => {
    const features = [
        {
            category: "Core Build System",
            icon: Zap,
            tag: "Core",
            items: [
                {
                    name: "Universal Framework Support",
                    description: "Single build tool for React, Vue, Svelte, Solid, Angular, Lit, Preact, Qwik, Astro, and more",
                    implementation: "UniversalTransformer with framework-specific adapters using esbuild and SWC",
                    file: "src/core/universal-transformer.ts"
                },
                {
                    name: "Zero-Config Auto-Detection",
                    description: "Automatically detects your framework from package.json and project structure",
                    implementation: "Framework detection via dependency analysis and file patterns",
                    file: "src/core/framework-detector.ts"
                },
                {
                    name: "Incremental Builds",
                    description: "Only rebuild changed modules for lightning-fast development",
                    implementation: "File-level caching with content hashing and dependency tracking",
                    file: "src/core/engine/incremental.ts"
                },
                {
                    name: "Parallel Processing",
                    description: "Multi-threaded builds using Rust-powered native workers",
                    implementation: "Rust native module with worker pool for CPU-intensive tasks",
                    file: "native/src/lib.rs"
                }
            ]
        },
        {
            category: "Development Experience",
            icon: Code2,
            tag: "DevEx",
            items: [
                {
                    name: "Hot Module Replacement (HMR)",
                    description: "Instant updates without full page reload for all frameworks",
                    implementation: "WebSocket-based HMR with framework-specific runtime adapters",
                    file: "src/dev/hmr.ts"
                },
                {
                    name: "Dev Server with Middleware",
                    description: "Built-in dev server with proxy, CORS, and custom middleware support",
                    implementation: "Node.js HTTP server with middleware pipeline and WebSocket support",
                    file: "src/dev/devServer.ts"
                },
                {
                    name: "Source Maps",
                    description: "Full source map support for debugging transformed code",
                    implementation: "Inline and external source maps via esbuild and custom transformers",
                    file: "src/core/universal-transformer.ts"
                },
                {
                    name: "TypeScript Support",
                    description: "First-class TypeScript support with type checking",
                    implementation: "TSX loader with optional type checking via tsc",
                    file: "src/core/universal-transformer.ts"
                }
            ]
        },
        {
            category: "CSS & Styling",
            icon: Palette,
            tag: "Styling",
            items: [
                {
                    name: "CSS Modules",
                    description: "Scoped CSS with automatic class name hashing",
                    implementation: "PostCSS-based CSS Modules with local scope transformation",
                    file: "src/plugins/css.ts"
                },
                {
                    name: "Tailwind CSS",
                    description: "Built-in Tailwind CSS support with JIT compilation",
                    implementation: "Tailwind plugin with automatic config detection and JIT engine",
                    file: "src/plugins/tailwind.ts"
                },
                {
                    name: "CSS-in-JS",
                    description: "Support for Emotion, Styled-Components, and other CSS-in-JS libraries",
                    implementation: "Framework-agnostic CSS-in-JS bundling with runtime injection",
                    file: "src/plugins/css-in-js.ts"
                },
                {
                    name: "SASS/SCSS",
                    description: "Native SASS/SCSS compilation",
                    implementation: "Sass compiler integration with source maps",
                    file: "src/plugins/sass.ts"
                }
            ]
        },
        {
            category: "Module Federation",
            icon: Globe,
            tag: "Federation",
            items: [
                {
                    name: "Micro-Frontend Architecture",
                    description: "Build and deploy independent micro-frontends",
                    implementation: "Custom module federation runtime with dynamic remote loading",
                    file: "src/runtime/federation.js"
                },
                {
                    name: "Shared Dependencies",
                    description: "Share common dependencies across micro-frontends",
                    implementation: "Dependency deduplication with version resolution and singleton enforcement",
                    file: "src/federation/shared.ts"
                },
                {
                    name: "Hot Federation",
                    description: "HMR support for federated modules",
                    implementation: "WebSocket-based federation updates with runtime module replacement",
                    file: "src/dev/hotFederation.ts"
                },
                {
                    name: "Framework-Agnostic Federation",
                    description: "Mix React, Vue, Svelte, and other frameworks in the same app",
                    implementation: "Universal module wrapper with framework-specific adapters",
                    file: "src/federation/universal.ts"
                }
            ]
        },
        {
            category: "Production Optimization",
            icon: TrendingUp,
            tag: "Production",
            items: [
                {
                    name: "Tree Shaking",
                    description: "Remove unused code for smaller bundles",
                    implementation: "ESM-based tree shaking via esbuild with dead code elimination",
                    file: "src/core/engine/bundler.ts"
                },
                {
                    name: "Code Splitting",
                    description: "Automatic code splitting with dynamic imports",
                    implementation: "Chunk graph analysis with optimal splitting strategy",
                    file: "src/core/engine/splitter.ts"
                },
                {
                    name: "Minification",
                    description: "Advanced minification with terser and esbuild",
                    implementation: "Multi-pass minification with identifier mangling and compression",
                    file: "src/core/engine/minifier.ts"
                },
                {
                    name: "Asset Optimization",
                    description: "Image optimization, font subsetting, and asset compression",
                    implementation: "Sharp-based image optimization with WebP conversion and lazy loading",
                    file: "src/plugins/assets.ts"
                }
            ]
        },
        {
            category: "Developer Tools",
            icon: Activity,
            tag: "Tools",
            items: [
                {
                    name: "Dependency Graph Visualization",
                    description: "Interactive visualization of your project's dependency graph",
                    implementation: "D3.js-based graph rendering with real-time updates",
                    file: "src/visual/graph-ui.ts"
                },
                {
                    name: "Bundle Analyzer",
                    description: "Analyze bundle size and composition",
                    implementation: "Treemap visualization with size breakdown and optimization suggestions",
                    file: "src/visual/bundle-analyzer.ts"
                },
                {
                    name: "Performance Metrics",
                    description: "Track build times, bundle sizes, and HMR performance",
                    implementation: "Performance API integration with historical tracking",
                    file: "src/dev/metrics.ts"
                }
            ]
        },
        {
            category: "Quality & Governance",
            icon: ShieldCheck,
            tag: "Quality",
            items: [
                {
                    name: "Built-in Linting",
                    description: "ESLint integration with framework-specific rules",
                    implementation: "Custom ESLint plugin with governance rules",
                    file: "eslint-plugin-nexxo-governance/index.js"
                },
                {
                    name: "Accessibility Audits",
                    description: "Automatic accessibility checking during builds",
                    implementation: "axe-core integration with HTML parsing and ARIA validation",
                    file: "src/plugins/a11y.ts"
                },
                {
                    name: "Security Scanning",
                    description: "Dependency vulnerability scanning",
                    implementation: "npm audit integration with SNYK API for advanced scanning",
                    file: "src/security/scanner.ts"
                },
                {
                    name: "Governance Rules",
                    description: "Enforce architectural boundaries and best practices",
                    implementation: "Custom rule engine with import restrictions and pattern enforcement",
                    file: "src/governance/rules.ts"
                }
            ]
        },
        {
            category: "Cloud & Deployment",
            icon: Cloud,
            tag: "Cloud",
            items: [
                {
                    name: "Edge Deployment",
                    description: "Deploy to Cloudflare Workers, Vercel Edge, and more",
                    implementation: "Platform-specific adapters with automatic code transformation",
                    file: "src/deploy/edge.ts"
                },
                {
                    name: "SSR/SSG Support",
                    description: "Server-side rendering and static site generation",
                    implementation: "Framework-specific SSR adapters with hydration support",
                    file: "src/ssr/renderer.ts"
                },
                {
                    name: "CDN Integration",
                    description: "Automatic asset upload to CDN",
                    implementation: "S3-compatible storage with CloudFront invalidation",
                    file: "src/deploy/cdn.ts"
                },
                {
                    name: "Docker Support",
                    description: "Generate optimized Docker images",
                    implementation: "Multi-stage Dockerfile generation with layer caching",
                    file: "src/deploy/docker.ts"
                }
            ]
        },
        {
            category: "Plugin System",
            icon: Puzzle,
            tag: "Plugins",
            items: [
                {
                    name: "Custom Plugins",
                    description: "Extend Nexxo with custom transformations and hooks",
                    implementation: "Plugin API with lifecycle hooks and transform pipeline",
                    file: "src/plugins/plugin-api.ts"
                },
                {
                    name: "Plugin Marketplace",
                    description: "Discover and install community plugins",
                    implementation: "NPM-based plugin registry with version management",
                    file: "marketplace/index.ts"
                },
                {
                    name: "Framework Adapters",
                    description: "Add support for new frameworks via adapters",
                    implementation: "Adapter API with framework detection and transformation hooks",
                    file: "src/adapters/adapter-api.ts"
                }
            ]
        },
        {
            category: "Advanced Features",
            icon: Cpu,
            tag: "Advanced",
            items: [
                {
                    name: "Monorepo Support",
                    description: "Build multiple packages in a monorepo efficiently",
                    implementation: "Workspace detection with shared cache and parallel builds",
                    file: "src/core/workspace.ts"
                },
                {
                    name: "Pre-bundling",
                    description: "Pre-bundle dependencies for faster dev server startup",
                    implementation: "Dependency analysis with esbuild-based pre-bundling and caching",
                    file: "src/dev/prebundle.ts"
                },
                {
                    name: "Watch Mode",
                    description: "Intelligent file watching with debouncing",
                    implementation: "Chokidar-based file watcher with change detection and rebuild queue",
                    file: "src/dev/watcher.ts"
                },
                {
                    name: "Environment Variables",
                    description: "Dotenv support with mode-specific files",
                    implementation: "Dotenv parsing with mode resolution and build-time replacement",
                    file: "src/config/env.ts"
                }
            ]
        }
    ];

    return (
        <div className="animate-in fade-in duration-1000">
            {/* Hero Section */}
            <section className="mb-24 pt-12 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold mb-8">
                    <Rocket size={14} />
                    <span>{features.reduce((acc, cat) => acc + cat.items.length, 0)} Production-Ready Features</span>
                </div>
                <h1 className="text-6xl lg:text-8xl font-black font-display tracking-tighter text-[var(--text-primary)] leading-[0.95] mb-8">
                    Complete Feature Set
                </h1>
                <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed mb-10">
                    Everything you need for modern web development, from zero-config builds to production deployment
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                    {features.map((cat, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)]">
                            <cat.icon size={16} className="text-blue-500" />
                            <span className="text-sm font-semibold">{cat.category}</span>
                            <StatusBadge status={cat.tag} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <div className="space-y-16">
                {features.map((category, idx) => (
                    <section key={idx} className="py-12 px-8 rounded-[32px] bg-slate-900/5 dark:bg-slate-900/20 border border-[var(--border-color)] backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <category.icon size={200} className="text-blue-500" />
                        </div>

                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                    <category.icon size={28} className="text-blue-500" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black font-display tracking-tight">{category.category}</h2>
                                    <p className="text-sm text-[var(--text-secondary)] mt-1">{category.items.length} features</p>
                                </div>
                            </div>
                            <StatusBadge status={category.tag} />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {category.items.map((feature, featureIdx) => (
                                <div
                                    key={featureIdx}
                                    className="p-6 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] group hover:border-blue-500 transition-all hover:shadow-xl"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-blue-500 transition-colors">
                                            {feature.name}
                                        </h3>
                                        <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                                        {feature.description}
                                    </p>
                                    <div className="space-y-2">
                                        <div className="p-3 rounded-xl bg-slate-900/5 dark:bg-slate-900/50 border border-[var(--border-color)]">
                                            <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1">Implementation</div>
                                            <div className="text-xs text-[var(--text-secondary)] leading-relaxed">{feature.implementation}</div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-slate-900/5 dark:bg-slate-900/50 border border-[var(--border-color)]">
                                            <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1">Source File</div>
                                            <code className="text-xs text-emerald-500 font-mono">{feature.file}</code>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* Footer CTA */}
            <section className="py-24 text-center border-t border-[var(--border-color)] mt-24">
                <h2 className="text-4xl font-black font-display mb-6 italic tracking-tight uppercase">Ready to Build?</h2>
                <p className="text-[var(--text-secondary)] max-w-xl mx-auto mb-10 text-lg">
                    Get started in seconds with zero configuration and production-grade features out of the box
                </p>
                <div className="flex justify-center gap-4">
                    <a
                        href="#/docs/getting-started"
                        className="inline-flex h-14 items-center justify-center px-12 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 hover:-translate-y-1 transition-all shadow-xl shadow-blue-500/25 active:scale-95"
                    >
                        Get Started →
                    </a>
                    <a
                        href="https://github.com/Avinash-1994/nexxo"
                        className="inline-flex h-14 items-center justify-center px-12 rounded-2xl border border-[var(--border-color)] font-bold hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View on GitHub
                    </a>
                </div>
            </section>
        </div>
    );
};

export default Features;
