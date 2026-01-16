import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import {
    CheckCircle2,
    Copy,
    AlertCircle,
    Cpu,
    Zap,
    Layers,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';

import { CodeBlock } from '../components/CodeBlock';

export const FrameworkGuides = () => {
    const { framework } = useParams<{ framework: string }>();
    if (!framework) return <Navigate to="/docs/getting-started" />;

    const config = {
        react: {
            name: 'React',
            status: 'Stable (Tier 1)',
            statusColor: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
            install: 'npm install react react-dom',
            preset: 'react',
            hmr: 'Fast Refresh (Component-level)',
            example: `// nexxo.config.js
module.exports = {
  adapter: 'react-adapter',
  entry: ['./src/main.tsx'],
  preset: 'spa'
};`,
            features: [
                { title: 'Full HMR Support', desc: 'Preserves state during development.' },
                { title: 'Babel-free Refresh', desc: 'Direct AST transformation for speed.' },
                { title: 'TSX/JSX Support', desc: 'Native support through Universal Transformer.' }
            ],
            limitations: [
                'No support for automatic class component transformations.',
                'Requires react 17+ for the new JSX transform.'
            ]
        },
        vue: {
            name: 'Vue',
            status: 'Stable (Tier 1)',
            statusColor: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
            install: 'npm install vue',
            preset: 'vue',
            hmr: 'SFC Reload (File-level)',
            example: `// nexxo.config.js
module.exports = {
  adapter: 'vue-adapter',
  entry: ['./src/main.js'],
  preset: 'spa'
};`,
            features: [
                { title: 'SFC Transformation', desc: 'Native support for .vue files.' },
                { title: 'Vue Router Integration', desc: 'Built-in path resolving support.' },
                { title: 'Optimized Builds', desc: 'Automatic production flagging.' }
            ],
            limitations: [
                'SSR requires a separate federation configuration.',
                'Vue 2 is supported through a legacy adapter.'
            ]
        },
        svelte: {
            name: 'Svelte',
            status: 'Stable (Tier 1)',
            statusColor: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
            install: 'npm install svelte',
            preset: 'svelte',
            hmr: 'Component Reload',
            example: `// nexxo.config.js
module.exports = {
  adapter: 'svelte-adapter',
  entry: ['./src/main.js'],
  preset: 'spa'
};`,
            features: [
                { title: 'Compiler Integration', desc: 'Direct 5.x compiler mapping.' },
                { title: 'Reactive Prop Sync', desc: 'HMR preserves reactive state.' },
                { title: 'Styling Isolation', desc: 'Automatic scoped CSS extraction.' }
            ],
            limitations: [
                'Legacy Svelte 3/4 requires compatibility shim.',
                'No support for multi-entry Svelte files.'
            ]
        },
        solid: {
            name: 'SolidJS',
            status: 'Stable (Tier 1)',
            statusColor: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
            install: 'npm install solid-js',
            preset: 'solid',
            hmr: 'Brotli-compressed Fast Refresh',
            example: `// nexxo.config.js
module.exports = {
  adapter: 'solid-adapter',
  entry: ['./src/index.tsx'],
  preset: 'spa'
};`,
            features: [
                { title: 'Reactive JSX', desc: 'Pure signals, zero virtual DOM overhead.' },
                { title: 'High-Perf HMR', desc: 'Sub-30ms reload times.' },
                { title: 'Graph Aware', desc: 'Optimized for Solid module boundaries.' }
            ],
            limitations: [
                'Experimental SSR support only.',
                'Strict requirement for pure function components.'
            ]
        },
        preact: {
            name: 'Preact',
            status: 'Stable (Tier 1)',
            statusColor: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
            install: 'npm install preact',
            preset: 'preact',
            hmr: 'Fast Refresh',
            example: `// nexxo.config.js
module.exports = {
  adapter: 'preact-adapter',
  entry: ['./src/index.js'],
  preset: 'spa'
};`,
            features: [
                { title: 'VNode Optimization', desc: 'Custom preact/jsx-runtime integration.' },
                { title: 'Signals Support', desc: 'Deep-integrated preact-signals tracking.' },
                { title: 'Ultra Lightweight', desc: '3KB core with full fresh support.' }
            ],
            limitations: [
                'Requires manual aliasing for some React libraries.',
            ]
        },
        lit: {
            name: 'Lit',
            status: 'Verified',
            statusColor: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
            install: 'npm install lit',
            preset: 'lit',
            hmr: 'Web Component Hot-Patch',
            example: `// nexxo.config.js
module.exports = {
  adapter: 'lit-adapter',
  entry: ['./src/main.ts'],
  preset: 'spa'
};`,
            features: [
                { title: 'Decorator Support', desc: 'TC39 and TypeScript legacy decorators.' },
                { title: 'Shadow DOM HMR', desc: 'In-place style updates without reload.' },
                { title: 'Standard Compliant', desc: 'Pure Web Components orchestration.' }
            ],
            limitations: [
                'Requires custom element registry management for HMR.',
            ]
        },
        alpine: {
            name: 'Alpine.js',
            status: 'Verified',
            statusColor: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
            install: 'npm install alpinejs',
            preset: 'alpine',
            hmr: 'Reactive Core Reload',
            example: `// nexxo.config.js
module.exports = {
  adapter: 'alpine-adapter',
  entry: ['./src/main.js'],
  preset: 'spa'
};`,
            features: [
                { title: 'Runtime Only', desc: 'Optimized for directive-driven logic.' },
                { title: 'State Preservation', desc: 'Global $store remains after refresh.' },
                { title: 'Vanilla First', desc: 'Zero-configuration template handling.' }
            ],
            limitations: [
                'Complex component loops may require partial mount.',
            ]
        },
        qwik: {
            name: 'Qwik',
            status: 'Experimental',
            statusColor: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
            install: 'npm install @builder.io/qwik',
            preset: 'qwik',
            hmr: 'Modular Resumability',
            example: `// nexxo.config.js
module.exports = {
  adapter: 'qwik-adapter',
  entry: ['./src/main.tsx'],
  preset: 'spa'
};`,
            features: [
                { title: 'Resumability', desc: 'Zero hydration on client side.' },
                { title: 'Optimizer Integration', desc: 'Full support for Qwik Optimizer hooks.' },
                { title: 'Serializers', desc: 'Fast serialization of component state.' }
            ],
            limitations: [
                'Experimental SSR mode only.',
            ]
        },
        mithril: {
            name: 'Mithril.js',
            status: 'Legacy',
            statusColor: 'text-slate-500 border-slate-500/20 bg-slate-500/5',
            install: 'npm install mithril',
            preset: 'mithril',
            hmr: 'Full Module Replacement',
            example: `// nexxo.config.js
module.exports = {
  adapter: 'mithril-adapter',
  entry: ['./src/main.js'],
  preset: 'spa'
};`,
            features: [
                { title: 'Fast VDOM', desc: 'High-speed diffing and patching.' },
                { title: 'Routing', desc: 'Built-in support for Mithril routing.' },
                { title: 'Small Footprint', desc: 'Minimalistic core size.' }
            ],
            limitations: [
                'State preservation requires extra boilerplate.',
            ]
        }
    }[framework.toLowerCase()] || { name: framework, install: '', preset: '', example: '', features: [], limitations: [], status: 'Community', statusColor: 'text-slate-500 border-slate-500/20 bg-slate-500/5', hmr: 'Full Refresh' };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
                        Framework Guide
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black font-display tracking-tight">Using {config.name} with Nexxo</h1>
                </div>
                <div className={`px-4 py-2 rounded-xl border font-bold text-sm ${config.statusColor}`}>
                    {config.status}
                </div>
            </div>

            <p className="text-lg text-[var(--text-secondary)] mb-10 leading-relaxed max-w-3xl">
                Nexxo provides first-class support for {config.name} through specialized adapters that isolate your framework logic from the core build engine.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Cpu className="text-blue-500" size={20} />
                        Supported Capabilities
                    </h3>
                    <div className="space-y-3">
                        {config.features.map(f => (
                            <div key={f.title} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)]/50">
                                <div className="font-bold text-sm mb-1">{f.title}</div>
                                <div className="text-xs text-[var(--text-secondary)]">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500" size={20} />
                        Guarantees & HMR
                    </h3>
                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 mb-6">
                        <div className="flex items-center gap-2 text-blue-400 font-mono text-sm mb-2">
                            <Zap size={14} /> HMR BEHAVIOR
                        </div>
                        <p className="text-slate-300 text-sm font-medium">{config.hmr}</p>
                    </div>

                    <h4 className="font-bold mb-3 flex items-center gap-2 text-red-500">
                        <AlertCircle size={18} /> Known Limitations
                    </h4>
                    <ul className="space-y-2">
                        {config.limitations.map(l => (
                            <li key={l} className="text-xs text-[var(--text-secondary)] flex gap-2">
                                <span>•</span> {l}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <section className="mb-12">
                <h3 className="text-xl font-bold mb-4">Installation</h3>
                <CodeBlock code={config.install} />
            </section>

            <section className="mb-12">
                <h3 className="text-xl font-bold mb-4">Configuration</h3>
                <p className="text-[var(--text-secondary)] mb-4">Update your <code>nexxo.config.js</code> to use the {config.name} adapter:</p>
                <CodeBlock code={config.example} />
            </section>

            <section className="p-8 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <h4 className="font-bold mb-2 uppercase text-xs tracking-widest text-blue-600">Architect's Tip</h4>
                <p className="text-sm text-[var(--text-secondary)] italic">
                    While Nexxo allows multiple frameworks in a single repository (e.g., a React Marketing site and a Vue Dashboard), it strictly enforces **one framework per runtime container**. You can mix frameworks across routes, but not within the same component tree.
                </p>
                <div className="mt-4">
                    <Link to="/mfe/framework-policy" className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
                        Read our Framework Isolation Policy <ArrowRight size={12} />
                    </Link>
                </div>
            </section>
        </div>
    );
};
