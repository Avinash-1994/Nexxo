import React from 'react';
import { Plug, Zap, Search, ShieldCheck, Box } from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';
import { Link } from 'react-router-dom';

export const Plugins: React.FC = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
                    Ecosystem
                </div>
                <h1 className="text-5xl font-black font-display mb-6 tracking-tight">Plugin Marketplace</h1>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                    Extend Nexxo with verified, sandboxed plugins. From legacy loaders to modern frameworks, we have you covered.
                </p>
            </div>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck className="text-emerald-500" size={32} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Verified & Secure</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-6">
                    All official `@nexxo/*` plugins are cryptographically signed and run in a WASM sandbox to prevent supply-chain attacks.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: '@nexxo/plugin-react', desc: 'Fast Refresh + JSX', dl: '50k/wk' },
                        { name: '@nexxo/plugin-vue', desc: 'SFC + JSX Support', dl: '32k/wk' },
                        { name: '@nexxo/plugin-typescript', desc: 'isolatedModules: true', dl: '120k/wk' },
                        { name: '@nexxo/plugin-tailwind', desc: 'JIT Engine Integration', dl: '85k/wk' },
                        { name: '@nexxo/plugin-pwa', desc: 'Service Worker Gen', dl: '15k/wk' },
                        { name: '@nexxo/plugin-image', desc: 'Avif/WebP Conversion', dl: '40k/wk' }
                    ].map(p => (
                        <div key={p.name} className="p-6 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] hover:border-blue-500/50 transition-all group">
                            <div className="font-mono text-xs font-bold text-blue-500 mb-2 truncate" title={p.name}>{p.name}</div>
                            <div className="text-sm font-medium mb-4">{p.desc}</div>
                            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                                <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-500" /> Verified</span>
                                <span>{p.dl}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Plug className="text-purple-500" size={32} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Compatibility Adapters</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-6">
                    Use your favorite Vite plugins and Webpack loaders directly in Nexxo.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold mb-3">Vite Plugin Adapter</h4>
                        <CodeBlock code={`import { defineConfig } from 'nexxo';
import { vitePluginAdapter } from '@nexxo/plugin-compat';
import viteSvgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    vitePluginAdapter(viteSvgr())
  ]
});`} />
                    </div>
                    <div>
                        <h4 className="font-bold mb-3">Webpack Loader Adapter</h4>
                        <CodeBlock code={`import { defineConfig } from 'nexxo';
import { webpackLoaderAdapter } from '@nexxo/plugin-compat';

export default defineConfig({
  plugins: [
    webpackLoaderAdapter({
      test: /\.custom$/,
      loader: 'custom-loader'
    })
  ]
});`} />
                    </div>
                </div>
            </section>

            <section className="mb-16 p-8 rounded-[32px] bg-slate-900 border border-slate-800">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-4">Author Your Own Plugin</h3>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                            Our Plugin API is simple, type-safe, and framework-agnostic. Publish to the marketplace and reach thousands of developers.
                        </p>
                        <Link to="/docs/getting-started" className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors">
                            Read Plugin API Docs
                        </Link>
                    </div>
                    <div className="flex-1 w-full">
                        <CodeBlock code={`export default function myPlugin() {
  return {
    name: 'my-plugin',
    transform(code, id) {
      if (!id.endsWith('.custom')) return;
      return {
        code: compile(code),
        map: null
      };
    }
  };
}`} />
                    </div>
                </div>
            </section>
        </div>
    );
};
