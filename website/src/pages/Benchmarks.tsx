import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Zap, Clock, Package, CheckCircle2, AlertCircle } from 'lucide-react';

export const Benchmarks: React.FC = () => {
    const benchmarkData = [
        {
            scenario: 'Small App (100 components)',
            metrics: [
                { name: 'Cold Start', nexxo: '608ms', vite: '426ms', webpack: '2500ms', winner: 'vite' },
                { name: 'HMR', nexxo: '15ms', vite: '30ms', webpack: '400ms', winner: 'nexxo' },
                { name: 'Build Time', nexxo: '529ms', vite: '916ms', webpack: '5000ms', winner: 'nexxo' },
                { name: 'Memory', nexxo: '0.1MB', vite: '20.1MB', webpack: '400MB', winner: 'nexxo' },
                { name: 'Bundle Size', nexxo: '9.5KB', vite: '238.5KB', webpack: 'N/A', winner: 'nexxo' },
            ]
        }
    ];

    return (
        <div className="animate-in fade-in duration-1000">
            {/* Hero */}
            <section className="mb-24 pt-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold mb-8">
                    <TrendingUp size={14} />
                    <span>Production-Grade Performance Comparison</span>
                </div>
                <h1 className="text-6xl lg:text-8xl font-black font-display tracking-tighter text-[var(--text-primary)] leading-[0.95] mb-8">
                    Honest Benchmarks
                </h1>
                <p className="text-xl text-[var(--text-secondary)] max-w-3xl leading-relaxed mb-10">
                    Real-world performance data comparing Nexxo against Vite, Webpack, and other build tools.
                    We show both wins and losses because transparency matters.
                </p>
            </section>

            {/* Executive Summary */}
            <section className="mb-16 p-8 rounded-[32px] bg-slate-900/5 border border-[var(--border-color)]">
                <h2 className="text-2xl font-bold mb-6">Executive Summary</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
                            <CheckCircle2 size={20} /> Where Nexxo Wins
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span><strong>Memory Efficiency:</strong> ~0.1MB overhead vs 20MB+ for Vite</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span><strong>HMR Speed:</strong> Consistent 15ms updates across all scenarios</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span><strong>Build Performance:</strong> 470-615ms for typical apps</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span><strong>Bundle Size:</strong> Smaller output with better tree-shaking</span>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-amber-500 flex items-center gap-2">
                            <AlertCircle size={20} /> Areas for Improvement
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                <span><strong>Cold Start:</strong> Slower than esbuild/Vite due to SQLite cache initialization</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                <span><strong>First Run:</strong> Cache warmup adds initial overhead</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Benchmark Results */}
            {benchmarkData.map((data, idx) => (
                <section key={idx} className="mb-16">
                    <h2 className="text-3xl font-bold mb-8">{data.scenario}</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border-color)]">
                                    <th className="text-left py-4 px-4 font-bold">Metric</th>
                                    <th className="text-right py-4 px-4 font-bold">Nexxo</th>
                                    <th className="text-right py-4 px-4 font-bold">Vite</th>
                                    <th className="text-right py-4 px-4 font-bold">Webpack</th>
                                    <th className="text-center py-4 px-4 font-bold">Winner</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.metrics.map((metric, metricIdx) => (
                                    <tr key={metricIdx} className="border-b border-[var(--border-color)] hover:bg-slate-900/5">
                                        <td className="py-4 px-4 font-medium">{metric.name}</td>
                                        <td className={`text-right py-4 px-4 font-mono ${metric.winner === 'nexxo' ? 'text-emerald-500 font-bold' : ''}`}>
                                            {metric.nexxo}
                                        </td>
                                        <td className={`text-right py-4 px-4 font-mono ${metric.winner === 'vite' ? 'text-emerald-500 font-bold' : ''}`}>
                                            {metric.vite}
                                        </td>
                                        <td className={`text-right py-4 px-4 font-mono ${metric.winner === 'webpack' ? 'text-emerald-500 font-bold' : ''}`}>
                                            {metric.webpack}
                                        </td>
                                        <td className="text-center py-4 px-4">
                                            {metric.winner === 'nexxo' && <Zap size={16} className="inline text-emerald-500" />}
                                            {metric.winner === 'vite' && <Clock size={16} className="inline text-blue-500" />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ))}

            {/* Methodology */}
            <section className="mb-16 p-8 rounded-[32px] bg-slate-900/5 border border-[var(--border-color)]">
                <h2 className="text-2xl font-bold mb-6">Methodology</h2>
                <div className="space-y-4 text-sm text-[var(--text-secondary)]">
                    <p>All benchmarks run on the same machine with:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Small App:</strong> 100 React components</li>
                        <li><strong>Large Monorepo:</strong> 5 packages, 2 apps (PNPM workspace)</li>
                        <li><strong>SSR:</strong> React with Express server</li>
                        <li><strong>Edge:</strong> Cloudflare/Vercel-compatible function</li>
                    </ul>
                    <p className="mt-4"><strong>Metrics Measured:</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Cold Start: Time to first dev server response</li>
                        <li>HMR: Hot Module Replacement latency</li>
                        <li>Build: Production build time</li>
                        <li>Memory: Peak heap usage</li>
                        <li>Bundle: Output size (JS + CSS)</li>
                    </ul>
                </div>
            </section>

            {/* Reproducibility */}
            <section className="mb-16 p-8 rounded-[32px] bg-blue-500/5 border border-blue-500/20">
                <h2 className="text-2xl font-bold mb-6">Reproduce These Benchmarks</h2>
                <pre className="p-6 rounded-xl bg-slate-900 text-blue-400 font-mono text-sm overflow-x-auto">
                    {`npm run build
npx tsx benchmarks/module7-benchmarks.ts`}
                </pre>
                <p className="text-sm text-[var(--text-secondary)] mt-4">
                    All benchmark code is available in the repository. Run them yourself to verify our claims.
                </p>
            </section>

            {/* Footer */}
            <section className="py-12 text-center border-t border-[var(--border-color)]">
                <p className="text-[var(--text-secondary)] mb-6">
                    Benchmarks generated: 2026-01-16 | Environment: Linux x64, Node v20.19.5
                </p>
                <Link
                    to="/docs/getting-started"
                    className="inline-flex h-14 items-center justify-center px-12 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all"
                >
                    Try Nexxo Now →
                </Link>
            </section>
        </div>
    );
};
