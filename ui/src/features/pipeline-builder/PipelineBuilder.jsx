import { useState, useEffect, useCallback, useMemo } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Save, Download, Upload, Trash2, Code, BarChart3, Undo2, Redo2, FolderOpen, Bug, Share2, Menu, X } from 'lucide-react'
import { usePipelineStore } from '../../stores/pipelineStore'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { Button } from '../../components/ui/Button'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useAutoSave } from '../../hooks/usePersistence'
import { useIsMobile } from '../../hooks/useMediaQuery'
import Storage from '../../lib/storage'
import NodeLibrary from './components/NodeLibrary'
import PipelineCanvas from './components/PipelineCanvas'
import PropertyPanel from './components/PropertyPanel'
import ConfigEditor from './components/ConfigEditor'
import BuildControls from './components/BuildControls'
import Analytics from './components/Analytics'
import SaveDialog from './components/SaveDialog'
import PipelineManager from './components/PipelineManager'
import SaveStatus from './components/SaveStatus'
import StateInspector from '../../components/debug/StateInspector'
import WelcomeModal from '../../components/onboarding/WelcomeModal'
import ProductTour from '../../components/onboarding/ProductTour'
import ExportDialog from './components/ExportDialog'
import BottomSheet from '../../components/mobile/BottomSheet'
import ImportDialog from './components/ImportDialog'
import ShareDialog from './components/ShareDialog'

export default function PipelineBuilder() {
    const { nodes, edges, generateConfig, reset, undo, redo, canUndo, canRedo, selectedNode, deleteNode, initHistory, clearSelection, loadConfig } = usePipelineStore()
    const { hasSeenWelcome, showWelcome, showTour, setWelcomeSeen, startTour, completeTour, skipTour } = useOnboardingStore()
    const isMobile = useIsMobile()
    const [showConfigEditor, setShowConfigEditor] = useState(false)
    const [showAnalytics, setShowAnalytics] = useState(false)
    const [showSaveDialog, setShowSaveDialog] = useState(false)
    const [showPipelineManager, setShowPipelineManager] = useState(false)
    const [showStateInspector, setShowStateInspector] = useState(false)
    const [showExportDialog, setShowExportDialog] = useState(false)
    const [showImportDialog, setShowImportDialog] = useState(false)
    const [showNodeLibrary, setShowNodeLibrary] = useState(!isMobile)
    const [showPropertyPanel, setShowPropertyPanel] = useState(false)
    const [showShareDialog, setShowShareDialog] = useState(false)
    const [currentPipelineId, setCurrentPipelineId] = useState(null)
    const [currentPipelineName, setCurrentPipelineName] = useState('')

    // Restore autosave with useCallback
    const restoreAutosave = useCallback(async () => {
        try {
            const autosaved = await Storage.getAutosavedPipeline()
            if (autosaved && autosaved.nodes && autosaved.nodes.length > 0) {
                const shouldRestore = confirm(
                    'Found an auto-saved pipeline. Would you like to restore it?'
                )
                if (shouldRestore) {
                    loadConfig(autosaved)
                }
            }
        } catch (err) {
            console.error('Error restoring autosave:', err)
        }
    }, [loadConfig])

    // Initialize history on mount
    useEffect(() => {
        initHistory()
        restoreAutosave()

        // Show welcome modal for first-time users
        if (!hasSeenWelcome) {
            // Delay slightly to ensure UI is rendered
            setTimeout(() => {
                useOnboardingStore.setState({ showWelcome: true })
            }, 1000)
        }
    }, [initHistory, restoreAutosave, hasSeenWelcome])

    // Memoize pipeline data to avoid calling generateConfig on every render
    const pipelineData = useMemo(() => {
        try {
            return { nodes, edges, config: generateConfig() }
        } catch (error) {
            console.error('Error generating config:', error)
            return { nodes, edges, config: {} }
        }
    }, [nodes, edges, generateConfig])

    // Auto-save pipeline every 5 seconds
    const { isSaving, lastSaved, error: saveError } = useAutoSave(
        pipelineData,
        async (data) => {
            await Storage.autosavePipeline(data)
        },
        {
            interval: 5000,
            enabled: nodes.length > 0, // Only auto-save if there are nodes
        }
    )

    const handleSaveAs = async ({ name, description }) => {
        const config = generateConfig()
        const pipelineData = {
            name,
            description,
            pipeline: config.pipeline,
            connections: config.connections,
        }

        try {
            const id = await Storage.db.savePipeline(pipelineData)
            setCurrentPipelineId(id)
            setCurrentPipelineName(name)
            alert(`Pipeline "${name}" saved successfully!`)
        } catch (err) {
            throw new Error('Failed to save pipeline')
        }
    }

    const handleSave = () => {
        if (currentPipelineId) {
            // Update existing pipeline
            handleSaveAs({
                id: currentPipelineId,
                name: currentPipelineName || 'Untitled Pipeline',
                description: '',
            })
        } else {
            // Show save dialog for new pipeline
            setShowSaveDialog(true)
        }
    }

    const handleLoadPipeline = (pipeline) => {
        loadConfig({
            pipeline: pipeline.pipeline,
            connections: pipeline.connections,
        })
        setCurrentPipelineId(pipeline.id)
        setCurrentPipelineName(pipeline.name)
    }

    const handleExport = () => {
        const config = generateConfig()
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${currentPipelineName || 'pipeline'}.json`.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleImport = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = (e) => {
            const file = e.target.files[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (event) => {
                    try {
                        const config = JSON.parse(event.target.result)
                        loadConfig(config)
                        setCurrentPipelineId(null)
                        setCurrentPipelineName(config.name || '')
                        alert('Configuration loaded successfully!')
                    } catch (err) {
                        alert('Error loading configuration: ' + err.message)
                    }
                }
                reader.readAsText(file)
            }
        }
        input.click()
    }

    const handleClear = () => {
        if (confirm('Are you sure you want to clear the pipeline?')) {
            reset()
            setCurrentPipelineId(null)
            setCurrentPipelineName('')
        }
    }

    const handleDelete = () => {
        if (selectedNode) {
            deleteNode(selectedNode.id)
        }
    }

    // Onboarding handlers
    const handleWelcomeClose = (dontShowAgain) => {
        if (dontShowAgain) {
            setWelcomeSeen()
        }
        useOnboardingStore.setState({ showWelcome: false })
    }

    const handleStartTour = () => {
        startTour()
    }

    const handleTourComplete = () => {
        completeTour()
    }

    const handleTourSkip = () => {
        skipTour()
    }

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onUndo: () => canUndo() && undo(),
        onRedo: () => canRedo() && redo(),
        onSave: handleSave,
        onNew: handleClear,
        onDelete: handleDelete,
        onEscape: clearSelection,
        onDebug: () => setShowStateInspector(!showStateInspector),
    })

    // Save status
    const saveStatus = saveError ? 'error' : isSaving ? 'saving' : lastSaved ? 'saved' : nodes.length > 0 ? 'unsaved' : null

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header with Toolbar */}
            <div className="border-b bg-card px-3 sm:px-4 py-2 sm:py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        {/* Mobile node library toggle */}
                        {isMobile && (
                            <button
                                onClick={() => setShowNodeLibrary(true)}
                                className="p-2 hover:bg-accent rounded-lg transition-colors shrink-0"
                                aria-label="Show node library"
                            >
                                <Menu className="h-4 w-4" />
                            </button>
                        )}

                        <div className="min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <h1 className="text-lg sm:text-2xl font-bold truncate">
                                    {currentPipelineName || 'Pipeline Builder'}
                                </h1>
                                {!isMobile && saveStatus && <SaveStatus status={saveStatus} lastSaved={lastSaved} />}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                {nodes.length} node{nodes.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Desktop toolbar */}
                    {!isMobile && (
                        <div className="flex items-center gap-2" role="toolbar" aria-label="Pipeline actions">
                            {/* Undo/Redo */}
                            <div className="flex items-center gap-1 mr-2 pr-2 border-r">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={undo}
                                    disabled={!canUndo()}
                                    title="Undo (Ctrl+Z)"
                                    aria-label="Undo last action (Ctrl+Z)"
                                    aria-disabled={!canUndo()}
                                >
                                    <Undo2 className="h-4 w-4" aria-hidden="true" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={redo}
                                    disabled={!canRedo()}
                                    title="Redo (Ctrl+Y)"
                                    aria-label="Redo last action (Ctrl+Y)"
                                    aria-disabled={!canRedo()}
                                >
                                    <Redo2 className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            </div>

                            <Button
                                variant={showAnalytics ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setShowAnalytics(!showAnalytics)}
                                aria-label={`${showAnalytics ? 'Hide' : 'Show'} analytics panel`}
                                aria-pressed={showAnalytics}
                            >
                                <BarChart3 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                                {showAnalytics ? 'Hide' : 'Show'} Analytics
                            </Button>
                            <Button
                                variant={showConfigEditor ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setShowConfigEditor(!showConfigEditor)}
                                aria-label={`${showConfigEditor ? 'Hide' : 'Show'} configuration editor`}
                                aria-pressed={showConfigEditor}
                            >
                                <Code className="h-4 w-4 mr-1.5" aria-hidden="true" />
                                {showConfigEditor ? 'Hide' : 'Show'} Config
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPipelineManager(true)}
                                aria-label="Open saved pipeline"
                            >
                                <FolderOpen className="h-4 w-4 mr-1.5" aria-hidden="true" />
                                Open
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowImportDialog(true)}
                                aria-label="Import pipeline from file"
                            >
                                <Upload className="h-4 w-4 mr-1.5" aria-hidden="true" />
                                Import
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowExportDialog(true)}
                                aria-label="Export pipeline to file"
                            >
                                <Download className="h-4 w-4 mr-1.5" aria-hidden="true" />
                                Export
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowShareDialog(true)}
                                aria-label="Share pipeline with others"
                            >
                                <Share2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                                Share
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClear}
                                aria-label="Clear all nodes from pipeline"
                            >
                                <Trash2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                                Clear
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                aria-label={currentPipelineId ? 'Save pipeline' : 'Save pipeline as new'}
                            >
                                <Save className="h-4 w-4 mr-1.5" aria-hidden="true" />
                                {currentPipelineId ? 'Save' : 'Save As...'}
                            </Button>
                        </div>
                    )}

                    {/* Mobile compact toolbar */}
                    {isMobile && (
                        <div className="flex items-center gap-1" role="toolbar" aria-label="Quick actions">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={undo}
                                disabled={!canUndo()}
                                aria-label="Undo"
                                aria-disabled={!canUndo()}
                            >
                                <Undo2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={redo}
                                disabled={!canRedo()}
                                aria-label="Redo"
                                aria-disabled={!canRedo()}
                            >
                                <Redo2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                aria-label="Save pipeline"
                            >
                                <Save className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content - Full Screen Relative Container */}
            <div className="relative flex-1 h-[calc(100vh-4rem)] overflow-hidden">

                {/* Canvas Layer - Absolute Full Screen */}
                <div className="absolute inset-0 z-0">
                    <ReactFlowProvider>
                        <PipelineCanvas />
                    </ReactFlowProvider>
                </div>

                {/* Floating Node Library - Left Side */}
                {!isMobile && (
                    <div className="absolute left-4 top-4 bottom-4 z-10 w-64 pointer-events-none">
                        <div className="h-full bg-background/80 backdrop-blur-md border shadow-lg rounded-xl overflow-hidden pointer-events-auto flex flex-col">
                            <NodeLibrary />
                        </div>
                    </div>
                )}

                {/* Floating Property Panel - Right Side */}
                {!isMobile && selectedNode && (
                    <div className="absolute right-4 top-4 bottom-20 z-10 w-80 pointer-events-none">
                        <div className="h-full bg-background/80 backdrop-blur-md border shadow-lg rounded-xl overflow-hidden pointer-events-auto">
                            <PropertyPanel />
                        </div>
                    </div>
                )}

                {/* Mobile Controls */}
                {isMobile && (
                    <>
                        {/* Mobile Node Library Drawer would go here or use existing drawer logic */}
                        {selectedNode && !showPropertyPanel && (
                            <button
                                onClick={() => setShowPropertyPanel(true)}
                                className="absolute bottom-20 right-4 z-20 p-3 bg-primary text-primary-foreground rounded-full shadow-lg"
                                aria-label="Show properties"
                            >
                                <Code className="h-5 w-5" />
                            </button>
                        )}
                    </>
                )}

                {/* Floating Build Controls - Bottom */}
                {(showConfigEditor || nodes.length > 0) && (
                    <div className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 ${showConfigEditor ? 'h-80' : 'h-auto'}`}>
                        <div className="mx-4 mb-4 bg-background/90 backdrop-blur-md border shadow-lg rounded-xl overflow-hidden">
                            {showConfigEditor ? (
                                <ConfigEditor />
                            ) : (
                                <div className="p-2">
                                    <BuildControls />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Analytics Overlay - Top Right (if needed) */}
                {showAnalytics && (
                    <div className="absolute top-4 right-4 z-10 w-80 pointer-events-none">
                        <div className="bg-background/80 backdrop-blur-md border shadow-lg rounded-xl p-4 pointer-events-auto">
                            <Analytics />
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Node Library Drawer */}
            {
                isMobile && (
                    <BottomSheet
                        isOpen={showNodeLibrary}
                        onClose={() => setShowNodeLibrary(false)}
                        title="Node Library"
                        height="h-[70vh]"
                    >
                        <NodeLibrary />
                    </BottomSheet>
                )
            }

            {/* Mobile Property Panel */}
            {
                isMobile && selectedNode && (
                    <BottomSheet
                        isOpen={showPropertyPanel}
                        onClose={() => setShowPropertyPanel(false)}
                        title="Node Properties"
                        height="auto"
                    >
                        <PropertyPanel />
                    </BottomSheet>
                )
            }

            {/* Dialogs */}
            <SaveDialog
                isOpen={showSaveDialog}
                onClose={() => setShowSaveDialog(false)}
                onSave={handleSaveAs}
                initialName={currentPipelineName}
            />
            <PipelineManager
                isOpen={showPipelineManager}
                onClose={() => setShowPipelineManager(false)}
                onLoad={handleLoadPipeline}
            />
            <StateInspector
                isOpen={showStateInspector}
                onClose={() => setShowStateInspector(false)}
            />

            {/* Onboarding */}
            <WelcomeModal
                isOpen={showWelcome}
                onClose={handleWelcomeClose}
                onStartTour={handleStartTour}
            />
            <ProductTour
                run={showTour}
                onComplete={handleTourComplete}
                onSkip={handleTourSkip}
            />

            {/* Collaboration Dialogs */}
            {showExportDialog && <ExportDialog onClose={() => setShowExportDialog(false)} />}
            {showImportDialog && <ImportDialog onClose={() => setShowImportDialog(false)} />}
            {showShareDialog && <ShareDialog onClose={() => setShowShareDialog(false)} />}
        </div >
    )
}
