import React from 'react';
import { Shield, Lock, Globe, Server, AlertTriangle, FileCode, CheckCircle2 } from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';
import { Link } from 'react-router-dom';

export const Security: React.FC = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">
                    Security First
                </div>
                <h1 className="text-5xl font-black font-display mb-6 tracking-tight">Security & Compliance</h1>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                    Nexxo enforces security best practices by default. From CSP to dependency scanning, we've built a fortress for your application.
                </p>
            </div>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="text-blue-500" size={32} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Content Security Policy (CSP)</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-6">
                    Nexxo automatically generates strict CSP headers for your application, preventing XSS attacks by default.
                </p>

                <h3 className="text-xl font-bold mb-4">Automatic Configuration</h3>
                <CodeBlock code={`// nexxo.config.ts
export default defineConfig({
  security: {
    csp: {
      enabled: true,
      mode: 'strict', // 'strict' | 'report-only'
      nonce: true,    // Auto-generate nonces for scripts/styles
    }
  }
});`} />

                <div className="mt-6 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                    <h4 className="font-bold mb-2 flex items-center gap-2 text-blue-400">
                        <Lock size={16} /> How it works
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Nexxo injects a cryptographic nonce into every script and style tag at runtime, and adds the corresponding hash to the CSP header. Inline scripts without a valid nonce will be blocked by the browser.
                    </p>
                </div>
            </section>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Globe className="text-emerald-500" size={32} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Subresource Integrity (SRI)</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-6">
                    Ensure your CDN-hosted assets haven't been tampered with. Nexxo calculates SHA-384 hashes for all build artifacts.
                </p>
                <CodeBlock code={`// Generated HTML output
<script 
  src="/assets/main.js" 
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous">
</script>`} />
            </section>

            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Server className="text-purple-500" size={32} />
                    <h2 className="text-3xl font-black font-display tracking-tight">Environment Security</h2>
                </div>
                <p className="text-[var(--text-secondary)] mb-6">
                    Prevent accidental leakage of server-side secrets to the client bundle.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
                        <div className="flex items-center gap-2 text-red-500 font-bold mb-4">
                            <AlertTriangle size={20} /> BLOCKED
                        </div>
                        <CodeBlock code={`// ❌ This triggers a build error
console.log(process.env.DB_PASSWORD);
console.log(process.env.AWS_SECRET_KEY);`} />
                    </div>
                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold mb-4">
                            <CheckCircle2 size={20} /> ALLOWED
                        </div>
                        <CodeBlock code={`// ✅ Only PUBLIC_ prefixed vars are exposed
console.log(process.env.PUBLIC_API_URL);
console.log(process.env.PUBLIC_APP_NAME);`} />
                    </div>
                </div>
            </section>

            <section className="mb-16">
                <h2 className="text-3xl font-black font-display tracking-tight mb-6">Dependency Scanning</h2>
                <p className="text-[var(--text-secondary)] mb-6">
                    Run the built-in audit command to check your dependency tree for known vulnerabilities.
                </p>
                <CodeBlock code="npx nexxo audit --security" />
                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <CheckCircle2 size={16} className="text-emerald-500" /> Checks against OVS (Open Vulnerability Database)
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <CheckCircle2 size={16} className="text-emerald-500" /> Verifies package signatures where available
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <CheckCircle2 size={16} className="text-emerald-500" /> Detects malicious post-install scripts
                    </div>
                </div>
            </section>

            <div className="p-8 rounded-[32px] bg-slate-900 border border-slate-800 text-slate-300">
                <h3 className="text-xl font-bold text-white mb-4">Security Disclosure</h3>
                <p className="mb-6 text-sm leading-relaxed">
                    We take security seriously. If you find a vulnerability in Nexxo, please report it via our responsible disclosure program.
                </p>
                <div className="flex gap-4">
                    <a href="mailto:security@nexxo.dev" className="text-blue-400 hover:text-blue-300 font-bold text-sm">security@nexxo.dev</a>
                    <a href="#" className="text-slate-400 hover:text-white font-bold text-sm">Download PGP Key</a>
                </div>
            </div>
        </div>
    );
};
