import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { useTranslation } from '@/hooks/useTranslation'
import type { SamplingParams } from '@/types/sampling'

interface ParamAdjusterProps {
  params: SamplingParams
  onParamsChange: (params: SamplingParams) => void
  onRecalculate: () => void
}

export function ParamAdjuster({ params, onParamsChange, onRecalculate }: ParamAdjusterProps) {
  const { currentRole } = useAuthStore()
  const { t } = useTranslation()
  const [isCalculating, setIsCalculating] = useState(false)

  if (currentRole !== 'auditor') return null

  const handleRecalculate = async () => {
    setIsCalculating(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    onRecalculate()
    setIsCalculating(false)
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span>🔧</span>
          {t('sampling.paramAdjust')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-5">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">{t('sampling.riskThreshold')}</span>
            <span className="font-semibold" style={{ color: '#00338D' }}>{params.riskThreshold}</span>
          </div>
          <Slider
            value={[params.riskThreshold]}
            onValueChange={(v) => onParamsChange({ ...params, riskThreshold: v[0] })}
            min={1}
            max={10}
            step={1}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-2">{t('sampling.confidenceLevel')}</div>
          <Select
            value={String(params.confidenceLevel)}
            onValueChange={(v) => onParamsChange({ ...params, confidenceLevel: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('sampling.selectConfidence')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90">90%</SelectItem>
              <SelectItem value="92">92%</SelectItem>
              <SelectItem value="95">95%</SelectItem>
              <SelectItem value="99">99%</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">{t('sampling.elevatedCoeff')}</span>
            <span className="font-semibold" style={{ color: '#00338D' }}>
              {params.elevatedCoefficient.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[params.elevatedCoefficient * 10]}
            onValueChange={(v) => onParamsChange({ ...params, elevatedCoefficient: v[0] / 10 })}
            min={10}
            max={20}
            step={1}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1.0</span>
            <span>2.0</span>
          </div>
        </div>

        <Button
          className="w-full text-white"
          style={{ backgroundColor: '#1E49E2' }}
          onClick={handleRecalculate}
          disabled={isCalculating}
        >
          {isCalculating ? t('sampling.calculating') : t('sampling.recalculate')}
        </Button>
      </CardContent>
    </Card>
  )
}
