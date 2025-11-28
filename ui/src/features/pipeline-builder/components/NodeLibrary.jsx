import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { usePipelineStore } from '../../../stores/pipelineStore'

const nodeTemplates = [
    {
        type: 'resolver',
        label: 'Resolver',
        description: 'Resolve module paths and dependencies',
        icon: '🔍',
        category: 'Input',
    },
    {
        type: 'transformer',
        label: 'Transformer',
        description: 'Transform and transpile source code',
        icon: '⚙️',
        category: 'Transform',
    },
    {
        type: 'bundler',
        label: 'Bundler',
        description: 'Bundle modules together',
        icon: '📦',
        category: 'Build',
    },
    {
        type: 'optimizer',
        label: 'Optimizer',
        description: 'Optimize and minify output',
        icon: '⚡',
        category: 'Build',
    },
    {
        type: 'plugin',
        label: 'Plugin',
        description: 'Custom plugin integration',
        icon: '🔌',
        category: 'Extension',
    },
    {
        type: 'microfrontend',
        label: 'Micro Frontend',
        description: 'Module federation setup',
        icon: '🏗️',
        category: 'Architecture',
    },
    {
        type: 'ai',
        label: 'AI Assistant',
        description: 'AI-powered optimization',
        icon: '🤖',
        category: 'Advanced',
    },
]

export default function NodeLibrary() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const { addNode } = usePipelineStore()

    const categories = ['All', ...new Set(nodeTemplates.map((n) => n.category))]

    const filteredTemplates = nodeTemplates.filter((template) => {
        const matchesSearch =
            template.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const handleDragStart = (event, template) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(template))
        event.dataTransfer.effectAllowed = 'move'
    }

    const handleAddNode = (template) => {
        const newNode = {
            id: `${template.type}_${Date.now()}`,
            type: 'custom',
            position: {
                x: Math.random() * 300 + 100,
                y: Math.random() * 300 + 100,
            },
            data: {
                label: template.label,
                type: template.type,
                config: {},
            },
        }
        addNode(newNode)
    }

    return (
        <div className="node-library h-full p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Node Library</h2>

            {/* Search */}
            <div className="relative mb-3">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search nodes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {/* Category Filter */}
            <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${selectedCategory === category
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary hover:bg-secondary/80'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Node Templates */}
            <div className="space-y-2">
                {filteredTemplates.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-4">
                        No nodes found
                    </div>
                ) : (
                    filteredTemplates.map((template) => (
                        <div
                            key={template.type}
                            draggable
                            onDragStart={(e) => handleDragStart(e, template)}
                            className="group cursor-move bg-card border rounded-lg p-3 hover:border-primary hover:shadow-sm transition-all"
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-2xl">{template.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{template.label}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-2">
                                        {template.description}
                                    </div>
                                    <div className="mt-1">
                                        <span className="text-xs px-1.5 py-0.5 bg-secondary rounded">
                                            {template.category}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAddNode(template)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
                                    title="Add to canvas"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
