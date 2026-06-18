import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import type { SamplingPlan } from '@/types/sampling'

interface SampleSizeCardProps {
  plan: SamplingPlan
}

export function SampleSizeCard({ plan }: SampleSizeCardProps) {
  const { totalRange, confidence } = plan
  const { t } = useTranslation()
  const trendPercent = 12

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card className="h-full">
        <CardContent className="p-6">
          <p className="text-sm text-gray-500 mb-2">{t('sampling.aiRecommendedRange')}</p>
          <p className="text-[36px] font-bold leading-tight" style={{ color: '#00338D' }}>
            {totalRange.min}~{totalRange.max} {t('sampling.txns')}
          </p>
          <p className="text-sm text-gray-500 mt-1">{t('sampling.median')} {totalRange.median} {t('sampling.txns')}</p>

          {/* 置信度进度条 */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">{t('sampling.confidence')}</span>
              <span className="font-semibold" style={{ color: '#009A44' }}>
                {confidence}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${confidence}%`, backgroundColor: '#009A44' }}
              />
            </div>
          </div>

          {/* 趋势标记 */}
          <div className="mt-3 flex items-center gap-1">
            <span className="text-sm font-semibold text-green-600">▲{trendPercent}%</span>
            <span className="text-xs text-gray-500">{t('sampling.vsLastPeriod')}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
