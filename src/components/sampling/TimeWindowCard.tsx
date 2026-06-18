import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import type { TimeWindow } from '@/types/sampling'

interface TimeWindowCardProps {
  windows: TimeWindow[]
}

export function TimeWindowCard({ windows }: TimeWindowCardProps) {
  const { t } = useTranslation()
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base">{t('sampling.timeWindowDist')}</CardTitle>
        </CardHeader>

        {/* 堆叠条 */}
        <div className="flex w-full h-10 rounded-lg overflow-hidden">
          {windows.map((w) => (
            <div
              key={w.period}
              className="flex items-center justify-center text-xs font-semibold transition-all"
              style={{
                width: `${w.percentage}%`,
                backgroundColor: w.color,
                color: w.color === '#E8EDF5' ? '#00338D' : '#ffffff',
              }}
            >
              {w.percentage}%
            </div>
          ))}
        </div>

        {/* 标注 */}
        <div className="flex mt-3">
          {windows.map((w) => (
            <div
              key={w.period}
              className="flex items-center gap-1.5 text-xs text-gray-600"
              style={{ width: `${w.percentage}%` }}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: w.color }}
              />
              <span>{w.period}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
