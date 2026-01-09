import React from 'react';
import {
    Network,
    Cpu,
    ShieldCheck,
    Zap,
    FileCode2,
    LayoutDashboard,
    Box,
    Share2,
    Copy,
    CheckCircle2
} from 'lucide-react';

import { CodeBlock } from '../components/CodeBlock';

const FeatureCard = ({ icon: Icon, title, description, children }: any) => (
    <div className="p-8 rounded-[32px] border border-[var(--border-color)] bg-[var(--surface-color)]/50 backdrop-blur-sm mb-12 group hover:border-blue-500/50 transition-all">
        <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                <Icon size={32} />
            </div>
            <h2 className="text-3xl font-black font-display tracking-tight">{title}</h2>
        </div>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-3xl">
            {description}
        </p>
        {children}
    </div>
);

export const CoreConcepts: React.FC = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="mb-16">
                <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
                    Technical Deep Dive
                </div>
                <h1 className="text-5xl lg:text-7xl font-black font-display mb-8 tracking-tighter italic">
                    Inside the Engine.
                </h1>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-4xl">
                    Nexxo isn't just a wrapper around existing tools. It's a completely reimagined build architecture focused on **determinism**, **isolation**, and **performance**.
                </p>
            </div>

            {/* 1. The Graph-First Architecture */}
            <FeatureCard
                icon={Network}
                title="Graph-First Intelligence"
                description="At the center of Nexxo is a persistent, semantic dependency graph. Unlike other tools that see files as a linear list, Nexxo understands the relationships between every module."
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                    <div className="p-6 rounded-2xl bg-slate-900 text-slate-100 font-mono text-sm border border-slate-800">
                        <h4 className="text-blue-400 mb-3 border-b border-slate-800 pb-2 uppercase text-[10px] tracking-widest font-bold">Node Visualization</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> main.tsx</div>
                            <div className="flex items-center gap-2 ml-4 text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ↳ App.tsx</div>
                            <div className="flex items-center gap-2 ml-8 text-slate-500"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> ↳ Button.tsx</div>
                            <div className="flex items-center gap-2 ml-8 text-slate-500"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> ↳ theme.css</div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <h4 className="font-bold mb-2">Why it matters:</h4>
                        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                            <li>• Incremental builds only re-calculate changed sub-graphs.</li>
                            <li>• Perfect tree-shaking by tracing dead nodes accurately.</li>
                            <li>• Auto-detection of framework bridges across module boundaries.</li>
                        </ul>
                    </div>
                </div>
            </FeatureCard>

            {/* 2. Isolated Adapters */}
            <FeatureCard
                icon={Box}
                title="Strict Adapter Isolation"
                description="Nexxo operates on a 'Pure Data' principle. The core engine knows how to build graphs; it doesn't know what React or Vue is. This logic is strictly isolated in Adapters."
            >
                <div className="p-8 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--surface-color)]/30">
                    <div className="flex flex-wrap gap-4 items-center justify-center">
                        <div className="px-4 py-2 rounded-lg bg-blue-500 text-white font-bold text-sm">NEXXO CORE</div>
                        <Share2 size={24} className="text-[var(--text-secondary)]" />
                        <div className="px-4 py-2 rounded-lg border border-blue-500/30 font-bold text-sm">React Adapter</div>
                        <div className="px-4 py-2 rounded-lg border border-blue-500/30 font-bold text-sm">Vue Adapter</div>
                        <div className="px-4 py-2 rounded-lg border border-blue-500/30 font-bold text-sm">Legacy Adapter</div>
                    </div>
                    <p className="mt-6 text-sm italic text-center text-[var(--text-secondary)]">
                        "Eliminating architectural drift by preventing framework logic from leaking into the build orchestration."
                    </p>
                </div>
            </FeatureCard>

            {/* 3. Universal Transformer */}
            <FeatureCard
                icon={Cpu}
                title="Universal Transformer"
                description="Dealing with ESM and CommonJS concurrently is the 'JS Hell'. Nexxo resolves this by using an honest, esbuild-backed transformation bridge that ensures all browser targets receive pure ESM."
            >
                <div className="p-2">
                    <CodeBlock code={`// Internal Transformation Logic
if (target === 'browser') {
  ensure_esm_output();
  rewrite_require_to_import();
  inject_hmr_runtime();
  bundle_prebundled_deps();
}`} />
                </div>
            </FeatureCard>

            {/* 4. HMR Neutrality */}
            <FeatureCard
                icon={Zap}
                title="Neutral HMR Runtime"
                description="Nexxo's Hot Module Replacement isn't just for CSS. It uses a cross-compatible invalidation model that works identically across VDOM libraries, Web Components, and raw JS modules."
            >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Latency', value: '<50ms' },
                        { label: 'Protocol', value: 'WebSockets' },
                        { label: 'Payload', value: 'JSON Patches' },
                    ].map(stat => (
                        <div key={stat.label} className="text-center p-4 rounded-xl border border-[var(--border-color)]">
                            <div className="text-2xl font-black text-blue-500 font-display">{stat.value}</div>
                            <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </FeatureCard>

            <section className="mb-24 py-16 text-center border-t border-[var(--border-color)]">
                <ShieldCheck size={48} className="text-emerald-500 mx-auto mb-6" />
                <h2 className="text-4xl font-black font-display mb-6">Built for Reliability.</h2>
                <p className="text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 text-lg">
                    By focusing on these core concepts, Nexxo ensures that your build pipeline remains fast and stable, regardless of how many modules or which frameworks you add to your stack.
                </p>
                <a href="#/docs/getting-started" className="inline-flex h-14 items-center justify-center px-10 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/25">
                    Read full Tech Specs
                </a>
            </section>
        </div>
    );
};
