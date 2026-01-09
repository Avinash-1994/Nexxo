import React from 'react';
import { ShieldCheck, Search, Activity, Gauge, CheckCircle2, AlertTriangle, Terminal, LayoutDashboard } from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';

export const QualityGuide: React.FC = () => {
    return (
        <div className="animate-in fade-in duration-1000 pb-24">
            <div className="mb-16">
                <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
                    Development Quality
                </div>
                <h1 className="text-5xl lg:text-7xl font-black font-display mb-8 tracking-tighter italic">
                    Quality & Performance.
                </h1>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-4xl">
                    Nexxo isn't just a bundler; it's a quality assurance engine. With built-in support for SEO, Accessibility, and Performance auditing, you can ship production-grade software with confidence.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                {[
                    { title: "SEO", score: 100, icon: Search, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { title: "Accessibility", score: 90, icon: LayoutDashboard, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { title: "Performance", score: 80, icon: Gauge, color: "text-amber-500", bg: "bg-amber-500/10" },
                ].map((audit) => (
                    <div key={audit.title} className="p-8 rounded-[32px] border border-[var(--border-color)] bg-[var(--surface-color)] group hover:border-blue-500/50 transition-all text-center">
                        <div className={`w-16 h-16 ${audit.bg} ${audit.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                            <audit.icon size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{audit.title}</h3>
                        <div className={`text-4xl font-black ${audit.color} font-display tracking-tighter`}>{audit.score}</div>
                        <p className="text-xs text-[var(--text-secondary)] mt-2 uppercase font-bold tracking-widest">Target Score</p>
                    </div>
                ))}
            </div>

            <section className="mb-20">
                <div className="flex items-center gap-3 mb-6">
                    <Terminal className="text-blue-500" size={24} />
                    <h2 className="text-3xl font-black font-display tracking-tight text-left">Automatic Terminal Feedback</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-6 text-left">
                    Nexxo provides immediate feedback by automatically running audits after every successful build. You don't need to leave your terminal or run extra commands to see if your changes impacted site quality.
                </p>
                <CodeBlock code="nexxo build" />
                <p className="text-sm text-[var(--text-secondary)] mt-4 mb-6 text-left italic">
                    You can also run a targeted audit on any URL:
                </p>
                <CodeBlock code="nexxo audit --url http://localhost:5173" />
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)]/30">
                        <h4 className="font-bold flex items-center gap-2 mb-3">
                            <Activity size={18} className="text-blue-500" />
                            Real-time Feedback
                        </h4>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed text-left">
                            Get immediate warnings about missing alt tags, improper heading hierarchy, or unoptimized assets before you even commit code.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)]/30">
                        <h4 className="font-bold flex items-center gap-2 mb-3">
                            <ShieldCheck size={18} className="text-emerald-500" />
                            Pre-build Gates
                        </h4>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed text-left">
                            Configure Nexxo to block production builds if any audit score falls below your organization's threshold.
                        </p>
                    </div>
                </div>
            </section>



            <section className="p-10 rounded-[40px] bg-blue-600 shadow-2xl shadow-blue-500/25 text-white mb-24">
                <div className="flex items-start gap-4">
                    <CheckCircle2 size={32} className="shrink-0" />
                    <div className="text-left">
                        <h3 className="text-2xl font-bold mb-4">Why Architects Love It</h3>
                        <p className="text-blue-100 leading-relaxed">
                            Most tools require external plugins or CI steps for these checks. Nexxo integrates them directly into the build graph, making quality a first-class citizen of the development lifecycle. No more "fixing accessibility later"—fix it as you build.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};
