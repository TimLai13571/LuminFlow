import { AlertTriangle, TrendingUp, Search } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { GlossaryTerm } from '@/components/ui/glossary-term'

interface InsightItem {
  icon: React.ReactNode
  textKey: string
  confidence: number
}

const insights: InsightItem[] = [
  {
    icon: <AlertTriangle className="h-4 w-4 text-[#D32F2F]" />,
    textKey: 'objective.insight1',
    confidence: 92,
  },
  {
    icon: <TrendingUp className="h-4 w-4 text-[#FF6B00]" />,
    textKey: 'objective.insight2',
    confidence: 85,
  },
  {
    icon: <Search className="h-4 w-4 text-[#1E49E2]" />,
    textKey: 'objective.insight3',
    confidence: 78,
  },
]

export default function AIInsightPanel() {
  const { t } = useTranslation()

  return (
    <div className="rounded-lg border border-gray-200 bg-[#FFFDF7] overflow-hidden">
      <div className="h-1 bg-[#C5A04E]" />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🤖</span>
          <h3 className="text-sm font-semibold text-gray-800">
            <GlossaryTerm term="combinedRisk">{t('objective.aiInsight')}</GlossaryTerm>
          </h3>
        </div>
        <div className="space-y-3">
          {insights.map((item, idx) => (
            <div key={idx} className="flex gap-3 p-2.5 rounded-md bg-white/60 border border-[#C5A04E]/20">
              <div className="mt-0.5 shrink-0">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 leading-relaxed">{t(item.textKey)}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#C5A04E]"
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-[#C5A04E] shrink-0">
                    {item.confidence}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
