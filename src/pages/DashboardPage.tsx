import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Settings, ArrowRight } from 'lucide-react'
import { ANIMATION_VARIANTS } from '@/lib/constants'
import { useAuthStore } from '@/store/auth-store'
import { getKPIMetrics, getControls, getRCMMatrix } from '@/services/mock-data'
import type { KPIMetric, Control, RCMEntry } from '@/types/audit'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import { GlossaryTerm } from '@/components/ui/glossary-term'

import KPICards from '@/components/dashboard/KPICards'
import AuditStepper from '@/components/dashboard/AuditStepper'
import RiskHeatmap from '@/components/dashboard/RiskHeatmap'
import StatusDoughnut from '@/components/dashboard/StatusDoughnut'
import ProjectCard from '@/components/dashboard/ProjectCard'
import PendingItems from '@/components/dashboard/PendingItems'
import ActivityTimeline from '@/components/dashboard/ActivityTimeline'

export default function DashboardPage() {
  const { currentRole, userName } = useAuthStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState<KPIMetric[]>([])
  const [controls, setControls] = useState<Control[]>([])
  const [rcmData, setRcmData] = useState<RCMEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [kpiData, controlsData, rcm] = await Promise.all([
        getKPIMetrics(currentRole),
        getControls(),
        getRCMMatrix(),
      ])
      setMetrics(kpiData)
      setControls(controlsData)
      setRcmData(rcm)
      setLoading(false)
    }
    loadData()
  }, [currentRole])

  const getWelcomeMessage = () => {
    switch (currentRole) {
      case 'cfo':
        return t('dashboard.welcome.cfo', { name: userName })
      case 'auditor':
        return t('dashboard.welcome.auditor', { name: userName })
      case 'partner':
        return t('dashboard.welcome.partner', { name: userName })
      default:
        return t('dashboard.welcome.default', { name: userName })
    }
  }

  if (loading) {
    return (
      <motion.div {...ANIMATION_VARIANTS.fadeIn} className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <LayoutDashboard className="h-7 w-7 text-brand-primary" />
          <h1 className="text-2xl font-bold text-text-primary">{t('dashboard.title')}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-card" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-card" />
          <Skeleton className="h-64 rounded-card" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div {...ANIMATION_VARIANTS.fadeIn} className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-7 w-7 text-brand-primary" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{t('dashboard.title')}</h1>
            <p className="text-sm text-text-secondary mt-0.5">
              {getWelcomeMessage().split('KPI').map((part, idx, arr) => (
                <span key={idx}>
                  {part}
                  {idx < arr.length - 1 && (
                    <GlossaryTerm term="kpi">KPI</GlossaryTerm>
                  )}
                </span>
              ))}
            </p>
          </div>
        </div>
        {currentRole === 'auditor' && (
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-brand-primary hover:bg-brand-light rounded-btn transition-colors">
            <Settings className="h-4 w-4" />
            <span>{t('dashboard.config')}</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <KPICards metrics={metrics} />

      {/* Quick Links to new modules */}
      {(currentRole === 'auditor' || currentRole === 'partner') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-brand-light/50"
            onClick={() => navigate('/heatlens')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <span className="text-xl">🔥</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{t('nav.heatlens')}</p>
                  <p className="text-xs text-text-secondary">{t('heatlens.subtitle').slice(0, 40)}…</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-text-muted" />
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow border-brand-light/50"
            onClick={() => navigate('/pbcview')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{t('nav.pbcview')}</p>
                  <p className="text-xs text-text-secondary">{t('dashboard.viewPBCDetails')}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-text-muted" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Middle section */}
      {currentRole === 'cfo' ? (
        /* CFO: simplified view - KPI focus + project overview */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StatusDoughnut controls={controls} />
          </div>
          <div>
            <ProjectCard />
          </div>
        </div>
      ) : currentRole === 'partner' ? (
        /* Partner: multi-project quality overview */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskHeatmap rcmData={rcmData} onViewFull={() => navigate('/heatlens')} />
            <StatusDoughnut controls={controls} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityTimeline />
            <PendingItems />
          </div>
        </>
      ) : (
        /* Auditor: full view */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskHeatmap rcmData={rcmData} onViewFull={() => navigate('/heatlens')} />
            <StatusDoughnut controls={controls} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <AuditStepper />
              <ActivityTimeline />
            </div>
            <div className="space-y-6">
              <ProjectCard />
              <PendingItems />
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
