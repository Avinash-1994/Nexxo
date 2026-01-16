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
                    Nexxo is a high-performance build tool designed for large-scale web applications. This guide will walk you through the installation and basic configuration.
                </p>
            </div>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Download className="text-blue-500" size={24} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Installation</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-4">Install the Nexxo CLI globally via npm or yarn:</p>
                <CodeBlock code="npm install -g nexxo" />
                <p className="text-[var(--text-secondary)] mt-4">For local project use, install it as a dev dependency:</p>
                <CodeBlock code="npm install --save-dev nexxo" />
            </section>

            <section className="mb-16 p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/20">
                <div className="flex items-center gap-3 mb-6">
                    <Rocket className="text-purple-500" size={32} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Create New Project</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-6">
                    The fastest way to get started is with our interactive project scaffolding tool:
                </p>
                <CodeBlock code="npx create-nexxo my-awesome-app" />
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-purple-500/30">
                        <div className="text-purple-400 font-bold mb-2">🎨 9 Frameworks</div>
                        <div className="text-xs text-slate-400">React, Vue, Svelte, Solid, Lit, Alpine, Preact, Mithril, Qwik</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-purple-500/30">
                        <div className="text-purple-400 font-bold mb-2">⚡ Interactive UI</div>
                        <div className="text-xs text-slate-400">Keyboard navigation with instant feedback</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-purple-500/30">
                        <div className="text-purple-400 font-bold mb-2">🛠️ Full Config</div>
                        <div className="text-xs text-slate-400">TypeScript, CSS frameworks, tooling & more</div>
                    </div>
                </div>
            </section>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Rocket className="text-blue-500" size={24} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Framework CLI Guide</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-6">
                    Quickly bootstrap any supported framework using the <code>--template</code> or <code>--adapter</code> flag:
                </p>

                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                        <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                            <Rocket size={16} /> Standard Frameworks
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">React</div>
                                <CodeBlock code="npx create-nexxo --template react-ts my-app" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Vue</div>
                                <CodeBlock code="npx create-nexxo --template vue-ts my-app" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Svelte</div>
                                <CodeBlock code="npx create-nexxo --template svelte-ts my-app" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">SolidJS</div>
                                <CodeBlock code="npx create-nexxo --template solid-ts my-app" />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                        <h4 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
                            <Rocket size={16} /> Specialized & Lightweight
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Lit (Web Components)</div>
                                <CodeBlock code="npx create-nexxo --template lit-ts my-app" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Preact</div>
                                <CodeBlock code="npx create-nexxo --template preact-ts my-app" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Alpine.js (Runtime)</div>
                                <CodeBlock code="npx create-nexxo --template alpine-js my-app" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Mithril.js</div>
                                <CodeBlock code="npx create-nexxo --template mithril-ts my-app" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mb-16 p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-emerald-500/10 border-2 border-blue-500/20">
                <div className="flex items-center gap-3 mb-6">
                    <Terminal className="text-blue-500" size={32} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Quick Commands</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-6">
                    Once installed, use these commands to run your Nexxo project:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">Development</div>
                        <CodeBlock code="npx nexxo dev" language="bash" />
                        <p className="text-xs text-slate-400 mt-2">Start dev server with HMR at http://localhost:5173</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">Production Build</div>
                        <CodeBlock code="npx nexxo build" language="bash" />
                        <p className="text-xs text-slate-400 mt-2">Build optimized bundle for deployment</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 md:col-span-2">
                        <div className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">Quality Audit</div>
                        <CodeBlock code="npx nexxo audit" language="bash" />
                        <p className="text-xs text-slate-400 mt-2">Check SEO, Accessibility, Performance, and Best Practices</p>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <p className="text-sm text-blue-300 flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        <strong>Pro Tip:</strong> Use <code className="px-2 py-1 bg-slate-900 rounded">DEBUG=true npx nexxo dev</code> to see detailed logs
                    </p>
                </div>
            </section>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Rocket className="text-blue-500" size={24} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Initialize Project</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-4">You can manually create a configuration file or use the interactive init command:</p>
                <CodeBlock code="npx nexxo init" />

                <h3 className="text-xl font-bold mt-8 mb-4">Basic Configuration</h3>
                <p className="text-[var(--text-secondary)] mb-4">Create an <code>nexxo.config.js</code> file in your project root:</p>
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
                        { cmd: 'npx create-nexxo', desc: '🎨 Interactive project scaffolding with framework selection (React, Vue, Svelte, Solid, Lit, Alpine, Preact, Mithril).' },
                        { cmd: 'npx nexxo dev', desc: 'Starts the high-performance development server with HMR.' },
                        { cmd: 'npx nexxo build', desc: 'Triggers the production build pipeline with full optimizations.' },
                        { cmd: 'npx nexxo init', desc: 'Interactive wizard to initialize nexxo.config.js in your project.' },
                        { cmd: 'npx nexxo bootstrap', desc: 'Scaffold a new project from premium templates (React, Vue, Svelte, etc.).' },
                        { cmd: 'npx nexxo ssr', desc: 'Starts the universal SSR runtime for meta-frameworks (Next.js, Nuxt, Remix).' },
                        { cmd: 'npx nexxo audit', desc: '🛡️ Run comprehensive audits for Accessibility, Performance, SEO, and Best Practices.' },

                        { cmd: 'npx nexxo inspect', desc: 'Visualize and inspect the dependency graph with filtering options.' },
                        { cmd: 'npx nexxo report', desc: 'Generates a detailed build analytics report from the latest session.' },
                        { cmd: 'npx nexxo css purge', desc: 'Deep-cleans CSS by removing unused styles from your bundle.' },
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
                            Nexxo automatically enforces dependency boundaries. If a module from your 'Core' layer attempts to import from an 'Adapter', the build will fail during the Graph Planning phase, preventing architectural erosion.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
