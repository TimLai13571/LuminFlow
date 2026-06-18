import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'
import { ANIMATION_VARIANTS } from '@/lib/constants'
import { useSamplingPreview } from '@/hooks/useSamplingPreview'
import { Skeleton } from '@/components/ui/skeleton'
import { SampleSizeCard } from '@/components/sampling/SampleSizeCard'
import { SunburstChart } from '@/components/sampling/SunburstChart'
import { TimeWindowCard } from '@/components/sampling/TimeWindowCard'
import { SamplingMethodology } from '@/components/sampling/SamplingMethodology'
import { EventReinforcementPanel } from '@/components/sampling/EventReinforcementPanel'
import { HistoryBarChart } from '@/components/sampling/HistoryBarChart'
import { SampleTable } from '@/components/sampling/SampleTable'
import { useTranslation } from '@/hooks/useTranslation'

export default function SamplingPage() {
  const {
    samplingPlan,
    selectedCategory,
    setSelectedCategory,
    isLoading,
  } = useSamplingPreview()
  const { t } = useTranslation()

  if (isLoading || !samplingPlan) {
    return (
      <motion.div {...ANIMATION_VARIANTS.fadeIn} className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Filter className="h-7 w-7 text-brand-primary" />
          <h1 className="text-2xl font-bold text-text-primary">{t('sampling.title')}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-card" />
          <Skeleton className="h-64 rounded-card" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div {...ANIMATION_VARIANTS.fadeIn} className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <Filter className="h-7 w-7 text-brand-primary" />
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('sampling.title')}</h1>
          <p className="text-sm text-gray-500">{t('sampling.subtitle')}</p>
        </div>
      </div>

      {/* 顶部行：SampleSizeCard + TimeWindowCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SampleSizeCard plan={samplingPlan} />
        <TimeWindowCard windows={samplingPlan.timeWindows} />
      </div>

      {/* 中间行：SunburstChart + SamplingMethodology */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SunburstChart
          data={samplingPlan.documentDistribution}
          onCategorySelect={setSelectedCategory}
        />
        <SamplingMethodology />
      </div>

      {/* 事件驱动补强抽样 */}
      <EventReinforcementPanel
        elevatedControls={samplingPlan.elevatedControls}
        baseRange={samplingPlan.totalRange}
      />

      {/* 下方行：HistoryBarChart + SampleTable */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <HistoryBarChart data={samplingPlan.historicalTrend} />
        </div>
        <div className="lg:col-span-3">
          <SampleTable
            categories={samplingPlan.documentDistribution}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>
    </motion.div>
  )
}
