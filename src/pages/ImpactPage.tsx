import { motion } from 'framer-motion'
import { ANIMATION_VARIANTS } from '@/lib/constants'
import { TrendingUp } from 'lucide-react'
import EventConfig from '@/components/impact/EventConfig'
import ForceGraphD3 from '@/components/impact/ForceGraphD3'
import ComparisonTable from '@/components/impact/ComparisonTable'
import AIRecommendations from '@/components/impact/AIRecommendations'
import { useImpactSimulation } from '@/hooks/useImpactSimulation'
import { useTranslation } from '@/hooks/useTranslation'

export default function ImpactPage() {
  const { result, isSimulating, simulate } = useImpactSimulation()
  const { t } = useTranslation()

  return (
    <motion.div {...ANIMATION_VARIANTS.fadeIn} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <TrendingUp className="h-7 w-7 text-brand-primary" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('impact.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('impact.subtitle')}</p>
        </div>
      </div>

      {/* Main layout: left panel + right graph */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
        {/* Left: Event Config */}
        <div className="order-2 lg:order-1">
          <EventConfig onSimulate={simulate} isSimulating={isSimulating} />
        </div>

        {/* Right: Force Graph */}
        <div className="order-1 lg:order-2 min-h-[300px] lg:min-h-0">
          <ForceGraphD3 data={result} isSimulating={isSimulating} />
        </div>
      </div>

      {/* Results section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <ComparisonTable comparison={result.comparison} />
          <AIRecommendations recommendations={result.recommendations} />
        </motion.div>
      )}
    </motion.div>
  )
}
