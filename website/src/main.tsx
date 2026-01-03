import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Layout } from './components/Layout';
import { ThemeProvider } from './components/ThemeContext';
import { Home } from './pages/Home';
import { Docs } from './pages/Docs';
import { CoreConcepts } from './pages/CoreConcepts';
import { TechSpecs } from './pages/TechSpecs';
import { FrameworkGuides } from './pages/FrameworkGuides';
import { InfrastructureGuides } from './pages/InfrastructureGuides';
import { MicroFrontends } from './pages/MicroFrontends';
import { DecisionGuide } from './pages/DecisionGuide';
import { GovernanceHub } from './pages/GovernanceHub';
import { Glossary } from './pages/Glossary';
import { MfeFrameworkConstraint } from './pages/MfeFrameworkConstraint';
import { Play } from './pages/Play';
import { QualityGuide } from './pages/QualityGuide';
import Features from './pages/Features';
import { I18nProvider } from './components/I18nContext';
import './styles/theme.css';

const App = () => {
    const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentPath(window.location.hash || '#/');
            window.scrollTo(0, 0);
        };
        window.addEventListener('hashchange', handleHashChange);

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js').catch(err => {
                    console.error('SW registration failed:', err);
                });
            });
        }

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const renderContent = () => {
        if (currentPath.startsWith('#/guides/')) {
            const framework = currentPath.replace('#/guides/', '');
            return <FrameworkGuides framework={framework} />;
        }

        if (currentPath.startsWith('#/infra/')) {
            const type = currentPath.replace('#/infra/', '');
            return <InfrastructureGuides type={type} />;
        }

        switch (currentPath) {
            case '#/docs/getting-started':
                return <Docs />;
            case '#/docs/quality':
                return <QualityGuide />;
            case '#/docs/core-concepts':
                return <CoreConcepts />;
            case '#/docs/tech-specs':
                return <TechSpecs />;
            case '#/mfe/overview':
                return <MicroFrontends section="overview" />;
            case '#/mfe/architecture':
                return <MicroFrontends section="architecture" />;
            case '#/mfe/getting-started':
                return <MicroFrontends section="getting-started" />;
            case '#/mfe/patterns':
                return <MicroFrontends section="patterns" />;
            case '#/mfe/risks':
                return <MicroFrontends section="risks" />;
            case '#/mfe/framework-policy':
                return <MfeFrameworkConstraint />;
            case '#/docs/glossary':
                return <Glossary />;
            case '#/docs/decision-guide':
                return <DecisionGuide />;
            case '#/docs/governance':
                return <GovernanceHub />;
            case '#/play':
                return <Play />;
            case '#/features':
                return <Features />;
            case '#/':
            default:
                return <Home />;
        }
    };

    return (
        <ThemeProvider>
            <I18nProvider>
                <Layout>
                    {renderContent()}
                </Layout>
            </I18nProvider>
        </ThemeProvider>
    );
};

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
