import React from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle2,
    XCircle,
    Target,
    ShieldCheck,
    ZapOff,
    Scale
} from 'lucide-react';

export const DecisionGuide: React.FC = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="mb-16">
                <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
                    Selection Criteria
                </div>
                <h1 className="text-5xl lg:text-7xl font-black font-display mb-8 tracking-tighter">
                    The Right Tool?
                </h1>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-4xl">
                    Nexxo is built for specific architectural goals. It is not a general-purpose tool for every project. Use this guide to determine if your project meets the Nexxo requirements.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                {/* Yes Section */}
                <section className="p-8 rounded-[40px] bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-3xl font-black font-display tracking-tight">Use Nexxo If...</h2>
                    </div>
                    <ul className="space-y-6">
                        <li className="flex gap-4">
                            <Target className="text-emerald-500 shrink-0" size={20} />
                            <div>
                                <h4 className="font-bold">You Prioritize Determinism</h4>
                                <p className="text-sm text-[var(--text-secondary)]">You need the exact same bundle output every time, regardless of the environment or machine.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                            <div>
                                <h4 className="font-bold">Enterprise Governance</h4>
                                <p className="text-sm text-[var(--text-secondary)]">You need to enforce strict architectural layers and prevent framework leakage into core business logic.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <Scale className="text-emerald-500 shrink-0" size={20} />
                            <div>
                                <h4 className="font-bold">Monorepo Scale</h4>
                                <p className="text-sm text-[var(--text-secondary)]">Your project exceeds 1000+ modules where build graph intelligence and incremental caching become critical.</p>
                            </div>
                        </li>
                    </ul>
                </section>

                {/* No Section */}
                <section className="p-8 rounded-[40px] bg-red-500/5 border border-red-500/10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                            <XCircle size={32} />
                        </div>
                        <h2 className="text-3xl font-black font-display tracking-tight text-red-600">Avoid Nexxo If...</h2>
                    </div>
                    <ul className="space-y-6">
                        <li className="flex gap-4">
                            <ZapOff className="text-red-500 shrink-0" size={20} />
                            <div>
                                <h4 className="font-bold">Rapid Prototyping</h4>
                                <p className="text-sm text-[var(--text-secondary)]">You are building a hobby project, a small POC, or need "magic" auto-configuration that hides complexity.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <XCircle className="text-red-500 shrink-0" size={20} />
                            <div>
                                <h4 className="font-bold">Vite Extension Ecosystem</h4>
                                <p className="text-sm text-[var(--text-secondary)]">You rely on a large catalog of experimental community plugins. Nexxo has a frozen core and a curated plugin system.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <Scale className="text-red-500 shrink-0" size={20} />
                            <div>
                                <h4 className="font-bold">Maximum Speed Over Stability</h4>
                                <p className="text-sm text-[var(--text-secondary)]">Nexxo is fast, but it will always prioritize correctness and governance over the absolute fastest build time if a compromise is required.</p>
                            </div>
                        </li>
                    </ul>
                </section>
            </div>

            <div className="p-10 rounded-[32px] bg-slate-900 border border-slate-800 text-center mb-24">
                <h3 className="text-2xl font-bold text-slate-100 mb-4">The Decision Framework</h3>
                <p className="text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Nexxo is a commitment to architectural discipline. By choosing Nexxo, you are choosing to trade experimental flexibility for long-term stability and predictable maintenance.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/docs/core-concepts" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors">Learn Core Concepts</Link>
                </div>
            </div>
        </div>
    );
};
