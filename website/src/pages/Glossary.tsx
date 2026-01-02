import React from 'react';
import {
    Book,
    Search,
    HelpCircle,
    Cpu,
    Layers,
    Network,
    Box,
    Share2
} from 'lucide-react';

const GlossaryItem = ({ term, definition, icon: Icon }: any) => (
    <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)]/50 group hover:border-blue-500/50 transition-all">
        <div className="flex items-center gap-3 mb-3">
            <div className="text-blue-500 group-hover:scale-110 transition-transform">
                <Icon size={20} />
            </div>
            <h3 className="text-xl font-bold font-display tracking-tight text-blue-600">{term}</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {definition}
        </p>
    </div>
);

export const Glossary: React.FC = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="mb-16">
                <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
                    Reference
                </div>
                <h1 className="text-5xl lg:text-7xl font-black font-display mb-8 tracking-tighter">
                    Glossary.
                </h1>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-4xl">
                    Deep technical definitions for the core concepts and terminologies used within the Urja Build Engine.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                <GlossaryItem
                    term="Build Graph"
                    definition="A directed acyclic graph representing every file (node) and import (edge) in the application. Urja uses this for all optimization and transformation decisions."
                    icon={Network}
                />
                <GlossaryItem
                    term="Frozen Core"
                    definition="The philosophy that the core orchestration engine of the build tool should remain immutable and feature-locked to ensure long-term stability."
                    icon={Layers}
                />
                <GlossaryItem
                    term="Adapter"
                    definition="A strictly isolated plugin that contains all framework-specific transformation logic, keeping it separate from the core build engine."
                    icon={Box}
                />
                <GlossaryItem
                    term="Universal Transformer"
                    definition="The internal system responsible for ensuring that all module types (CJS, ESM, TS) are normalized into pure browser-compatible ESM."
                    icon={Cpu}
                />
                <GlossaryItem
                    term="Federation Bridge"
                    definition="The canonical entry-point system used in Micro-Frontends to link separate Build Graphs across different hosts and remotes."
                    icon={Share2}
                />
                <GlossaryItem
                    term="Determinism"
                    definition="The guarantee that for a given input, the build tool will produce the exact same output byte-for-byte, regardless of frequency or environment."
                    icon={HelpCircle}
                />
            </div>

            <div className="p-10 rounded-[40px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <Book size={32} className="text-blue-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Need more details?</h3>
                <p className="text-[var(--text-secondary)] mb-8 max-w-lg mx-auto leading-relaxed">
                    Detailed technical documentation and source code annotations are available in the official repository for deeper architectural inspection.
                </p>
                <a href="https://github.com" className="inline-flex h-12 items-center justify-center px-8 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all">
                    GitHub Source Docs
                </a>
            </div>
        </div>
    );
};
