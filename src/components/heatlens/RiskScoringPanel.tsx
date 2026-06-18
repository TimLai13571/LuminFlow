import { Sliders, Zap } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import type { RiskScoringInput } from '@/types/audit'

interface RiskScoringPanelProps {
  weights: RiskScoringInput
  isCalculating: boolean
  onWeightChange: (factorKey: keyof RiskScoringInput, value: number) => void
  onRecalculate: () => void
  onReset: () => void
}

const FACTORS: { key: keyof RiskScoringInput; labelKey: string; descriptionKey: string; color: string }[] = [
  { key: 'historicalDeficiency', labelKey: 'heatlens.factor.historicalDeficiency', descriptionKey: 'heatlens.factor.historicalDeficiency', color: '#D32F2F' },
  { key: 'processChange', labelKey: 'heatlens.factor.processChange', descriptionKey: 'heatlens.factor.processChange', color: '#FF6B00' },
  { key: 'systemUpgrade', labelKey: 'heatlens.factor.systemUpgrade', descriptionKey: 'heatlens.factor.systemUpgrade', color: '#1E49E2' },
  { key: 'regulatoryRule', labelKey: 'heatlens.factor.regulatoryRule', descriptionKey: 'heatlens.factor.regulatoryRule', color: '#7B1FA2' },
  { key: 'regulatoryPenalty', labelKey: 'heatlens.factor.regulatoryPenalty', descriptionKey: 'heatlens.factor.regulatoryPenalty', color: '#C62828' },
]

export default function RiskScoringPanel({
  weights,
  isCalculating,
  onWeightChange,
  onRecalculate,
  onReset,
}: RiskScoringPanelProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-brand-primary" />
          <CardTitle className="text-base">{t('heatlens.title')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-gray-500">{t('heatlens.subtitle')}</p>

        {FACTORS.map((factor) => (
          <div key={factor.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">{t(factor.labelKey)}</span>
              <span className="text-xs font-semibold text-brand-primary">
                {t('heatlens.weight')}: {(weights[factor.key] * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={Math.round(weights[factor.key] * 100)}
              onChange={(e) => onWeightChange(factor.key, Number(e.target.value) / 100)}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${factor.color}22, ${factor.color})`,
                accentColor: factor.color,
              }}
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>5%</span>
              <span>{Math.round(weights[factor.key] * 100)}%</span>
              <span>40%</span>
            </div>
          </div>
        ))}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onRecalculate}
            disabled={isCalculating}
            className="flex-1 flex items-center justify-center gap-2 rounded-btn bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-interactive disabled:opacity-50 transition-colors"
          >
            <Zap className="h-4 w-4" />
            {isCalculating ? '⏳' : t('heatlens.aiRecalculate')}
          </button>
          <button
            onClick={onReset}
            className="rounded-btn border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            ↺
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
