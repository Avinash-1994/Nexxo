import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import { useThemeStore } from './stores/themeStore'
import LandingPage from './pages/LandingPage'

// Lazy load heavy components
const PipelineBuilder = lazy(() => import('./features/pipeline-builder/PipelineBuilder'))
const DocsLayout = lazy(() => import('./features/docs/DocsLayout'))
const DocsPage = lazy(() => import('./features/docs/DocsPage'))

// Loading component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  const theme = useThemeStore((state) => state.theme)

  return (
    <div className={theme}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/builder" element={<PipelineBuilder />} />
            <Route path="/docs" element={<DocsLayout />}>
              <Route path=":category/:page" element={<DocsPage />} />
              <Route index element={<Navigate to="/docs/getting-started/introduction" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  )
}
