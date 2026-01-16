import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ThemeProvider } from './components/ThemeContext';
import { I18nProvider } from './components/I18nContext';

// Lazy load pages for performance
const Home = React.lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Docs = React.lazy(() => import('./pages/Docs').then(module => ({ default: module.Docs })));
const CoreConcepts = React.lazy(() => import('./pages/CoreConcepts').then(module => ({ default: module.CoreConcepts })));
const TechSpecs = React.lazy(() => import('./pages/TechSpecs').then(module => ({ default: module.TechSpecs })));
const FrameworkGuides = React.lazy(() => import('./pages/FrameworkGuides').then(module => ({ default: module.FrameworkGuides })));
const InfrastructureGuides = React.lazy(() => import('./pages/InfrastructureGuides').then(module => ({ default: module.InfrastructureGuides })));
const MicroFrontends = React.lazy(() => import('./pages/MicroFrontends').then(module => ({ default: module.MicroFrontends })));
const DecisionGuide = React.lazy(() => import('./pages/DecisionGuide').then(module => ({ default: module.DecisionGuide })));
const GovernanceHub = React.lazy(() => import('./pages/GovernanceHub').then(module => ({ default: module.GovernanceHub })));
const Glossary = React.lazy(() => import('./pages/Glossary').then(module => ({ default: module.Glossary })));
const MfeFrameworkConstraint = React.lazy(() => import('./pages/MfeFrameworkConstraint').then(module => ({ default: module.MfeFrameworkConstraint })));
const Play = React.lazy(() => import('./pages/Play').then(module => ({ default: module.Play })));
const QualityGuide = React.lazy(() => import('./pages/QualityGuide').then(module => ({ default: module.QualityGuide })));
const Features = React.lazy(() => import('./pages/Features')); // This was default export
const Benchmarks = React.lazy(() => import('./pages/Benchmarks').then(module => ({ default: module.Benchmarks })));
const Migration = React.lazy(() => import('./pages/Migration').then(module => ({ default: module.Migration })));
const Security = React.lazy(() => import('./pages/Security').then(module => ({ default: module.Security })));
const Plugins = React.lazy(() => import('./pages/Plugins').then(module => ({ default: module.Plugins })));
const TemplateStarters = React.lazy(() => import('./pages/TemplateStarters').then(module => ({ default: module.TemplateStarters })));

import './styles/theme.css';

const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const App = () => {
    return (
        <ThemeProvider>
            <I18nProvider>
                <BrowserRouter>
                    <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                            <Routes>
                                {/* Home */}
                                <Route path="/" element={<Home />} />

                                {/* Features & Benchmarks */}
                                <Route path="/features" element={<Features />} />
                                <Route path="/benchmarks" element={<Benchmarks />} />

                                {/* Ecosystem */}
                                <Route path="/migration" element={<Migration />} />
                                <Route path="/security" element={<Security />} />
                                <Route path="/plugins" element={<Plugins />} />
                                <Route path="/templates" element={<TemplateStarters />} />

                                {/* Documentation */}
                                <Route path="/docs/getting-started" element={<Docs />} />
                                <Route path="/docs/quality" element={<QualityGuide />} />
                                <Route path="/docs/core-concepts" element={<CoreConcepts />} />
                                <Route path="/docs/tech-specs" element={<TechSpecs />} />
                                <Route path="/docs/glossary" element={<Glossary />} />
                                <Route path="/docs/decision-guide" element={<DecisionGuide />} />
                                <Route path="/docs/governance" element={<GovernanceHub />} />

                                {/* Framework Guides */}
                                <Route path="/guides/:framework" element={<FrameworkGuides />} />

                                {/* Infrastructure Guides */}
                                <Route path="/infra/:type" element={<InfrastructureGuides />} />

                                {/* Micro-Frontends */}
                                <Route path="/mfe/overview" element={<MicroFrontends section="overview" />} />
                                <Route path="/mfe/architecture" element={<MicroFrontends section="architecture" />} />
                                <Route path="/mfe/getting-started" element={<MicroFrontends section="getting-started" />} />
                                <Route path="/mfe/patterns" element={<MicroFrontends section="patterns" />} />
                                <Route path="/mfe/risks" element={<MicroFrontends section="risks" />} />
                                <Route path="/mfe/framework-policy" element={<MfeFrameworkConstraint />} />

                                {/* Play/Experimental */}
                                <Route path="/play" element={<Play />} />

                                {/* Catch-all redirect to home */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Suspense>
                    </Layout>
                </BrowserRouter>
            </I18nProvider>
        </ThemeProvider>
    );
};

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
