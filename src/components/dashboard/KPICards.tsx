import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import type { KPIMetric } from '@/types/audit'

interface KPICardsProps {
  metrics: KPIMetric[]
}

const statusColorMap: Record<KPIMetric['status'], string> = {
  good: 'text-status-success',
  warning: 'text-status-warning',
  danger: 'text-status-danger',
}

const trendIconMap: Record<KPIMetric['trend'], React.ElementType> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

function getTrendColor(trend: KPIMetric['trend'], status: KPIMetric['status']): string {
  if (status === 'good') return 'text-status-success'
  if (status === 'danger') return 'text-status-danger'
  if (status === 'warning') return 'text-status-warning'
  if (trend === 'up') return 'text-status-success'
  if (trend === 'down') return 'text-status-danger'
  return 'text-gray-400'
}

export default function KPICards({ metrics }: KPICardsProps) {
  const { t } = useTranslation()
  // Display first 4 metrics as main KPIs
  const displayMetrics = metrics.slice(0, 4)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {displayMetrics.map((metric, index) => {
        const TrendIcon = trendIconMap[metric.trend]
        const trendColor = getTrendColor(metric.trend, metric.status)
        const valueColor = statusColorMap[metric.status]

        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            whileHover={{ y: -2 }}
          >
            <Card className="relative overflow-hidden hover:shadow-L2 transition-shadow duration-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-text-secondary font-medium">{metric.name}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-4xl font-bold ${valueColor}`}>
                        {metric.value}
                      </span>
                      <span className="text-sm text-text-muted">{metric.unit}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${trendColor}`}>
                    <TrendIcon className="h-4 w-4" />
                    {metric.status === 'warning' && (
                      <AlertTriangle className="h-4 w-4 text-status-warning" />
                    )}
                  </div>
                </div>
                {metric.target !== undefined && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                      <span>{t('dashboard.target')}: {metric.target}{metric.unit}</span>
                      <span>{Math.round((Number(metric.value) / metric.target) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (Number(metric.value) / metric.target) * 100)}%`,
                          backgroundColor: metric.status === 'good' ? '#009A44' : metric.status === 'warning' ? '#FF6B00' : '#D32F2F',
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
