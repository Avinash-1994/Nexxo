import { X, Plus, Settings2 } from 'lucide-react'
import { usePipelineStore } from '../../../stores/pipelineStore'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'

const typeSpecificFields = {
    resolver: [
        { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: './src' },
        { key: 'extensions', label: 'Extensions', type: 'text', placeholder: '.js,.ts,.jsx,.tsx' },
        { key: 'alias', label: 'Alias (JSON)', type: 'textarea', placeholder: '{"@": "./src"}' },
    ],
    transformer: [
        { key: 'loader', label: 'Loader', type: 'select', options: ['babel', 'esbuild', 'swc'] },
        { key: 'target', label: 'Target', type: 'select', options: ['es2015', 'es2020', 'esnext'] },
        { key: 'jsx', label: 'JSX Runtime', type: 'select', options: ['automatic', 'classic'] },
    ],
    bundler: [
        { key: 'format', label: 'Format', type: 'select', options: ['esm', 'cjs', 'iife', 'umd'] },
        { key: 'splitting', label: 'Code Splitting', type: 'checkbox' },
        { key: 'external', label: 'External Deps', type: 'text', placeholder: 'react,react-dom' },
    ],
    optimizer: [
        { key: 'minify', label: 'Minify', type: 'checkbox' },
        { key: 'sourcemap', label: 'Source Maps', type: 'checkbox' },
        { key: 'treeShaking', label: 'Tree Shaking', type: 'checkbox' },
        { key: 'compression', label: 'Compression', type: 'select', options: ['none', 'gzip', 'brotli'] },
    ],
    plugin: [
        { key: 'plugins', label: 'Plugin List', type: 'textarea', placeholder: '["plugin1", "plugin2"]' },
        { key: 'pluginOrder', label: 'Execution Order', type: 'select', options: ['pre', 'normal', 'post'] },
    ],
    microfrontend: [
        { key: 'name', label: 'App Name', type: 'text', placeholder: 'my-app' },
        { key: 'exposes', label: 'Exposes (JSON)', type: 'textarea', placeholder: '{"./Button": "./src/Button"}' },
        { key: 'shared', label: 'Shared Deps', type: 'text', placeholder: 'react,react-dom' },
    ],
    ai: [
        { key: 'model', label: 'AI Model', type: 'select', options: ['gpt-4', 'claude-3', 'gemini-pro'] },
        { key: 'optimization', label: 'Optimization Level', type: 'select', options: ['low', 'medium', 'high'] },
        { key: 'autoFix', label: 'Auto-fix Errors', type: 'checkbox' },
    ],
}

export default function PropertyPanel() {
    const { selectedNode, updateNodeData, clearSelection } = usePipelineStore()

    if (!selectedNode) {
        return (
            <div className="w-80 border-l bg-card p-6">
                <div className="text-center text-muted-foreground">
                    <Settings2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Select a node to edit its properties</p>
                </div>
            </div>
        )
    }

    const handleLabelChange = (newLabel) => {
        updateNodeData(selectedNode.id, { label: newLabel })
    }

    const handleConfigChange = (key, value) => {
        const newConfig = { ...selectedNode.data.config, [key]: value }
        updateNodeData(selectedNode.id, { config: newConfig })
    }

    const handleDeleteConfigKey = (key) => {
        const newConfig = { ...selectedNode.data.config }
        delete newConfig[key]
        updateNodeData(selectedNode.id, { config: newConfig })
    }

    const handleAddConfigKey = () => {
        const key = prompt('Enter config key:')
        if (key && key.trim()) {
            handleConfigChange(key.trim(), '')
        }
    }

    const getConfigValue = (key) => {
        return selectedNode.data.config[key] || ''
    }

    const renderField = (field) => {
        const value = getConfigValue(field.key)

        switch (field.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleConfigChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-2 py-1.5 text-xs border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                )

            case 'textarea':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => handleConfigChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-2 py-1.5 text-xs border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                )

            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleConfigChange(field.key, e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Select...</option>
                        {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                )

            case 'checkbox':
                return (
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={value === true || value === 'true'}
                            onChange={(e) => handleConfigChange(field.key, e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-xs">Enabled</span>
                    </label>
                )

            default:
                return null
        }
    }

    const specificFields = typeSpecificFields[selectedNode.data.type] || []
    const customKeys = Object.keys(selectedNode.data.config).filter(
        key => !specificFields.find(f => f.key === key)
    )

    return (
        <Card className="w-full h-full border-0 rounded-none flex flex-col overflow-hidden bg-transparent shadow-none">
            <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Properties</CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSelection}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Node Label */}
                <div>
                    <label className="text-xs font-medium mb-1.5 block">Node Label</label>
                    <input
                        type="text"
                        value={selectedNode.data.label}
                        onChange={(e) => handleLabelChange(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Node Type */}
                <div>
                    <label className="text-xs font-medium mb-1.5 block">Type</label>
                    <div className="text-sm px-2 py-1.5 bg-secondary rounded-md capitalize">
                        {selectedNode.data.type}
                    </div>
                </div>

                {/* Type-Specific Configuration */}
                {specificFields.length > 0 && (
                    <div>
                        <label className="text-xs font-medium mb-2 block">Configuration</label>
                        <div className="space-y-3">
                            {specificFields.map(field => (
                                <div key={field.key}>
                                    <label className="text-xs text-muted-foreground mb-1 block">
                                        {field.label}
                                    </label>
                                    {renderField(field)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Custom Configuration Keys */}
                {customKeys.length > 0 && (
                    <div>
                        <label className="text-xs font-medium mb-2 block">Custom Config</label>
                        <div className="space-y-2">
                            {customKeys.map((key) => (
                                <div key={key} className="flex gap-2">
                                    <div className="flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">{key}</div>
                                        <input
                                            type="text"
                                            value={selectedNode.data.config[key]}
                                            onChange={(e) => handleConfigChange(key, e.target.value)}
                                            className="w-full px-2 py-1.5 text-xs border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteConfigKey(key)}
                                        className="mt-5"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Custom Config Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddConfigKey}
                    className="w-full"
                >
                    <Plus className="h-3 w-3 mr-1.5" />
                    Add Custom Config
                </Button>

                {/* Node Position */}
                <div className="pt-3 border-t">
                    <label className="text-xs font-medium mb-1.5 block">Position</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span className="text-muted-foreground">X:</span>{' '}
                            <span>{Math.round(selectedNode.position.x)}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Y:</span>{' '}
                            <span>{Math.round(selectedNode.position.y)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
