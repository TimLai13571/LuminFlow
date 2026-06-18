import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import { GlossaryTerm } from '@/components/ui/glossary-term'
import type { Control } from '@/types/audit'

interface StatusDoughnutProps {
  controls: Control[]
}

interface StatusData {
  name: string
  value: number
  color: string
  descKey: string
  controlNames: string[]
}

export default function StatusDoughnut({ controls }: StatusDoughnutProps) {
  const { t } = useTranslation()

  const effectiveControls = controls.filter((c) => c.status === 'completed')
  const partialControls = controls.filter((c) => c.status === 'in_progress')
  const pendingControls = controls.filter((c) => c.status === 'pending')
  const deficientControls = controls.filter((c) => c.status === 'deficiency' || c.status === 'delayed')

  const effective = effectiveControls.length
  const partial = partialControls.length
  const pending = pendingControls.length
  const deficient = deficientControls.length
  const total = controls.length

  const data: StatusData[] = [
    { name: t('dashboard.effective'), value: effective, color: '#009A44', descKey: 'dashboard.effectiveDesc', controlNames: effectiveControls.map((c) => c.name) },
    { name: t('dashboard.partiallyEffective'), value: partial, color: '#1E49E2', descKey: 'dashboard.partiallyEffectiveDesc', controlNames: partialControls.map((c) => c.name) },
    { name: t('dashboard.pendingTest'), value: pending, color: '#9E9E9E', descKey: 'dashboard.pendingTestDesc', controlNames: pendingControls.map((c) => c.name) },
    { name: t('dashboard.ineffective'), value: deficient, color: '#D32F2F', descKey: 'dashboard.ineffectiveDesc', controlNames: deficientControls.map((c) => c.name) },
  ]

  const totalEffective = effective

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          <GlossaryTerm term="toc">{t('dashboard.controlDistribution')}</GlossaryTerm>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null
                  const item = payload[0].payload as StatusData
                  const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg max-w-[260px]">
                      <div className="font-semibold text-sm mb-1" style={{ color: item.color }}>
                        {item.name}: {item.value} ({pct}%)
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{t(item.descKey)}</div>
                      {item.controlNames.length > 0 && (
                        <div className="text-xs text-gray-600">
                          <div className="font-medium mb-0.5">{t('objective.controlPoint')}:</div>
                          {item.controlNames.map((name, i) => (
                            <span key={i} className="inline-block bg-gray-100 rounded px-1.5 py-0.5 mr-1 mb-1 text-[11px]">
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={70}
                formatter={(value: string) => {
                  const item = data.find((d) => d.name === value)
                  return (
                    <span className="text-xs text-text-secondary">
                      <span className="font-medium">{value}</span>
                      {item && <span className="block text-[10px] text-gray-400">{t(item.descKey)}</span>}
                    </span>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className="text-3xl font-bold text-brand-primary">{totalEffective}</span>
            <p className="text-xs text-text-muted mt-0.5">{t('dashboard.effectiveControls')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
