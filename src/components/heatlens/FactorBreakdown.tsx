import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'

interface FactorTop5 {
  controlId: string
  controlName: string
  score: number
  detail: string
}

interface FactorBreakdownItem {
  factorId: string
  factorName: string
  factorNameKey: string
  top5: FactorTop5[]
}

interface FactorBreakdownProps {
  breakdown: FactorBreakdownItem[]
}

export default function FactorBreakdown({ breakdown }: FactorBreakdownProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(0)

  if (breakdown.length === 0) return null

  const current = breakdown[activeTab]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('heatlens.factorBreakdown')}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {breakdown.map((item, idx) => (
            <button
              key={item.factorId}
              onClick={() => setActiveTab(idx)}
              className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                idx === activeTab
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {t(item.factorNameKey)}
            </button>
          ))}
        </div>

        {/* Top 5 List */}
        <div className="space-y-3">
          <div className="text-xs text-gray-500 mb-2">
            {t('heatlens.top5ByFactor', { factor: t(current.factorNameKey) })}
          </div>
          {current.top5.map((item, idx) => (
            <div
              key={item.controlId}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-xs font-bold text-brand-primary">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">{item.controlName}</span>
                  <span className="text-xs text-gray-400">({item.controlId})</span>
                  <span className="ml-auto text-sm font-bold text-brand-primary">{item.score.toFixed(1)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
