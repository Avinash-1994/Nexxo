import { ArrowRight, Zap, Code2, Rocket, Shield, Layers, Gauge, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
    const features = [
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Built with modern tech stack for blazing-fast build times and optimal performance'
        },
        {
            icon: Code2,
            title: 'Visual First',
            description: 'Drag-and-drop interface makes complex build configurations simple and intuitive'
        },
        {
            icon: Layers,
            title: 'Plugin Ecosystem',
            description: 'Extensible architecture with support for custom plugins and transformers'
        },
        {
            icon: Shield,
            title: 'Type Safe',
            description: 'Full TypeScript support ensures reliability and excellent developer experience'
        },
        {
            icon: Gauge,
            title: 'Optimized Output',
            description: 'Smart bundling and tree-shaking for minimal bundle sizes'
        },
        {
            icon: Sparkles,
            title: 'Modern DX',
            description: 'Hot module replacement, instant feedback, and beautiful error messages'
        }
    ]

    const frameworks = [
        { name: 'React', icon: '⚛️', color: 'from-cyan-400 to-blue-500' },
        { name: 'Vue', icon: '💚', color: 'from-emerald-400 to-green-500' },
        { name: 'Svelte', icon: '🔥', color: 'from-orange-400 to-red-500' },
        { name: 'TypeScript', icon: '📘', color: 'from-blue-400 to-indigo-600' },
        { name: 'Vite', icon: '⚡', color: 'from-purple-400 to-pink-500' },
        { name: 'esbuild', icon: '🚀', color: 'from-yellow-400 to-orange-500' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

                <div className="relative container mx-auto px-4 sm:px-8 py-20 sm:py-32">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Next-Generation Build Tool</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent animate-fade-in-up">
                            Build Faster,
                            <br />
                            Ship Smarter
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in-up delay-200">
                            Visual build pipeline editor with blazing-fast performance.
                            Configure complex builds with drag-and-drop simplicity.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-400">
                            <Link
                                to="/docs/getting-started/introduction"
                                className="group px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/50 flex items-center gap-2"
                            >
                                Get Started
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/builder"
                                className="px-8 py-4 bg-background hover:bg-accent border-2 border-primary/20 rounded-xl font-semibold text-lg transition-all hover:scale-105 hover:border-primary/50 flex items-center gap-2"
                            >
                                <Rocket className="h-5 w-5" />
                                Try Visual Builder
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary">10x</div>
                                <div className="text-sm text-muted-foreground mt-1">Faster Builds</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary">50%</div>
                                <div className="text-sm text-muted-foreground mt-1">Smaller Bundles</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary">100%</div>
                                <div className="text-sm text-muted-foreground mt-1">Type Safe</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-card/50">
                <div className="container mx-auto px-4 sm:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Why NextGen Build Tool?</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Everything you need for modern web development, in one powerful tool
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {features.map((feature, index) => {
                            const Icon = feature.icon
                            return (
                                <div
                                    key={index}
                                    className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Framework Support */}
            <section className="py-20">
                <div className="container mx-auto px-4 sm:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Works With Your Stack</h2>
                        <p className="text-xl text-muted-foreground">
                            Seamless integration with all modern frameworks and tools
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
                        {frameworks.map((framework, index) => (
                            <div
                                key={index}
                                className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:scale-110 cursor-pointer"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${framework.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />
                                <div className="relative text-center">
                                    <div className="text-4xl mb-2">{framework.icon}</div>
                                    <div className="text-sm font-medium">{framework.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 bg-gradient-to-br from-primary/10 to-purple-500/10">
                <div className="container mx-auto px-4 sm:px-8 text-center">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                        Ready to Transform Your Workflow?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Join developers who are building faster with NextGen
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/docs/getting-started/introduction"
                            className="group px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center gap-2"
                        >
                            Read Documentation
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/builder"
                            className="px-8 py-4 bg-background hover:bg-accent border-2 border-primary/20 rounded-xl font-semibold text-lg transition-all hover:scale-105"
                        >
                            Start Building →
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
