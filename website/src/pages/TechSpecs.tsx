import React from 'react';
import {
    ShieldAlert,
    Binary,
    Repeat,
    Combine,
    FastForward,
    Gauge,
    ScrollText,
    Copy,
    CheckCircle2
} from 'lucide-react';

import { CodeBlock } from '../components/CodeBlock';

const SpecItem = ({ icon: Icon, title, content }: any) => (
    <div className="flex gap-6 mb-12 animate-in slide-in-from-left duration-700">
        <div className="mt-1 p-3 bg-blue-500/10 rounded-2xl text-blue-500 h-fit">
            <Icon size={24} />
        </div>
        <div>
            <h3 className="text-xl font-bold mb-3 font-display">{title}</h3>
            <div className="text-[var(--text-secondary)] leading-relaxed space-y-4">
                {content}
            </div>
        </div>
    </div>
);

export const TechSpecs: React.FC = () => {
    return (
        <div className="animate-in fade-in duration-1000">
            <div className="mb-16">
                <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
                    Hard Mechanics
                </div>
                <h1 className="text-5xl lg:text-7xl font-black font-display mb-8 tracking-tighter italic">
                    Technical Specs.
                </h1>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-4xl">
                    A definitive guide to the internal specifications, optimization strategies, and governance rules of the Urja Build Engine.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-20">
                <SpecItem
                    icon={Binary}
                    title="Universal Transformation Engine"
                    content={
                        <>
                            <p>The transformation core uses a dual-engine approach to balance speed and accuracy. For high-speed dev cycles, <strong>esbuild</strong> handles primary JS/TS/JSX transformations.</p>
                            <CodeBlock code={`// Pipeline Priority
1. Framework Detection
2. Syntax Normalization (esbuild)
3. Path Canonicalization
4. Plugin Injection`} />
                        </>
                    }
                />

                <SpecItem
                    icon={Repeat}
                    title="Incrementality & Caching"
                    content={
                        <p>Urja implements a multi-layer cache. Byte-level content hashing is applied to every file in the graph. If a file's hash remains unchanged, the transformation results are pulled from the <code>.urja_cache</code> directory, bypassing esbuild entirely. This allows for near-zero startup times on large projects.</p>
                    }
                />

                <SpecItem
                    icon={Combine}
                    title="Module Federation Design"
                    content={
                        <>
                            <p>The build tool natively supports decentralized orchestration. Each build generates a <code>federation-manifest.json</code> that defines shared dependencies and remote entry points. Urja handles the runtime resolution without requiring heavy external runtimes.</p>
                            <ul className="list-disc ml-5 space-y-2 text-sm italic">
                                <li>Dynamic remote loading via Web Workers.</li>
                                <li>Version-aware dependency sharing (Semantic Versioning).</li>
                                <li>HMR Propagation across federated boundaries.</li>
                            </ul>
                        </>
                    }
                />

                <SpecItem
                    icon={ShieldAlert}
                    title="Governance Enforcement"
                    content={
                        <p>Architectural integrity is enforced through <strong>Link-Time Validation</strong>. The Graph Planner analyzes all imports against a predefined <code>governance.json</code>. Any cross-boundary violations (e.g., UI components importing directly from Backend-only utilities) result in a blocking build error.</p>
                    }
                />

                <SpecItem
                    icon={Gauge}
                    title="Optimization Parameters"
                    content={
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-[var(--border-color)]">
                                <h4 className="font-bold text-blue-500">Tree Shaking</h4>
                                <p className="text-xs">Advanced static analysis tracing exports across the entire graph.</p>
                            </div>
                            <div className="p-4 rounded-xl border border-[var(--border-color)]">
                                <h4 className="font-bold text-blue-500">Code Splitting</h4>
                                <p className="text-xs">Automatic async chunking for dynamic <code>import()</code> statements.</p>
                            </div>
                        </div>
                    }
                />
            </div>

            <div className="p-10 rounded-[40px] bg-slate-900 border border-slate-800 text-center mb-24 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600" />
                <ScrollText size={32} className="text-blue-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-100 mb-4">Explore the Source</h3>
                <p className="text-slate-400 mb-8 text-sm max-w-lg mx-auto leading-relaxed">
                    Urja is built on a foundation of open-source excellence. Our core transformation logic and adapter templates are available for deep inspection.
                </p>
                <div className="flex justify-center gap-4">
                    <a href="https://github.com" className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl text-sm hover:scale-105 transition-transform">View Core on GitHub</a>
                    <a href="#/docs/getting-started" className="px-6 py-3 border border-slate-700 text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors">Documentation</a>
                </div>
            </div>
        </div>
    );
};
