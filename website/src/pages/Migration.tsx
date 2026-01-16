import React from 'react';
import { ArrowRightLeft, FileJson, CheckCircle2, AlertTriangle, Terminal } from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';
import { Link } from 'react-router-dom';

export const Migration: React.FC = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
                    Migration Guide
                </div>
                <h1 className="text-5xl font-black font-display mb-6 tracking-tight">Migrating to Nexxo</h1>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                    Nexxo includes automated tools to help you migrate from Vite, Webpack, and CRA (Create React App). Most projects can be migrated in under 15 minutes.
                </p>
            </div>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Terminal className="text-blue-500" size={32} />
                    <h2 className="text-3xl font-black font-display tracking-tight">The Migration Doctor</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-6">
                    The safest way to start is running the migration analyzer. It scans your project and generates a migration plan without changing any files.
                </p>
                <CodeBlock code="npx nexxo migrate --dry-run" language="bash" />

                <div className="mt-8 p-6 rounded-2xl bg-slate-900 border border-slate-800">
                    <h3 className="text-emerald-400 font-bold mb-4 text-sm uppercase tracking-wide">Analyzer Output Example</h3>
                    <pre className="font-mono text-xs md:text-sm text-slate-300 overflow-x-auto whitespace-pre">
                        {`🔍 Analyzing project...

✅ Detected: Vite + React + TypeScript
✅ Found: 15 dependencies, 3 plugins
✅ Risk Level: LOW

📋 Migration Plan:
  Auto-migrate:
    ✓ Entry points (index.html, src/main.tsx)
    ✓ Aliases (@/ → src/)
    ✓ Environment variables (.env)
    
  Manual steps:
    ⚠ vite-plugin-pwa → Check @nexxo/plugin-pwa

📊 Expected Success Rate: 95%`}
                    </pre>
                </div>
            </section>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <ArrowRightLeft className="text-purple-500" size={32} />
                    <h2 className="text-3xl font-black font-display tracking-tight">From Vite</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-6">
                    Nexxo uses a similar configuration schema to Vite, making migration straightforward. The main difference is plugin compatibility.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold mb-3 text-red-400">vite.config.ts</h4>
                        <CodeBlock code={`import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' }
  }
});`} />
                    </div>
                    <div>
                        <h4 className="font-bold mb-3 text-emerald-400 gap-2 flex items-center">nexxo.config.ts <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">Recommended</span></h4>
                        <CodeBlock code={`import { defineConfig } from 'nexxo';

export default defineConfig({
  adapter: 'react-adapter', // Includes React plugin
  resolve: {
    alias: { '@': './src' }
  }
});`} />
                    </div>
                </div>
            </section>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <FileJson className="text-amber-500" size={32} />
                    <h2 className="text-3xl font-black font-display tracking-tight">From Webpack / CRA</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-6">
                    Webpack migrations typically see a <strong>10-50x improvement</strong> in dev server cold start times.
                </p>

                <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="text-emerald-500 mt-1" size={18} />
                        <div>
                            <h4 className="font-bold">Loaders are auto-handled</h4>
                            <p className="text-sm text-[var(--text-secondary)]">You don't need `style-loader`, `css-loader`, or `file-loader`. Nexxo handles CSS, images, and fonts out of the box.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="text-emerald-500 mt-1" size={18} />
                        <div>
                            <h4 className="font-bold">Environment Variables</h4>
                            <p className="text-sm text-[var(--text-secondary)]">Nexxo loads usage of `process.env` automatically relative to `.env` files. Ensure your public variables are prefixed with `PUBLIC_`.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                    <h4 className="font-bold mb-2 flex items-center gap-2 text-amber-500">
                        <AlertTriangle size={18} /> Common Gotcha
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                        In Webpack, `require.context` is often used for dynamic imports. In Nexxo, use `import.meta.glob('./dir/*.js')` instead.
                    </p>
                </div>
            </section>

            <section className="p-8 rounded-[32px] bg-blue-600 shadow-2xl shadow-blue-500/25 text-white">
                <h3 className="text-2xl font-bold mb-4">Need Manual Assistance?</h3>
                <p className="mb-6 opacity-90">
                    For large enterprise migrations (> 1M LOC), our team provides dedicated support and custom migration scripts.
                </p>
                <a href="https://github.com/avinash-1994/nexxo/issues" className="inline-flex px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                    Open Migration Issue
                </a>
            </section>
        </div>
    );
};
