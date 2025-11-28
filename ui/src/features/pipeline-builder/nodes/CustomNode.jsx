import { Handle, Position } from '@xyflow/react'
import { Settings, Trash2 } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { usePipelineStore } from '../../../stores/pipelineStore'

const nodeIcons = {
    resolver: '🔍',
    transformer: '⚙️',
    bundler: '📦',
    optimizer: '⚡',
    plugin: '🔌',
    microfrontend: '🧩',
    ai: '🤖',
}

const nodeColors = {
    resolver: 'bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-700',
    transformer: 'bg-purple-50 border-purple-300 dark:bg-purple-950 dark:border-purple-700',
    bundler: 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700',
    optimizer: 'bg-yellow-50 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-700',
    plugin: 'bg-pink-50 border-pink-300 dark:bg-pink-950 dark:border-pink-700',
    microfrontend: 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950 dark:border-indigo-700',
    ai: 'bg-cyan-50 border-cyan-300 dark:bg-cyan-950 dark:border-cyan-700',
}

export default function CustomNode({ id, data, selected }) {
    const { deleteNode, selectNode } = usePipelineStore()
    const nodeType = data.type || 'default'
    const icon = nodeIcons[nodeType] || '📋'
    const colorClass = nodeColors[nodeType] || 'bg-gray-50 border-gray-300'

    const handleDelete = (e) => {
        e.stopPropagation()
        deleteNode(id)
    }

    const handleSettings = (e) => {
        e.stopPropagation()
        selectNode(id)
    }

    return (
        <div
            className={cn(
                'px-4 py-3 shadow-md rounded-lg border-2 min-w-[180px]',
                'bg-white dark:bg-gray-950', // Fallback background
                colorClass,
                selected && 'ring-2 ring-primary ring-offset-2'
            )}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 !bg-primary"
            />

            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-2xl">{icon}</span>
                    <div>
                        <div className="text-sm font-semibold text-black dark:text-white">
                            {data.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {nodeType}
                        </div>
                    </div>
                </div>

                <div className="flex gap-1">
                    <button
                        onClick={handleSettings}
                        className="p-1 hover:bg-background/50 rounded transition-colors"
                        title="Settings"
                    >
                        <Settings className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-1 hover:bg-destructive/20 rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                </div>
            </div>

            {data.config && Object.keys(data.config).length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                    {Object.keys(data.config).length} config{Object.keys(data.config).length !== 1 ? 's' : ''}
                </div>
            )}

            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 !bg-primary"
            />
        </div>
    )
}
