import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Share2,
    ShieldAlert,
    Layers,
    Puzzle,
    ArrowRightLeft,
    AlertTriangle,
    CheckCircle2,
    Copy,
    XCircle,
    AlertCircle
} from 'lucide-react';

import { CodeBlock } from '../components/CodeBlock';

export const MicroFrontends = ({ section }: { section: string }) => {
    const renderContent = () => {
        switch (section) {
            case 'architecture':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-4xl font-black font-display mb-6 tracking-tight">MFE Architecture & Graph Model</h1>
                        <p className="text-lg text-[var(--text-secondary)] mb-8">
                            Nexxo treats Micro-Frontends as distributed nodes in a global dependency graph.
                        </p>
                        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 mb-10">
                            <h3 className="text-blue-500 font-bold mb-4 uppercase text-xs tracking-widest">The Remote Entry Bridge</h3>
                            <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                When a remote is built, Nexxo generates a canonical entry point that exposes the internal graph nodes. The host does not import files; it resolves semantic identifiers.
                            </p>
                            <div className="flex items-center justify-center gap-4 py-8 border-y border-slate-800">
                                <div className="px-4 py-2 rounded bg-blue-600 font-bold text-xs text-white">HOST GRAPH</div>
                                <ArrowRightLeft className="text-slate-500" size={24} />
                                <div className="px-4 py-2 rounded border border-blue-500 font-bold text-xs text-blue-500">REMOTE MANIFEST</div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Key Principles</h3>
                        <ul className="space-y-4 text-[var(--text-secondary)]">
                            <li className="flex gap-3">
                                <Layers className="text-blue-500 shrink-0" size={20} />
                                <span><strong>No Global Pollution</strong>: Remote modules are scoped. Styles and globals from a remote cannot leak into the host's primary context.</span>
                            </li>
                            <li className="flex gap-3">
                                <Share2 className="text-blue-500 shrink-0" size={20} />
                                <span><strong>Shared Dependencies</strong>: Peer dependencies like <code>react</code> or <code>vue</code> are identified during the graph build and deduplicated at link-time.</span>
                            </li>
                        </ul>
                    </div>
                );
            case 'getting-started':
                return (
                    // ... (imports remain)
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-4xl font-black font-display mb-6 tracking-tight">Getting Started</h1>

                        <div className="mb-10 p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                            <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                                <CheckCircle2 size={18} /> Production Readiness
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
                                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                    <div className="font-bold text-emerald-400 mb-1">CSR (Client-Side)</div>
                                    <div className="text-slate-400">✅ Stable v1.0</div>
                                </div>
                                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                    <div className="font-bold text-amber-400 mb-1">SSR (Server-Side)</div>
                                    <div className="text-slate-400">⚠️ Experimental</div>
                                    <div className="text-[10px] text-slate-500 mt-1">Target: Q3 2026</div>
                                </div>
                                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                    <div className="font-bold text-red-400 mb-1">Cross-Framework</div>
                                    <div className="text-slate-400">❌ Not Supported</div>
                                    <div className="text-[10px] text-slate-500 mt-1">Target: Q4 2026</div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold mb-4">1. The Remote Setup</h2>
                        <p className="mb-4 text-[var(--text-secondary)]">Expose your components in the remote application's config:</p>
                        <CodeBlock code={`// remote/nexxo.config.ts
import { defineConfig } from 'nexxo';
import { federation } from '@nexxo/plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'shop_remote',
      filename: 'remoteEntry.js',
      exposes: {
        './Cart': './src/components/Cart.tsx',
        './ProductList': './src/components/ProductList.tsx'
      },
      shared: ['react', 'react-dom', 'zustand']
    })
  ]
});`} language="typescript" />

                        <h2 className="text-2xl font-bold mt-10 mb-4">2. The Host Setup</h2>
                        <p className="mb-4 text-[var(--text-secondary)]">Register the remote in your host application:</p>
                        <CodeBlock code={`// host/nexxo.config.ts
import { defineConfig } from 'nexxo';
import { federation } from '@nexxo/plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'main_app',
      remotes: {
        shop: 'http://localhost:3001/remoteEntry.js' // Direct URL
        // OR
        // shop: 'shop@http://localhost:3001/remoteEntry.js'
      },
      shared: ['react', 'react-dom', 'zustand']
    })
  ]
});`} language="typescript" />

                        <h2 className="text-2xl font-bold mt-10 mb-4">3. Usage in React</h2>
                        <p className="mb-4 text-[var(--text-secondary)]">Import components lazily using <code>React.lazy</code>:</p>
                        <CodeBlock code={`// host/src/App.tsx
import React, { Suspense } from 'react';

// Lazy load the remote component
const Cart = React.lazy(() => import('shop/Cart'));

export default function App() {
  return (
    <div>
      <h1>Main Application</h1>
      <Suspense fallback={<div>Loading Cart...</div>}>
        <Cart />
      </Suspense>
    </div>
  );
}`} language="tsx" />

                        <h2 className="text-2xl font-bold mt-10 mb-4">4. Type Safety (TypeScript)</h2>
                        <p className="mb-4 text-[var(--text-secondary)]">Create a declaration file to silence TypeScript errors:</p>
                        <CodeBlock code={`// host/src/remotes.d.ts
declare module 'shop/Cart' {
  const Cart: React.ComponentType;
  export default Cart;
}

declare module 'shop/ProductList' {
  const ProductList: React.ComponentType<{ limit?: number }>;
  export default ProductList;
}`} language="typescript" />
                    </div>
                );
            case 'patterns':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-4xl font-black font-display mb-6 tracking-tight">Supported Patterns</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            <div className="p-6 rounded-2xl border border-[var(--border-color)]">
                                <h4 className="font-bold flex items-center gap-2 mb-3">
                                    <Puzzle size={18} className="text-blue-500" />
                                    Runtime Composition
                                </h4>
                                <p className="text-sm text-[var(--text-secondary)]">Load remotes on demand as the user navigates. Best for large dashboards.</p>
                            </div>
                            <div className="p-6 rounded-2xl border border-[var(--border-color)]">
                                <h4 className="font-bold flex items-center gap-2 mb-3">
                                    <ArrowRightLeft size={18} className="text-blue-500" />
                                    Bi-directional Sharing
                                </h4>
                                <p className="text-sm text-[var(--text-secondary)]">Host and Remote can both expose and consume modules from each other.</p>
                            </div>
                        </div>
                        <div className="bg-blue-500/5 p-6 rounded-2xl border border-blue-500/10">
                            <h4 className="font-bold mb-2 text-blue-600">Explicit pattern support:</h4>
                            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                                <li>• ESM Module Federation (Native)</li>
                                <li>• Dependency pre-loading (Pre-bundled)</li>
                                <li>• Version negotiation (Semantic Versioning)</li>
                            </ul>
                        </div>
                    </div>
                );
            case 'risks':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-4xl font-black font-display mb-6 tracking-tight text-amber-600">Risks & Limitations</h1>
                        <p className="text-lg text-[var(--text-secondary)] mb-10 leading-relaxed">
                            Power with responsibility. Federation introduces complex failure modes that must be managed by the architect.
                        </p>

                        <div className="space-y-8 mb-16">
                            <section className="flex gap-4">
                                <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                                <div>
                                    <h4 className="font-bold mb-2">Experimental Status</h4>
                                    <p className="text-sm text-[var(--text-secondary)]">Cross-adapter federation (e.g., React Host + Vue Remote) is currently <strong>UNSUPPORTED</strong> and will likely result in runtime initialization errors.</p>
                                </div>
                            </section>

                            <section className="flex gap-4">
                                <ShieldAlert className="text-red-500 shrink-0" size={24} />
                                <div>
                                    <h4 className="font-bold mb-2">Version Mismatch</h4>
                                    <p className="text-sm text-[var(--text-secondary)]">Shared dependencies must have matching versions or fallbacks. Incompatible versions of libraries using internal state (like React hooks) will cause the application to crash.</p>
                                </div>
                            </section>

                            <div className="p-8 rounded-[32px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <h3 className="text-xl font-bold mb-4">Unsupported Cases</h3>
                                <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                                    <li>• Server-Side Rendering (SSR) with federated remotes.</li>
                                    <li>• Legacy Webpack-based Federation interop.</li>
                                    <li>• Global CSS side-effects from remotes.</li>
                                    <li>• Dynamic script loading without Nexxo internal orchestration.</li>
                                </ul>
                            </div>
                        </div>

                        <section className="p-10 rounded-[40px] bg-red-500/5 border border-red-500/10 mb-24">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                                    <XCircle size={32} />
                                </div>
                                <h2 className="text-3xl font-black font-display tracking-tight text-red-600">When NOT to use MFEs</h2>
                            </div>
                            <ul className="space-y-6 text-[var(--text-secondary)]">
                                <li className="flex gap-4">
                                    <AlertCircle className="text-red-500 shrink-0" size={20} />
                                    <div>
                                        <h4 className="font-bold text-[var(--text-primary)]">Small Teams</h4>
                                        <p className="text-sm">If your entire app is built by 1-2 teams, the overhead of federation (deployment complexity, orchestration, shared deps) will slow you down more than it helps.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <AlertCircle className="text-red-500 shrink-0" size={20} />
                                    <div>
                                        <h4 className="font-bold text-[var(--text-primary)]">Tight Coupling Required</h4>
                                        <p className="text-sm">If your modules frequently share global state, complex contexts, or deep data structures, keeping them in a single monolith ensures type-safety and atomicity.</p>
                                    </div>
                                </li>
                            </ul>
                        </section>
                    </div>
                );
            case 'overview':
            default:
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
                            Architecture Standard
                        </div>
                        <h1 className="text-6xl font-black font-display mb-8 tracking-tight italic">
                            Micro-Frontends
                        </h1>
                        <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-4xl mb-12">
                            Nexxo’s approach to Micro-Frontends is built on **Deterministic Federation**. It provides the power of modular development with the responsibility of explicit dependency boundaries.
                        </p>

                        <div className="grid grid-cols-1 gap-8">
                            <div className="p-10 rounded-[40px] bg-slate-900 border border-slate-800 text-slate-100">
                                <h3 className="text-2xl font-bold mb-4">Philosophy: Zero Hidden State</h3>
                                <p className="text-slate-400 mb-6 leading-relaxed">
                                    Unlike other tools that rely on magical runtime injections, Nexxo requires all federated boundaries to be declared in the Build Graph. This ensures that every remote module is linkable and verifiable.
                                </p>
                                <div className="flex gap-4">
                                    <Link to="/mfe/architecture" className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-colors">Internal Mechanics</Link>
                                    <Link to="/mfe/risks" className="px-6 py-3 border border-slate-700 rounded-xl font-bold hover:bg-slate-800 transition-colors">View Risks</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="mfe-page pb-24">
            {renderContent()}
        </div>
    );
};
