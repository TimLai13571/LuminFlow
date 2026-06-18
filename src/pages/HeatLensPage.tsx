import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { ANIMATION_VARIANTS } from '@/lib/constants'
import { useTranslation } from '@/hooks/useTranslation'
import { useHeatLens } from '@/hooks/useHeatLens'
import RiskScoringPanel from '@/components/heatlens/RiskScoringPanel'
import RiskHeatmapFull from '@/components/heatlens/RiskHeatmapFull'
import FactorBreakdown from '@/components/heatlens/FactorBreakdown'

export default function HeatLensPage() {
  const { t } = useTranslation()
  const {
    factors,
    rcmRiskScores,
    factorBreakdown,
    weights,
    isCalculating,
    updateWeight,
    recalculate,
    resetWeights,
  } = useHeatLens()

  return (
    <motion.div {...ANIMATION_VARIANTS.fadeIn} className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Flame className="h-7 w-7 text-brand-primary" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('heatlens.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('heatlens.subtitle')}</p>
        </div>
      </div>

      {/* Layout: Left 320px Scoring Panel + Right Full Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left: Scoring Panel */}
        <div>
          <RiskScoringPanel
            weights={weights}
            isCalculating={isCalculating}
            onWeightChange={updateWeight}
            onRecalculate={recalculate}
            onReset={resetWeights}
          />
        </div>

        {/* Right: Full Heatmap */}
        <div>
          <RiskHeatmapFull rcmRiskScores={rcmRiskScores} />
        </div>
      </div>

      {/* Bottom: Factor Breakdown */}
      <FactorBreakdown breakdown={factorBreakdown} />
    </motion.div>
  )
}
