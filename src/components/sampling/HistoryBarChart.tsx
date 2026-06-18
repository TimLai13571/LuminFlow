import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import type { HistoricalSample } from '@/types/sampling'

interface HistoryBarChartProps {
  data: HistoricalSample[]
}

export function HistoryBarChart({ data }: HistoryBarChartProps) {
  const { t } = useTranslation()
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('sampling.historicalTrend')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #E8EDF5',
                fontSize: '12px',
              }}
            />
            <Legend
              formatter={(value: string) => (
                <span className="text-xs">{value}</span>
              )}
            />
            <Bar dataKey="sampleSize" name={t('sampling.sampleSize')} radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isPrediction ? '#1E49E2' : '#00338D'}
                  fillOpacity={entry.isPrediction ? 0.5 : 1}
                  strokeDasharray={entry.isPrediction ? '4 2' : undefined}
                  stroke={entry.isPrediction ? '#1E49E2' : undefined}
                  strokeWidth={entry.isPrediction ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#00338D' }} />
            <span>{t('sampling.actual')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className="w-3 h-3 rounded-sm opacity-50 border border-dashed"
              style={{ backgroundColor: '#1E49E2', borderColor: '#1E49E2' }}
            />
            <span>{t('sampling.aiPrediction')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
