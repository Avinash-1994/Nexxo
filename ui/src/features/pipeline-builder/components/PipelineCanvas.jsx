import { useState, useCallback } from 'react'
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { usePipelineStore } from '../../../stores/pipelineStore'
import CustomNode from '../nodes/CustomNode'

const nodeTypes = {
    custom: CustomNode,
}

export default function PipelineCanvas() {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
    } = usePipelineStore()
    const { screenToFlowPosition } = useReactFlow()

    const onDragOver = useCallback((event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback(
        (event) => {
            event.preventDefault()

            const type = event.dataTransfer.getData('application/reactflow')

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return
            }

            const template = JSON.parse(type)
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            })

            const newNode = {
                id: `${template.type}_${Date.now()}`,
                type: 'custom',
                position,
                data: {
                    label: template.label,
                    type: template.type,
                    config: {},
                },
            }

            addNode(newNode)
        },
        [addNode, screenToFlowPosition],
    )

    return (
        <div className="w-full h-full bg-background">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodeTypes={nodeTypes}
                fitView
                className="bg-background"
                style={{ width: '100%', height: '100%' }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={16}
                    size={1}
                    className="bg-background"
                />
                <Controls className="bg-card border" />
                <MiniMap
                    className="bg-card border"
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                />
            </ReactFlow>
        </div>
    )
}
