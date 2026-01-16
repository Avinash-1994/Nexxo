import React from 'react';
import { Rocket, Box, Database, Globe, Smartphone, CreditCard } from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';
import { Link } from 'react-router-dom';

export const TemplateStarters: React.FC = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
                    Get Started Fast
                </div>
                <h1 className="text-5xl font-black font-display mb-6 tracking-tight">Templates & Starters</h1>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                    Production-ready boilerplates for every use case. Pre-configured with TypeScript, linting, testing, and CI/CD workflows.
                </p>
            </div>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Rocket className="text-blue-500" size={32} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Standard SPA Templates</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-6">
                    Optimized for Single Page Applications with client-side routing.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: 'react-spa', title: 'React SPA', desc: 'Vite-compatible React + TS setup' },
                        { name: 'vue-spa', title: 'Vue 3 SPA', desc: 'Pinia + Vue Router pre-configured' },
                        { name: 'solid-spa', title: 'SolidJS', desc: 'Performance-first reactive signals' },
                        { name: 'svelte-spa', title: 'Svelte 5', desc: 'Latest Svelte compiler integration' },
                        { name: 'lit-spa', title: 'Lit Elements', desc: 'Web Components standard starter' },
                        { name: 'preact-spa', title: 'Preact', desc: 'Ultra-lightweight 3kb alternative' }
                    ].map(t => (
                        <div key={t.name} className="p-6 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] hover:border-blue-500/50 transition-all group cursor-pointer"
                            onClick={() => navigator.clipboard.writeText(`npx create-nexxo --template ${t.name} my-app`)}>
                            <div className="font-bold text-lg mb-2 group-hover:text-blue-500 transition-colors">{t.title}</div>
                            <div className="text-sm text-[var(--text-secondary)] mb-4">{t.desc}</div>
                            <div className="bg-[var(--bg-color)] p-2 rounded-lg font-mono text-xs text-[var(--text-secondary)] border border-[var(--border-color)] flex justify-between items-center">
                                <span className="truncate">--template {t.name}</span>
                                <span className="text-[10px] uppercase font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Globe className="text-purple-500" size={32} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Full-Stack & Edge</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="p-8 rounded-[32px] bg-slate-900 border border-slate-800">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Edge Function</h3>
                                <div className="text-xs text-purple-400 font-bold uppercase tracking-wider">Cloudflare / Vercel</div>
                            </div>
                        </div>
                        <p className="text-slate-400 mb-6 text-sm">
                            Universal edge runtime starter. Deploy highly cached API endpoints or SSR fragments closer to your users.
                        </p>
                        <CodeBlock code="npx create-nexxo --template edge-function my-api" />
                    </div>

                    <div className="p-8 rounded-[32px] bg-slate-900 border border-slate-800">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Fintech App</h3>
                                <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Secure / Compliant</div>
                            </div>
                        </div>
                        <p className="text-slate-400 mb-6 text-sm">
                            Pre-hardened architecture with UPI integration, strict CSP, and security headers enabled by default.
                        </p>
                        <CodeBlock code="npx create-nexxo --template fintech-app my-wallet" />
                    </div>
                </div>
            </section>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Box className="text-amber-500" size={32} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Enterprise Scale</h2>
                </div>
                <div className="p-8 rounded-[32px] border border-[var(--border-color)] bg-[var(--surface-color)]/50">
                    <h3 className="text-2xl font-bold mb-4">Monorepo Workspace</h3>
                    <p className="text-[var(--text-secondary)] mb-6">
                        Set up a high-performance monorepo with PNPM Workspaces and Nexxo's graph caching. Ideal for design systems or multi-app organizations.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold mb-2 text-sm uppercase tracking-wide">Structure</h4>
                            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                                <li className="flex gap-2"><Box size={16} /> apps/web (React Consumer)</li>
                                <li className="flex gap-2"><Box size={16} /> apps/docs (Documentation)</li>
                                <li className="flex gap-2"><Box size={16} /> packages/ui (Shared Components)</li>
                                <li className="flex gap-2"><Box size={16} /> packages/config (Shared Config)</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-2 text-sm uppercase tracking-wide">Quick Start</h4>
                            <CodeBlock code="npx create-nexxo --template monorepo my-org" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
