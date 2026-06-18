import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import { GlossaryTerm } from '@/components/ui/glossary-term'
import rcmData from '@/data/rcm-matrix.json'
import controlsData from '@/data/controls.json'
import type { RCMEntry, Control } from '@/types/audit'

interface MethodologyRow {
  controlId: string
  controlName: string
  frequency: string
  rawtc: number
  baseSize: number
  riskFactor: number
  confidenceMultiplier: number
  deficiencyUplift: number
  recommendedSize: number
}

const FREQUENCY_BASE: Record<string, number> = {
  '每笔交易': 25,
  '每日': 25,
  '每周': 15,
  '每月': 5,
  '每季度': 3,
}

const CONFIDENCE_MULTIPLIERS: Record<number, number> = {
  90: 0.9,
  92: 0.95,
  95: 1.0,
  99: 1.15,
}

export function SamplingMethodology() {
  const { t, td } = useTranslation()

  const rows = useMemo(() => {
    const rcm = rcmData as unknown as RCMEntry[]
    const controls = controlsData as unknown as Control[]

    // Deduplicate by controlId, take max RAWTC
    const rcmMap = new Map<string, { controlName: string; frequency: string; rawtc: number }>()
    rcm.forEach((entry) => {
      const existing = rcmMap.get(entry.controlId)
      if (!existing || entry.rawtc > existing.rawtc) {
        rcmMap.set(entry.controlId, {
          controlName: entry.controlName,
          frequency: entry.frequency,
          rawtc: entry.rawtc,
        })
      }
    })

    // Merge with controls data for priorYearDeficiency
    return Array.from(rcmMap.entries()).map(([controlId, rcmInfo]) => {
      const control = controls.find((c) => c.id === controlId)
      const frequency = rcmInfo.frequency
      const baseSize = FREQUENCY_BASE[frequency] || 10
      const rawtc = rcmInfo.rawtc
      const riskFactor = Math.round((rawtc / 10 + 0.5) * 100) / 100
      const confidenceMultiplier = CONFIDENCE_MULTIPLIERS[95]
      const deficiencyUplift = control?.priorYearDeficiency ? 0.15 : 0
      const recommendedSize = Math.round(
        baseSize * riskFactor * confidenceMultiplier * (1 + deficiencyUplift)
      )

      return {
        controlId,
        controlName: rcmInfo.controlName,
        frequency,
        rawtc,
        baseSize,
        riskFactor,
        confidenceMultiplier,
        deficiencyUplift,
        recommendedSize,
      }
    })
  }, [])

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-lg">📐</span>
          {t('sampling.methodology.tableTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left py-2.5 px-3 font-semibold text-gray-500 whitespace-nowrap">
                  {t('sampling.methodology.controlId')}
                </th>
                <th className="text-left py-2.5 px-3 font-semibold text-gray-500 whitespace-nowrap">
                  {t('sampling.methodology.controlName')}
                </th>
                <th className="text-left py-2.5 px-3 font-semibold text-gray-500 whitespace-nowrap">
                  {t('sampling.methodology.frequency')}
                </th>
                <th className="text-center py-2.5 px-2 font-semibold text-gray-500 whitespace-nowrap">
                  <GlossaryTerm term="rawtc">{t('sampling.methodology.rawtcScore')}</GlossaryTerm>
                </th>
                <th className="text-center py-2.5 px-2 font-semibold text-gray-500 whitespace-nowrap">
                  {t('sampling.methodology.baseSize')}
                </th>
                <th className="text-center py-2.5 px-2 font-semibold text-gray-500 whitespace-nowrap">
                  {t('sampling.methodology.riskFactor')}
                </th>
                <th className="text-center py-2.5 px-2 font-semibold text-gray-500 whitespace-nowrap">
                  {t('sampling.methodology.confidenceMul')}
                </th>
                <th className="text-center py-2.5 px-2 font-semibold text-gray-500 whitespace-nowrap">
                  <GlossaryTerm term="deficiency">{t('sampling.methodology.deficiencyUplift')}</GlossaryTerm>
                </th>
                <th className="text-center py-2.5 px-3 font-semibold text-gray-500 whitespace-nowrap">
                  {t('sampling.methodology.recommendedSize')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.controlId}
                  className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  <td className="py-2 px-3 font-mono text-brand-primary">{row.controlId}</td>
                  <td className="py-2 px-3 text-gray-700">{td(row.controlName)}</td>
                  <td className="py-2 px-3 text-gray-500">{td(row.frequency)}</td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        row.rawtc >= 8
                          ? 'bg-red-50 text-red-700'
                          : row.rawtc >= 6
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {row.rawtc}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center text-gray-600">{row.baseSize}</td>
                  <td className="py-2 px-2 text-center text-gray-600">{row.riskFactor.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center text-gray-600">{row.confidenceMultiplier}</td>
                  <td className="py-2 px-2 text-center">
                    {row.deficiencyUplift > 0 ? (
                      <span className="text-red-600 font-medium">+{row.deficiencyUplift}</span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center font-bold" style={{ color: '#00338D' }}>
                    {row.recommendedSize}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Formula Summary */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-3">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-600">
              {t('sampling.methodology.formula.formula')}
            </span>
            <span className="ml-2 text-gray-400">| {t('sampling.methodology.confidenceLabel')}: 95%</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
