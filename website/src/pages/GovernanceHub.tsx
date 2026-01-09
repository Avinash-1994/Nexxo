import React from 'react';
import {
    Lock,
    Settings,
    ShieldCheck,
    History,
    Zap,
    CheckCircle2,
    AlertTriangle,
    GitBranch,
    Copy
} from 'lucide-react';

import { CodeBlock } from '../components/CodeBlock';

const HubSection = ({ icon: Icon, title, children }: any) => (
    <div className="mb-16 animate-in fade-in slide-in-from-left duration-700">
        <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                <Icon size={24} />
            </div>
            <h2 className="text-3xl font-black font-display tracking-tight">{title}</h2>
        </div>
        <div className="text-[var(--text-secondary)] leading-relaxed space-y-4 max-w-4xl">
            {children}
        </div>
    </div>
);

export const GovernanceHub: React.FC = () => {
    return (
        <div className="animate-in fade-in duration-1000">
            <div className="mb-16">
                <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
                    Governance & Stability
                </div>
                <h1 className="text-5xl lg:text-7xl font-black font-display mb-8 tracking-tighter">
                    Stability Guarantee.
                </h1>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-4xl">
                    Nexxo is built on the principle of the "Frozen Core". Our governance model ensures that your build infrastructure remains a constant, predictable utility.
                </p>
            </div>

            <HubSection icon={Lock} title="The Frozen Core Philosophy">
                <p>
                    The Nexxo core engine is strictly feature-frozen regarding its fundamental build orchestration. We do not accept feature requests that compromise the determinism of the Build Graph.
                </p>
                <CodeBlock code={`// Immutable Core Modules
- src/core/graph-planner.ts (LOCKED)
- src/core/universal-transformer.ts (LOCKED)
- src/resolve/path-resolver.ts (LOCKED)`} />
                <p className="text-sm italic">
                    "Architecture should be boring. Nexxo ensures the foundations of your build process never shift under your feet."
                </p>
            </HubSection>

            <HubSection icon={ShieldCheck} title="Adapter Tier System">
                <p>
                    We classify framework adapters into three tiers to provide explicit stability expectations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                        <h4 className="font-bold text-emerald-600 mb-2">Tier 1: Stable</h4>
                        <p className="text-xs">Full HMR support, 100% test coverage, guaranteed no-break path.</p>
                        <div className="mt-4 text-[10px] font-bold text-[var(--text-secondary)]">REACT, VUE, SOLID</div>
                    </div>
                    <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5">
                        <h4 className="font-bold text-blue-600 mb-2">Tier 2: Verified</h4>
                        <p className="text-xs">Maintained by maintainers, community verified, stable build path.</p>
                        <div className="mt-4 text-[10px] font-bold text-[var(--text-secondary)]">ANGULAR, SVELTE</div>
                    </div>
                    <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                        <h4 className="font-bold text-amber-600 mb-2">Tier 3: Experimental</h4>
                        <p className="text-xs">Initial support, limited HMR, breaking changes possible in adapter logic.</p>
                        <div className="mt-4 text-[10px] font-bold text-[var(--text-secondary)]">ALPINE, HTMX</div>
                    </div>
                </div>
            </HubSection>

            <HubSection icon={History} title="Breaking Change Policy">
                <p>
                    Nexxo follows a strict "Long-Term Reliability" cycle. Breaking changes to the core config schema (`nexxo.config.js`) are only permitted during major release cycles, which occur no more than once every 18 months.
                </p>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600">
                    <AlertTriangle size={20} />
                    <span className="text-sm font-bold">LTS Commitment: Version 1.x will receive security patches until 2028.</span>
                </div>
            </HubSection>

            <HubSection icon={GitBranch} title="Version Lifecycle">
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)]">
                        <span className="font-bold">LTS Release</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-black uppercase">Active</span>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] opacity-50">
                        <span className="font-bold">Previous Stable</span>
                        <span className="px-2 py-0.5 rounded bg-slate-500 text-white text-[10px] font-black uppercase">Maintenance</span>
                    </div>
                </div>
            </HubSection>

            <section className="mb-24 py-16 text-center border-t border-[var(--border-color)]">
                <Zap size={48} className="text-blue-500 mx-auto mb-6" />
                <h2 className="text-4xl font-black font-display mb-6">Built for the Long Term.</h2>
                <p className="text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 text-lg">
                    We understand that build tools are the most critical piece of an organization's infrastructure. Nexxo's governance ensures that piece never breaks.
                </p>
                <a href="#/docs/getting-started" className="inline-flex h-14 items-center justify-center px-10 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/25">
                    Explore System Manual
                </a>
            </section>
        </div>
    );
};
