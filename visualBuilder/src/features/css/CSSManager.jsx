import { useState, useEffect } from 'react'
import { Check, AlertCircle, Palette, ArrowRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function CSSManager() {
    const [config, setConfig] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedFramework, setSelectedFramework] = useState(null)

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/config')
            if (!res.ok) throw new Error('Failed to fetch config')
            const data = await res.json()
            setConfig(data)
            // Detect current framework from config or default to none
            // This is a simplification; real detection logic is on server
            // We assume the server might send a 'css' field in config or we infer it
            setSelectedFramework(data.css?.framework || 'none')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const frameworks = [
        {
            id: 'tailwind',
            name: 'Tailwind CSS',
            description: 'Utility-first CSS framework for rapid UI development.',
            icon: '🌊',
            color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
        },
        {
            id: 'bootstrap',
            name: 'Bootstrap',
            description: 'Powerful, extensible, and feature-packed frontend toolkit.',
            icon: '🅱️',
            color: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
        },
        {
            id: 'bulma',
            name: 'Bulma',
            description: 'Modern CSS framework based on Flexbox.',
            icon: '📗',
            color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        },
        {
            id: 'material',
            name: 'Material UI',
            description: 'React components that implement Google\'s Material Design.',
            icon: 'Ⓜ️',
            color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        }
    ]

    const handleInstall = async (frameworkId) => {
        // In a real app, this would call an API to install the framework
        // For now, we just update local state to simulate
        console.log(`Installing ${frameworkId}...`)
        setSelectedFramework(frameworkId)

        // Optimistic update
        if (config) {
            const newConfig = { ...config, css: { framework: frameworkId } }
            setConfig(newConfig)
            // Sync with server
            try {
                await fetch('http://localhost:3000/api/config', {
                    method: 'POST',
                    body: JSON.stringify(newConfig)
                })
            } catch (e) {
                console.error('Failed to save config', e)
            }
        }
    }

    if (loading) return <div className="p-8">Loading...</div>
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>

    return (
        <div className="container max-w-5xl py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">CSS Frameworks</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your project's styling foundation. Select a framework to automatically configure it.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {frameworks.map((fw) => {
                    const isSelected = selectedFramework === fw.id
                    return (
                        <div
                            key={fw.id}
                            className={cn(
                                "relative flex flex-col p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md cursor-pointer",
                                isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50 bg-card"
                            )}
                            onClick={() => !isSelected && handleInstall(fw.id)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={cn("p-3 rounded-lg", fw.color)}>
                                    <span className="text-2xl">{fw.icon}</span>
                                </div>
                                {isSelected && (
                                    <div className="flex items-center gap-1 text-primary font-medium text-sm bg-background px-2 py-1 rounded-full border">
                                        <Check className="w-4 h-4" />
                                        Active
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-semibold mb-2">{fw.name}</h3>
                            <p className="text-muted-foreground text-sm flex-1 mb-4">
                                {fw.description}
                            </p>

                            {!isSelected && (
                                <button
                                    className="mt-auto flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
                                >
                                    Install <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Live Preview</h2>
                </div>
                <div className="p-8 border rounded-lg bg-background/50 flex items-center justify-center min-h-[200px]">
                    {selectedFramework === 'tailwind' && (
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Tailwind Button
                        </button>
                    )}
                    {selectedFramework === 'bootstrap' && (
                        <button className="btn btn-primary">
                            Bootstrap Button
                        </button>
                    )}
                    {selectedFramework === 'bulma' && (
                        <button className="button is-primary">
                            Bulma Button
                        </button>
                    )}
                    {selectedFramework === 'material' && (
                        <button className="MuiButton-root MuiButton-contained MuiButton-containedPrimary">
                            Material Button
                        </button>
                    )}
                    {(!selectedFramework || selectedFramework === 'none') && (
                        <button style={{ padding: '10px 20px', background: '#eee', border: '1px solid #ccc' }}>
                            Vanilla Button
                        </button>
                    )}
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                    * Preview is simulated. Actual styles depend on your project configuration.
                </p>
            </div>
        </div>
    )
}
