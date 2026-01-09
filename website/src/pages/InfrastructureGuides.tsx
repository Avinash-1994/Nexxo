import React from 'react';
import { useTheme } from '../components/ThemeContext';
import { Layers, CheckCircle2, Copy } from 'lucide-react';

import { CodeBlock } from '../components/CodeBlock';

export const InfrastructureGuides = ({ type }: { type: string }) => {
    const config = {
        tailwind: {
            name: 'Tailwind CSS',
            install: 'npm install -D tailwindcss postcss autoprefixer',
            example: `// nexxo.config.js
module.exports = {
  css: {
    framework: 'tailwind'
  },
  // Auto-detects tailwind.config.js
};`,
            description: 'Nexxo provides built-in PostCSS processing with dedicated Tailwind support for lightning-fast styling.'
        },
        sass: {
            name: 'SASS / SCSS',
            install: 'npm install -D sass',
            example: `// nexxo.config.js
module.exports = {
  css: {
    preprocessor: 'sass'
  }
};`,
            description: 'Support for SASS/SCSS with high-performance native compilation via Dart Sass.'
        },
        postcss: {
            name: 'PostCSS',
            install: 'npm install -D postcss autoprefixer cssnano',
            example: `// postcss.config.js
module.exports = {
  plugins: {
    autoprefixer: {},
    cssnano: {}
  }
};`,
            description: 'Standard PostCSS integration for advanced CSS transformations and optimizations.'
        }
    }[type.toLowerCase()] || { name: type, install: '', example: '', description: '' };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest mb-4">
                Infrastructure Guide
            </div>
            <h1 className="text-4xl lg:text-5xl font-black font-display mb-6 tracking-tight">{config.name} Integration</h1>
            <p className="text-lg text-[var(--text-secondary)] mb-10 leading-relaxed max-w-3xl">
                {config.description}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <section>
                    <h3 className="text-xl font-bold mb-4">Installation</h3>
                    <CodeBlock code={config.install} />

                    <div className="mt-8 p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)]/50">
                        <h4 className="font-bold flex items-center gap-2 mb-3">
                            <Layers size={18} className="text-blue-500" />
                            Build Phase
                        </h4>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                            CSS transformations happen in a dedicated pre-processing phase of the Nexxo graph, ensuring that styles are correctly linked before the JS bundle is generated.
                        </p>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-4">Usage</h3>
                    <CodeBlock code={config.example} />
                    <p className="text-sm text-[var(--text-secondary)] mt-4">
                        Import your styles directly in your entry point:
                    </p>
                    <CodeBlock code={`import './styles/main.css';`} />
                </section>
            </div>
        </div>
    );
};
