import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'

interface PBCStatsBarProps {
  total: number
  submitted: number
  pending: number
  overdue: number
  overdueLongest: number
}

const statConfigs = [
  { key: 'total', labelKey: 'pbcview.totalPBC', color: 'bg-blue-50 text-blue-700', icon: '📊' },
  { key: 'submitted', labelKey: 'pbcview.submitted', color: 'bg-green-50 text-green-700', icon: '✅' },
  { key: 'pending', labelKey: 'pbcview.pending', color: 'bg-yellow-50 text-yellow-700', icon: '⏳' },
  { key: 'overdue', labelKey: 'pbcview.overdue', color: 'bg-red-50 text-red-700', icon: '⚠️' },
] as const

export default function PBCStatsBar({ total, submitted, pending, overdue, overdueLongest }: PBCStatsBarProps) {
  const { t } = useTranslation()
  const values = { total, submitted, pending, overdue }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfigs.map(({ key, labelKey, color, icon }) => (
        <Card key={key} className={color}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-80">{t(labelKey)}</p>
                <p className="text-2xl font-bold mt-1">{values[key]}</p>
                {key === 'overdue' && overdue > 0 && (
                  <p className="text-[10px] opacity-70 mt-0.5">
                    {t('pbcview.overdueAlert', { n: overdue, d: overdueLongest })}
                  </p>
                )}
              </div>
              <span className="text-3xl opacity-40">{icon}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
