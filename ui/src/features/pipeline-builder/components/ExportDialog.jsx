import { useState } from 'react'
import { X, Download, Copy, Check } from 'lucide-react'
import { usePipelineStore } from '../../../stores/pipelineStore'

export default function ExportDialog({ onClose }) {
    const { nodes, edges, name: pipelineName } = usePipelineStore()
    const [format, setFormat] = useState('json')
    const [includeMetadata, setIncludeMetadata] = useState(true)
    const [includeDependencies, setIncludeDependencies] = useState(false)

    const exportData = {
        version: '1.0.0',
        name: pipelineName || 'Untitled Pipeline',
        description: 'Exported from NextGen Build Tool',
        nodes,
        edges,
        ...(includeMetadata && {
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                nodeCount: nodes.length,
                edgeCount: edges.length,
            }
        })
    }

    const handleExport = () => {
        let content = ''
        let filename = ''
        let mimeType = ''

        switch (format) {
            case 'json':
                content = JSON.stringify(exportData, null, 2)
                filename = `${pipelineName || 'pipeline'}.json`
                mimeType = 'application/json'
                break

            case 'yaml':
                // Simple YAML conversion
                content = convertToYAML(exportData)
                filename = `${pipelineName || 'pipeline'}.yaml`
                mimeType = 'text/yaml'
                break

            case 'typescript':
                content = convertToTypeScript(exportData)
                filename = `${pipelineName || 'pipeline'}.config.ts`
                mimeType = 'text/typescript'
                break
        }

        // Create download link
        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        onClose()
    }

    const convertToYAML = (data) => {
        // Simple YAML conversion (for basic structure)
        return `version: "${data.version}"
name: "${data.name}"
description: "${data.description}"

nodes:
${data.nodes.map(node => `  - id: "${node.id}"
    type: "${node.type}"
    position:
      x: ${node.position.x}
      y: ${node.position.y}
    data: ${JSON.stringify(node.data, null, 6).replace(/\n/g, '\n      ')}`).join('\n')}

edges:
${data.edges.map(edge => `  - id: "${edge.id}"
    source: "${edge.source}"
    target: "${edge.target}"`).join('\n')}
${data.metadata ? `
metadata:
  created: "${data.metadata.created}"
  modified: "${data.metadata.modified}"
  nodeCount: ${data.metadata.nodeCount}
  edgeCount: ${data.metadata.edgeCount}` : ''}`
    }

    const convertToTypeScript = (data) => {
        return `import { defineConfig } from '@nextgen/build-tool'

export default defineConfig({
  name: '${data.name}',
  description: '${data.description}',
  
  pipeline: [
${data.nodes.map(node => `    {
      type: '${node.type}',
      config: ${JSON.stringify(node.data.config || {}, null, 6).replace(/\n/g, '\n      ')}
    }`).join(',\n')}
  ],
  
  // Generated: ${new Date().toISOString()}
  // Nodes: ${data.nodes.length}, Edges: ${data.edges.length}
})
`
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <Download className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">Export Pipeline</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Format Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-3">Export Format</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setFormat('json')}
                                className={`flex items-center gap-2 p-4 rounded-lg border-2 transition-all ${format === 'json'
                                    ? 'border-primary bg-primary/10'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FileJson className="h-5 w-5" />
                                <span className="font-medium">JSON</span>
                            </button>
                            <button
                                onClick={() => setFormat('yaml')}
                                className={`flex items-center gap-2 p-4 rounded-lg border-2 transition-all ${format === 'yaml'
                                    ? 'border-primary bg-primary/10'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FileCode className="h-5 w-5" />
                                <span className="font-medium">YAML</span>
                            </button>
                            <button
                                onClick={() => setFormat('typescript')}
                                className={`flex items-center gap-2 p-4 rounded-lg border-2 transition-all ${format === 'typescript'
                                    ? 'border-primary bg-primary/10'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FileCode className="h-5 w-5" />
                                <span className="font-medium">TypeScript</span>
                            </button>
                        </div>
                    </div>

                    {/* Options */}
                    <div>
                        <label className="block text-sm font-medium mb-3">Export Options</label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={includeMetadata}
                                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm">Include metadata (creation date, node count, etc.)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={includeDependencies}
                                    onChange={(e) => setIncludeDependencies(e.target.checked)}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm">Include dependency information</span>
                            </label>
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Preview</label>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-48 overflow-auto">
                            <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                {format === 'json' && JSON.stringify(exportData, null, 2)}
                                {format === 'yaml' && convertToYAML(exportData)}
                                {format === 'typescript' && convertToTypeScript(exportData)}
                            </pre>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {nodes.length} nodes, {edges.length} connections
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>
        </div>
    )
}
