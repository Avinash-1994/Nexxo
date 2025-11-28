import { useState } from 'react'
import { Share2, Link2, Copy, QrCode, X, CheckCircle, Clock, Lock } from 'lucide-react'
import { usePipelineStore } from '../../../stores/pipelineStore'
import QRCodeLib from 'qrcode'

export default function ShareDialog({ onClose }) {
    const { nodes, edges, name: pipelineName } = usePipelineStore()
    const [shareMode, setShareMode] = useState('readonly') // readonly, editable
    const [expiration, setExpiration] = useState('never') // 1h, 24h, 7d, never
    const [shareUrl, setShareUrl] = useState('')
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const [copied, setCopied] = useState(false)

    const generateShareUrl = async () => {
        // Create pipeline data
        const pipelineData = {
            version: '1.0.0',
            name: pipelineName || 'Shared Pipeline',
            nodes,
            edges,
            mode: shareMode,
            expires: expiration !== 'never' ? calculateExpiration(expiration) : null
        }

        // Base64 encode the pipeline data
        const encodedData = btoa(JSON.stringify(pipelineData))

        // Generate share URL
        const baseUrl = window.location.origin
        const url = `${baseUrl}/share/${encodedData}`

        setShareUrl(url)

        // Generate QR code
        try {
            const qr = await QRCodeLib.toDataURL(url, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#6366f1',
                    light: '#ffffff'
                }
            })
            setQrCodeUrl(qr)
        } catch (error) {
            console.error('Failed to generate QR code:', error)
        }
    }

    const calculateExpiration = (period) => {
        const now = new Date()
        switch (period) {
            case '1h':
                return new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString()
            case '24h':
                return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
            case '7d':
                return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
            default:
                return null
        }
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
        }
    }

    const handleGenerate = () => {
        generateShareUrl()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <Share2 className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">Share Pipeline</h2>
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
                    {/* Share Mode */}
                    <div>
                        <label className="block text-sm font-medium mb-3">Access Permission</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShareMode('readonly')}
                                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${shareMode === 'readonly'
                                    ? 'border-primary bg-primary/10'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Lock className="h-5 w-5" />
                                <div className="text-left">
                                    <p className="font-medium">Read Only</p>
                                    <p className="text-xs text-gray-500">View but can't edit</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setShareMode('editable')}
                                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${shareMode === 'editable'
                                    ? 'border-primary bg-primary/10'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Share2 className="h-5 w-5" />
                                <div className="text-left">
                                    <p className="font-medium">Editable</p>
                                    <p className="text-xs text-gray-500">Can view and edit</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Expiration */}
                    <div>
                        <label className="block text-sm font-medium mb-3">Link Expiration</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['1h', '24h', '7d', 'never'].map((exp) => (
                                <button
                                    key={exp}
                                    onClick={() => setExpiration(exp)}
                                    className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${expiration === exp
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {exp === '1h' && '1 Hour'}
                                    {exp === '24h' && '24 Hours'}
                                    {exp === '7d' && '7 Days'}
                                    {exp === 'never' && 'Never'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    {!shareUrl && (
                        <button
                            onClick={handleGenerate}
                            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <Link2 className="h-5 w-5" />
                            Generate Share Link
                        </button>
                    )}

                    {/* Share URL */}
                    {shareUrl && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Share URL</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={shareUrl}
                                        readOnly
                                        className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono"
                                    />
                                    <button
                                        onClick={handleCopy}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span className="text-sm">Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4" />
                                                <span className="text-sm">Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {expiration === 'never' ? 'Never expires' : `Expires in ${expiration}`}
                                </p>
                            </div>

                            {/* QR Code */}
                            {qrCodeUrl && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">QR Code</label>
                                    <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                                    </div>
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Scan to open on mobile device
                                    </p>
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-blue-900 dark:text-blue-100">
                                        {shareMode === 'readonly' ? 'Read-only link' : 'Editable link'}
                                    </p>
                                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                                        {shareMode === 'readonly'
                                            ? 'Recipients can view and copy this pipeline but cannot make changes.'
                                            : 'Recipients can view and edit this pipeline. Changes are local to their session.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        {shareUrl ? 'Done' : 'Cancel'}
                    </button>
                </div>
            </div>
        </div>
    )
}
