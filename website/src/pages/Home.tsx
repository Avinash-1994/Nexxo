import React from 'react';
import {
    Zap,
    ShieldCheck,
    Box,
    Code2,
    Terminal,
    Cpu,
    Globe,
    Activity,
    CheckCircle2,
    Clock,
    Rocket,
    Copy
} from 'lucide-react';
import { useI18n } from '../components/I18nContext';

const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        'Stable': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'Verified': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'Experimental': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'Upcoming': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[status] || colors.Stable}`}>
            {status}
        </span>
    );
};

const CodeBlock = ({ code, language = 'bash' }: { code: string, language?: string }) => {
    const [copied, setCopied] = React.useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group rounded-xl overflow-hidden bg-slate-900 border border-slate-800 my-6 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{language}</span>
                    <button
                        onClick={copyToClipboard}
                        className="text-slate-500 hover:text-white transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                </div>
            </div>
            <pre className="p-6 text-sm font-mono text-blue-400 overflow-x-auto leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    );
};

export const Home: React.FC = () => {
    const { t } = useI18n();
    return (
        <div className="animate-in fade-in duration-1000">
            {/* Hero Section */}
            <section className="mb-24 pt-12 text-center lg:text-left relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold mb-8 animate-bounce">
                    <Rocket size={14} />
                    <span>v1.0.0 Stable Release</span>
                </div>
                <h1 className="text-6xl lg:text-8xl font-black font-display tracking-tighter text-[var(--text-primary)] leading-[0.95] mb-8">
                    {t('hero.title')}
                </h1>
                <p className="text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed mb-10 mx-auto lg:mx-0">
                    {t('hero.subtitle')}
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                    <a
                        href="#/docs/getting-started"
                        className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 hover:-translate-y-1 transition-all shadow-xl shadow-blue-500/25 active:scale-95"
                    >
                        Deploy Project →
                    </a>
                    <a
                        href="https://github.com"
                        className="px-8 py-4 border border-[var(--border-color)] font-bold rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95"
                    >
                        GitHub
                    </a>
                </div>
            </section>

            {/* Getting Started Fast */}
            <section className="mb-24">
                <div className="flex items-center gap-3 mb-6">
                    <Terminal size={24} className="text-blue-500" />
                    <h2 className="text-2xl font-bold font-display tracking-tight">One Command, Zero Config</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                            Get started in seconds. Urja auto-detects your framework and configures the optimal build pipeline with best-in-class HMR.
                        </p>
                        <ul className="space-y-4">
                            {[
                                'Rust-backed asset processing',
                                'Sub-50ms HMR Latency',
                                'Zero-leakage framework isolation',
                                'Deterministic dependency graph'
                            ].map(item => (
                                <li key={item} className="flex items-center gap-3 text-sm font-medium">
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <CodeBlock code="$ npx urja build --preset react" />
                </div>
            </section>

            {/* Status Dashboard */}
            <section className="mb-24 py-16 px-8 rounded-[32px] bg-slate-900/5 border border-slate-500/10 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Activity size={200} className="text-blue-500" />
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-3xl font-black font-display mb-2">Ecosystem Health</h2>
                        <p className="text-[var(--text-secondary)]">Live status of official adapters and core engine.</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> STABLE</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500" /> EXPERIMENTAL</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: 'React', status: 'Stable', version: 'v1.4.2', icon: Code2 },
                        { name: 'Vue', status: 'Stable', version: 'v1.2.0', icon: Code2 },
                        { name: 'Angular', status: 'Verified', version: 'v1.0.5', icon: Code2 },
                        { name: 'Svelte', status: 'Stable', version: 'v1.1.0', icon: Code2 },
                        { name: 'Solid', status: 'Stable', version: 'v1.0.8', icon: Code2 },
                        { name: 'Astro', status: 'Stable', version: 'v1.0.1', icon: Globe },
                        { name: 'SSR Support', status: 'Experimental', version: 'Beta', icon: Cpu },
                        { name: 'Multi-Target', status: 'Upcoming', version: 'Q1 2026', icon: Activity },
                        { name: 'Native Worker', status: 'Stable', version: 'Rust-v2', icon: ShieldCheck },
                    ].map(item => (
                        <div key={item.name} className="p-5 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] group hover:border-blue-500 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <item.icon size={20} className="text-blue-500" />
                                <StatusBadge status={item.status} />
                            </div>
                            <h4 className="font-bold text-lg mb-1">{item.name}</h4>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-secondary)]">
                                <Clock size={10} /> {item.version}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="py-24 text-center border-t border-[var(--border-color)]">
                <h2 className="text-4xl font-black font-display mb-6 italic tracking-tight uppercase">Ready to Ascend?</h2>
                <p className="text-[var(--text-secondary)] max-w-xl mx-auto mb-10 text-lg">
                    Join the architects building stable, long-term foundations without tool-dictated constraints.
                </p>
                <a href="#/docs/getting-started" className="inline-flex h-14 items-center justify-center px-12 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold hover:scale-105 transition-transform active:scale-95 shadow-2xl">
                    Start Building Now
                </a>
            </section>
        </div>
    );
};
