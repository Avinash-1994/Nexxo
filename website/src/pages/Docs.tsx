import React from 'react';
import { Terminal, Download, Rocket, FileCode, CheckCircle2, Copy } from 'lucide-react';

import { CodeBlock } from '../components/CodeBlock';

export const Docs: React.FC = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
                    Documentation
                </div>
                <h1 className="text-5xl font-black font-display mb-6 tracking-tight">Getting Started</h1>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                    Urja is a high-performance build tool designed for large-scale web applications. This guide will walk you through the installation and basic configuration.
                </p>
            </div>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Download className="text-blue-500" size={24} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Installation</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-4">Install the Urja CLI globally via npm or yarn:</p>
                <CodeBlock code="npm install -g urja" />
                <p className="text-[var(--text-secondary)] mt-4">For local project use, install it as a dev dependency:</p>
                <CodeBlock code="npm install --save-dev urja" />
            </section>

            <section className="mb-16 p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-emerald-500/10 border-2 border-blue-500/20">
                <div className="flex items-center gap-3 mb-6">
                    <Terminal className="text-blue-500" size={32} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Quick Commands</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-6">
                    Once installed, use these commands to run your Urja project:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">Development</div>
                        <CodeBlock code="npx urja dev" language="bash" />
                        <p className="text-xs text-slate-400 mt-2">Start dev server with HMR at http://localhost:5173</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">Production Build</div>
                        <CodeBlock code="npx urja build" language="bash" />
                        <p className="text-xs text-slate-400 mt-2">Build optimized bundle for deployment</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">Quality Audit</div>
                        <CodeBlock code="npx urja audit" language="bash" />
                        <p className="text-xs text-slate-400 mt-2">Check SEO, Accessibility, Performance</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">AI Optimization</div>
                        <CodeBlock code="npx urja optimize" language="bash" />
                        <p className="text-xs text-slate-400 mt-2">Get AI-powered config suggestions</p>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <p className="text-sm text-blue-300 flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        <strong>Pro Tip:</strong> Use <code className="px-2 py-1 bg-slate-900 rounded">DEBUG=true npx urja dev</code> to see detailed logs
                    </p>
                </div>
            </section>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Rocket className="text-blue-500" size={24} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Initialize Project</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-4">You can manually create a configuration file or use the interactive init command:</p>
                <CodeBlock code="urja init" />

                <h3 className="text-xl font-bold mt-8 mb-4">Basic Configuration</h3>
                <p className="text-[var(--text-secondary)] mb-4">Create an <code>urja.config.js</code> file in your project root:</p>
                <CodeBlock code={`module.exports = {
  // Select your framework adapter
  adapter: 'react-adapter',
  
  // Define application entry points
  entry: ['./src/main.tsx'],
  
  // Optimization preset (spa, library, static)
  preset: 'spa',
  
  // Development server options
  port: 5174
};`} />
            </section>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Terminal className="text-blue-500" size={24} />
                    <h2 className="text-3xl font-black font-display tracking-tight">CLI Commands</h2>
                </div>
                <div className="space-y-4">
                    {[
                        { cmd: 'urja dev', desc: 'Starts the high-performance development server with HMR.' },
                        { cmd: 'urja build', desc: 'Triggers the production build pipeline with full optimizations.' },
                        { cmd: 'urja init', desc: 'Interactive wizard to initialize urja.config.js in your project.' },
                        { cmd: 'urja bootstrap', desc: 'Scaffold a new project from premium templates (React, Vue, Svelte, etc.).' },
                        { cmd: 'urja ssr', desc: 'Starts the universal SSR runtime for meta-frameworks.' },
                        { cmd: 'urja inspect', desc: 'Launches the dependency graph visualization tool.' },
                        { cmd: 'urja report', desc: 'Generates a detailed build analytics report.' },
                        { cmd: 'urja css purge', desc: 'Deep-cleans CSS by removing unused styles from your bundle.' },
                        { cmd: 'urja ai fix', desc: 'Analyzes build errors and applies AI-powered code fixes.' },
                        { cmd: 'urja ai status', desc: 'View AI learning metrics and known fix patterns for this project.' },
                    ].map(item => (
                        <div key={item.cmd} className="group flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-5 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] hover:border-blue-500/50 transition-all">
                            <div className="font-mono text-[13px] font-bold text-blue-500 bg-blue-500/5 px-3 py-1 rounded-lg w-fit transition-colors group-hover:bg-blue-500 group-hover:text-white">{item.cmd}</div>
                            <div className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="p-8 rounded-[32px] bg-blue-600 shadow-2xl shadow-blue-500/25 text-white">
                <div className="flex items-start gap-4">
                    <CheckCircle2 size={32} />
                    <div>
                        <h3 className="text-xl font-bold mb-2">Architectural Guardrails</h3>
                        <p className="text-blue-100 leading-relaxed text-sm">
                            Urja automatically enforces dependency boundaries. If a module from your 'Core' layer attempts to import from an 'Adapter', the build will fail during the Graph Planning phase, preventing architectural erosion.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
