import React from 'react';
import {
    ShieldAlert,
    Layout,
    Workflow,
    Layers,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Copy
} from 'lucide-react';

import { CodeBlock } from '../components/CodeBlock';

export const MfeFrameworkConstraint: React.FC = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-24">
            {/* Introduction */}
            <div className="mb-16">
                <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
                    Architectural Policy
                </div>
                <h1 className="text-4xl lg:text-6xl font-black font-display mb-8 tracking-tighter leading-tight">
                    Why Nexxo Enforces One Framework per Micro-Frontend
                </h1>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-4xl">
                    Nexxo enforces one framework per micro-frontend container by design. This is an intentional architectural decision, not a technical limitation, designed to ensure determinism and long-term maintainability.
                </p>
            </div>

            {/* The Common Misconception */}
            <section className="mb-20">
                <h2 className="text-3xl font-black font-display mb-6 tracking-tight">The Common Misconception</h2>
                <div className="p-8 rounded-3xl bg-[var(--surface-color)] border border-[var(--border-color)]">
                    <p className="text-[var(--text-secondary)] leading-relaxed italic">
                        "Advanced micro-frontends should allow multiple frameworks (e.g., React and Vue) to coexist inside a single container to maximize developer flexibility."
                    </p>
                    <p className="mt-4 text-sm text-[var(--text-secondary)]">
                        This belief often stems from the permissiveness of general-purpose tools like Webpack or Vite. However, in enterprise-grade architecture, this is considered an anti-pattern that hides complexity rather than managing it.
                    </p>
                </div>
            </section>

            {/* Real Production Systems */}
            <section className="mb-20">
                <h2 className="text-3xl font-black font-display mb-6 tracking-tight">How Micro-Frontends Are Built in Real Production</h2>
                <p className="text-[var(--text-secondary)] mb-8 max-w-3xl">
                    In mature platforms, composition happens at the shell (host) level, not inside a single container. Each deployable unit represents a clean framework boundary.
                </p>
                <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 font-mono text-sm text-blue-400 mb-8">
                    <div className="flex items-center gap-2 mb-2">Shell (Host Application: React)</div>
                    <div className="pl-6 border-l border-slate-700 space-y-2">
                        <div className="flex items-center gap-2">├─ Remote A (React: Product Dashboard)</div>
                        <div className="flex items-center gap-2">├─ Remote B (Vue: Analytics Widget)</div>
                        <div className="flex items-center gap-2">└─ Remote C (Lit: Design System Components)</div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: "Single Ownership", desc: "One team, one framework, one deployable unit." },
                        { title: "Clean Boundaries", desc: "Isolation is enforced by the Build Graph." },
                        { title: "Independent Upgrades", desc: "Upgrading Remote A never breaks Remote B." },
                        { title: "Explicit Contracts", desc: "Communication via stable Props/Events/State." }
                    ].map((item, i) => (
                        <div key={i} className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)]/50">
                            <h4 className="font-bold text-sm mb-2">{item.title}</h4>
                            <p className="text-xs text-[var(--text-secondary)] leading-normal">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why Multiple Frameworks in One Container is Dangerous */}
            <section className="mb-20">
                <h2 className="text-3xl font-black font-display mb-6 tracking-tight text-red-600">The Technical Risks of "Multi-Framework Containers"</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ul className="space-y-6">
                        <li className="flex gap-4">
                            <ShieldAlert className="text-red-500 shrink-0" size={24} />
                            <div>
                                <h4 className="font-bold">Lifecycle Collisions</h4>
                                <p className="text-sm text-[var(--text-secondary)]">Conflicting rendering cycles between frameworks inside a single DOM subtree lead to unpredictable memory leaks and hydration mismatches.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <AlertTriangle className="text-red-500 shrink-0" size={24} />
                            <div>
                                <h4 className="font-bold">Global State Corruption</h4>
                                <p className="text-sm text-[var(--text-secondary)]">Shared globals and window-level proxies frequently overwrite each other, making debugging a nightmare.</p>
                            </div>
                        </li>
                    </ul>
                    <ul className="space-y-6">
                        <li className="flex gap-4">
                            <XCircle className="text-red-500 shrink-0" size={24} />
                            <div>
                                <h4 className="font-bold">Impossible Upgrades</h4>
                                <p className="text-sm text-[var(--text-secondary)]">When two frameworks are coupled in one container, you cannot upgrade one without verifying the side effects on the other.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <Layers className="text-red-500 shrink-0" size={24} />
                            <div>
                                <h4 className="font-bold">Non-Deterministic Runtime</h4>
                                <p className="text-sm text-[var(--text-secondary)]">The order of execution becomes dependent on subtle timing issues rather than logic.</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <p className="mt-8 p-6 rounded-2xl bg-red-500/5 border border-red-500/10 text-center text-sm font-semibold italic">
                    "Tools that allow this do not protect you—they simply do not stop you."
                </p>
            </section>

            {/* Nexxo's Architectural Decision */}
            <section className="mb-20">
                <h2 className="text-3xl font-black font-display mb-6 tracking-tight">Nexxo's Architectural Stance</h2>
                <div className="space-y-4 max-w-3xl">
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                        Nexxo prefers preventing unsafe architectures over enabling every possible configuration. Our engine enforces a 1:1 relationship between an **Adapter** and a **Micro-Frontend Container**.
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            "One framework runtime per container",
                            "Strict Federation boundaries",
                            "Deterministic Graph validation",
                            "No silent fallbacks"
                        ].map(item => (
                            <li key={item} className="flex items-center gap-2 text-sm font-medium">
                                <CheckCircle2 size={16} className="text-blue-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Real Multi-Framework Example */}
            <section className="mb-20">
                <h2 className="text-3xl font-black font-display mb-6 tracking-tight">Correct Multi-Framework Setup</h2>
                <p className="text-[var(--text-secondary)] mb-8 max-w-3xl">
                    You can absolutely build a multi-framework ecosystem with Nexxo. The key is in how you organize your packages.
                </p>
                <div className="p-2">
                    <CodeBlock code={`repo/
 ├─ packages/
 │   ├─ shell-app (React)     <-- Consumes remotes
 │   ├─ marketing-site (Vue)  <-- Independent Remote
 │   ├─ admin-panel (React)   <-- Independent Remote
 │   └─ design-system (Lit)   <-- Shared Web Components`} />
                </div>
                <div className="space-y-4 text-sm text-[var(--text-secondary)] mt-6">
                    <p>• <strong>Isolation</strong>: Each remote has its own <code>nexxo.config.js</code> and specific adapter.</p>
                    <p>• <strong>Scalability</strong>: Teams can deploy their remotes independently without framework conflicts.</p>
                    <p>• <strong>Interoperability</strong>: Use standard Web Components (Lit) for cross-framework UI components.</p>
                </div>
            </section>

            {/* Explicit Warning Box */}
            <section className="mb-20">
                <div className="p-10 rounded-[40px] bg-red-500/10 border-2 border-red-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-red-500">
                        <AlertTriangle size={120} />
                    </div>
                    <h3 className="text-2xl font-black mb-4 flex items-center gap-3 text-red-600">
                        <AlertTriangle size={28} /> Important
                    </h3>
                    <div className="text-[var(--text-primary)] leading-relaxed font-medium">
                        <p className="mb-4">
                            If your use case requires running multiple frontend frameworks inside a single micro-frontend container, <strong>Nexxo is not the right tool for that case</strong>.
                        </p>
                        <p>
                            Nexxo intentionally enforces strict boundaries to preserve determinism, isolation, and long-term maintainability. We do not compromise on these principles for the sake of experimental flexibility.
                        </p>
                    </div>
                </div>
            </section>

            {/* Benefit vs Constraint */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
                <section>
                    <h4 className="text-xl font-bold mb-6 text-emerald-600">This rule is a benefit when:</h4>
                    <ul className="space-y-4">
                        {[
                            "You build long-lived enterprise systems",
                            "Teams own independent remotes with clear SLAs",
                            "Stability matters more than experimental flexibility",
                            "You want predictable, automated upgrades"
                        ].map(item => (
                            <li key={item} className="flex gap-3 text-sm text-[var(--text-secondary)]">
                                <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>
                <section>
                    <h4 className="text-xl font-bold mb-6 text-slate-500">This rule is a constraint when:</h4>
                    <ul className="space-y-4">
                        {[
                            "You are doing short-term hacky migrations",
                            "You need experimental framework mixing locally",
                            "You prioritize flexibility over correctness",
                            "You are building a rapid POC without long-term maintenance"
                        ].map(item => (
                            <li key={item} className="flex gap-3 text-sm text-[var(--text-secondary)]">
                                <ArrowRight className="text-slate-400 shrink-0" size={18} />
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <div className="text-center py-16 border-t border-[var(--border-color)]">
                <p className="text-2xl font-black font-display tracking-tight text-[var(--text-secondary)] max-w-2xl mx-auto italic leading-normal">
                    "Nexxo enforces one framework per micro-frontend not because it cannot do otherwise, but because systems that last require boundaries."
                </p>
                <div className="flex justify-center gap-6 mt-12">
                    <a href="#/mfe/overview" className="text-sm font-bold text-blue-500 border-b border-blue-500 pb-1 hover:text-blue-600 transition-colors">MFE Overview</a>
                    <a href="#/docs/governance" className="text-sm font-bold text-blue-500 border-b border-blue-500 pb-1 hover:text-blue-600 transition-colors">Governance Policy</a>
                    <a href="#/docs/decision-guide" className="text-sm font-bold text-blue-500 border-b border-blue-500 pb-1 hover:text-blue-600 transition-colors">When Not to use Nexxo</a>
                </div>
            </div>
        </div>
    );
};
