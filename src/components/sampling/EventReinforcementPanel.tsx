import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import { GlossaryTerm } from '@/components/ui/glossary-term'
import type { ElevatedControl } from '@/types/sampling'

interface EventReinforcementPanelProps {
  elevatedControls?: ElevatedControl[]
  baseRange: { min: number; max: number }
}

export function EventReinforcementPanel({
  elevatedControls = [],
  baseRange,
}: EventReinforcementPanelProps) {
  const { t } = useTranslation()

  const hasEvents = elevatedControls.length > 0
  const totalAdditional = elevatedControls.reduce((sum, c) => sum + c.additionalSamples, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <GlossaryTerm term="walkthrough">{t('sampling.eventReinforcement')}</GlossaryTerm>
        </CardTitle>
        <p className="text-xs text-gray-500">{t('sampling.eventReinforcementDesc')}</p>
      </CardHeader>
      <CardContent className="p-0">
        {!hasEvents ? (
          <div className="py-8 text-center text-sm text-gray-400">
            <span className="text-2xl block mb-2">✅</span>
            {t('sampling.noEvents')}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="text-left py-2.5 px-3 font-semibold text-gray-500">
                      {t('sampling.affectedControl')}
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-gray-500">
                      {t('sampling.eventType')}
                    </th>
                    <th className="text-left py-2.5 px-3 font-semibold text-gray-500">
                      {t('sampling.additionalSamples')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {elevatedControls.map((item, idx) => (
                    <tr
                      key={item.controlId}
                      className={`border-b border-gray-100 hover:bg-gray-50/50 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-brand-primary text-xs">{item.controlId}</span>
                        <span className="ml-2 text-gray-700">{item.controlName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">{item.reason}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
                          +{item.additionalSamples}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Summary */}
            <div className="border-t border-gray-100 bg-blue-50/50 p-3 flex items-center justify-between">
              <div className="text-xs text-gray-600">
                <span className="font-semibold">{t('sampling.adjustedTotal')}:</span>
                <span className="ml-2 text-gray-400 line-through">
                  {baseRange.min}-{baseRange.max}
                </span>
                <span className="mx-1">→</span>
                <span className="font-bold" style={{ color: '#00338D' }}>
                  {baseRange.min + totalAdditional}-{baseRange.max + totalAdditional}
                </span>
              </div>
              <span className="text-[10px] text-gray-400">
                +{totalAdditional} {t('sampling.additionalSamples')}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
