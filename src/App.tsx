import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { AppLayout } from '@/components/layout/AppLayout'
import DashboardPage from '@/pages/DashboardPage'
import ObjectivePage from '@/pages/ObjectivePage'
import SamplingPage from '@/pages/SamplingPage'
import ImpactPage from '@/pages/ImpactPage'
import TeamPanelPage from '@/pages/TeamPanelPage'
import HeatLensPage from '@/pages/HeatLensPage'
import PBCViewPage from '@/pages/PBCViewPage'
import NarrativeLensPage from '@/pages/NarrativeLensPage'
import { useAuthStore } from '@/store/auth-store'
import { hasPermission, type Permission } from '@/lib/permissions'
import { useTranslation } from '@/hooks/useTranslation'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
}

function NoPermission() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="text-6xl mb-4">🔒</div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('permission.noAccess')}</h2>
      <p className="text-sm text-gray-500">{t('permission.noAccessDesc')}</p>
    </div>
  )
}

function ProtectedRoute({ permission, children }: { permission: Permission; children: React.ReactNode }) {
  const currentRole = useAuthStore((s) => s.currentRole)
  if (!hasPermission(currentRole, permission)) {
    return <NoPermission />
  }
  return <>{children}</>
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} {...pageTransition} className="h-full">
        <Routes location={location}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            {/* Phase 1: Planning */}
            <Route path="/tracemap" element={
              <ProtectedRoute permission="view_objectives">
                <ObjectivePage />
              </ProtectedRoute>
            } />
            <Route path="/heatlens" element={
              <ProtectedRoute permission="view_heatlens">
                <HeatLensPage />
              </ProtectedRoute>
            } />
            {/* Phase 2: Execution */}
            <Route path="/sampling" element={
              <ProtectedRoute permission="view_sampling">
                <SamplingPage />
              </ProtectedRoute>
            } />
            <Route path="/pbcview" element={
              <ProtectedRoute permission="view_pbcview">
                <PBCViewPage />
              </ProtectedRoute>
            } />
            {/* Phase 3: Assessment & Communication */}
            <Route path="/narrative" element={
              <ProtectedRoute permission="view_narrative">
                <NarrativeLensPage />
              </ProtectedRoute>
            } />
            <Route path="/impact" element={
              <ProtectedRoute permission="view_impact">
                <ImpactPage />
              </ProtectedRoute>
            } />
            {/* Tools */}
            <Route path="/team" element={
              <ProtectedRoute permission="view_team">
                <TeamPanelPage />
              </ProtectedRoute>
            } />
            {/* Legacy redirect */}
            <Route path="/objective" element={<Navigate to="/tracemap" replace />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App
