import React from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';

interface CodeBlockProps {
    code: string;
    language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
    const [copied, setCopied] = React.useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group rounded-xl overflow-hidden bg-slate-900 border border-slate-800 my-6 shadow-xl">
            {language && (
                <div className="absolute left-6 top-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
                    {language}
                </div>
            )}
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                    title="Copy to clipboard"
                    aria-label={copied ? "Copied" : "Copy code"}
                >
                    {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
            </div>
            <pre className="p-6 pt-10 text-sm font-mono text-blue-400 overflow-x-auto leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    );
};
