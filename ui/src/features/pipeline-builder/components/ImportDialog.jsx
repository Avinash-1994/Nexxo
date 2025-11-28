import { useState, useRef } from 'react'
import { Upload, FileJson, AlertCircle, CheckCircle, X } from 'lucide-react'
import { usePipelineStore } from '../../../stores/pipelineStore'

export default function ImportDialog({ onClose }) {
    const { nodes, edges, setNodes, setEdges, setName } = usePipelineStore()
    const [file, setFile] = useState(null)
    const [importData, setImportData] = useState(null)
    const [validationError, setValidationError] = useState(null)
    const [mergeMode, setMergeMode] = useState('replace') // replace, merge, new
    const fileInputRef = useRef(null)

    const validatePipeline = (data) => {
        // Check required fields
        if (!data.nodes || !Array.isArray(data.nodes)) {
            return 'Invalid format: nodes array is required'
        }
        if (!data.edges || !Array.isArray(data.edges)) {
            return 'Invalid format: edges array is required'
        }

        // Validate nodes
        for (const node of data.nodes) {
            if (!node.id || !node.type || !node.position) {
                return 'Invalid node format: id, type, and position are required'
            }
        }

        // Validate edges
        for (const edge of data.edges) {
            if (!edge.id || !edge.source || !edge.target) {
                return 'Invalid edge format: id, source, and target are required'
            }
        }

        return null
    }

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0]
        if (!selectedFile) return

        setFile(selectedFile)
        setValidationError(null)

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target.result
                let data

                // Parse based on file extension
                if (selectedFile.name.endsWith('.json')) {
                    data = JSON.parse(content)
                } else if (selectedFile.name.endsWith('.yaml') || selectedFile.name.endsWith('.yml')) {
                    // For YAML, we'd need a YAML parser library
                    // For now, just show error
                    setValidationError('YAML import not yet implemented. Please use JSON format.')
                    return
                } else if (selectedFile.name.endsWith('.ts') || selectedFile.name.endsWith('.js')) {
                    // For TypeScript/JS config files, we'd need to parse them differently
                    setValidationError('TypeScript/JavaScript import not yet implemented. Please use JSON format.')
                    return
                } else {
                    // Try parsing as JSON anyway
                    data = JSON.parse(content)
                }

                // Validate the data
                const error = validatePipeline(data)
                if (error) {
                    setValidationError(error)
                    return
                }

                setImportData(data)
            } catch (error) {
                setValidationError(`Failed to parse file: ${error.message}`)
            }
        }
        reader.readAsText(selectedFile)
    }

    const handleImport = () => {
        if (!importData) return

        switch (mergeMode) {
            case 'replace':
                // Replace entire pipeline
                setNodes(importData.nodes)
                setEdges(importData.edges)
                if (importData.name) {
                    setName(importData.name)
                }
                break

            case 'merge':
                // Merge with existing pipeline
                const newNodes = [...nodes, ...importData.nodes.map(node => ({
                    ...node,
                    id: `${node.id}_imported_${Date.now()}`, // Avoid ID conflicts
                    position: {
                        x: node.position.x + 200, // Offset to avoid overlap
                        y: node.position.y + 200
                    }
                }))]

                const newEdges = [...edges, ...importData.edges.map(edge => ({
                    ...edge,
                    id: `${edge.id}_imported_${Date.now()}`,
                    source: `${edge.source}_imported_${Date.now()}`,
                    target: `${edge.target}_imported_${Date.now()}`
                }))]

                setNodes(newNodes)
                setEdges(newEdges)
                break

            case 'new':
                // Create new pipeline (would need to implement pipeline management)
                // For now, just replace
                setNodes(importData.nodes)
                setEdges(importData.edges)
                if (importData.name) {
                    setName(`${importData.name} (Copy)`)
                }
                break
        }

        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <Upload className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">Import Pipeline</h2>
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
                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-3">Select File</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                        >
                            <FileJson className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                            {file ? (
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                                    <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">
                                        Click to select a file
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Supports: JSON (.json)
                                    </p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json,.yaml,.yml,.ts,.js"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Validation Status */}
                    {validationError && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-900 dark:text-red-100">Validation Error</p>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{validationError}</p>
                            </div>
                        </div>
                    )}

                    {importData && !validationError && (
                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-green-900 dark:text-green-100">Valid Pipeline</p>
                                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                    {importData.nodes.length} nodes, {importData.edges.length} connections
                                    {importData.name && ` • ${importData.name}`}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Merge Mode */}
                    {importData && !validationError && (
                        <div>
                            <label className="block text-sm font-medium mb-3">Import Mode</label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                    <input
                                        type="radio"
                                        name="mergeMode"
                                        value="replace"
                                        checked={mergeMode === 'replace'}
                                        onChange={(e) => setMergeMode(e.target.value)}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <div>
                                        <p className="font-medium">Replace Current Pipeline</p>
                                        <p className="text-xs text-gray-500">
                                            Discard current pipeline and load the imported one
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                    <input
                                        type="radio"
                                        name="mergeMode"
                                        value="merge"
                                        checked={mergeMode === 'merge'}
                                        onChange={(e) => setMergeMode(e.target.value)}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <div>
                                        <p className="font-medium">Merge with Current</p>
                                        <p className="text-xs text-gray-500">
                                            Add imported nodes to the existing pipeline
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                    <input
                                        type="radio"
                                        name="mergeMode"
                                        value="new"
                                        checked={mergeMode === 'new'}
                                        onChange={(e) => setMergeMode(e.target.value)}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <div>
                                        <p className="font-medium">Create New Pipeline</p>
                                        <p className="text-xs text-gray-500">
                                            Save current and create a new pipeline from import
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
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
                        onClick={handleImport}
                        disabled={!importData || validationError}
                        className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Upload className="h-4 w-4" />
                        Import
                    </button>
                </div>
            </div>
        </div>
    )
}
