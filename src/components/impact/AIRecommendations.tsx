import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Check, Download, Share2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import type { Recommendation } from '@/types/impact'

interface AIRecommendationsProps {
  recommendations: Recommendation[]
}

export default function AIRecommendations({ recommendations }: AIRecommendationsProps) {
  const { t } = useTranslation()
  const [adopted, setAdopted] = useState<Record<string, boolean>>(
    Object.fromEntries(recommendations.map((r) => [r.id, r.adopted]))
  )

  const priorityConfig: Record<string, { color: string; label: string }> = {
    P1: { color: '#D32F2F', label: t('impact.high') },
    P2: { color: '#FF6B00', label: t('impact.medium') },
    P3: { color: '#009A44', label: t('impact.low') },
  }

  const toggleAdopt = (id: string) => {
    setAdopted((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const adoptAll = () => {
    setAdopted(Object.fromEntries(recommendations.map((r) => [r.id, true])))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-lg border border-gray-200 overflow-hidden"
      style={{ borderLeftWidth: '4px', borderLeftColor: '#C5A04E' }}
    >
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-amber-50/60 to-transparent">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5A04E" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          {t('impact.aiRecommendations')}
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {recommendations.map((rec, i) => {
          const pConfig = priorityConfig[rec.priority]
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors"
            >
              {/* Priority dot */}
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: pConfig.color }}
                title={`${t('impact.priority')} ${pConfig.label}`}
              />

              {/* Description */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed">{rec.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t('impact.riskReduction')} {rec.riskReduction}%
                </p>
              </div>

              {/* Toggle */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400">
                  {adopted[rec.id] ? t('impact.adopted') : t('impact.pendingStatus')}
                </span>
                <Switch
                  checked={adopted[rec.id] ?? false}
                  onCheckedChange={() => toggleAdopt(rec.id)}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/30 flex flex-wrap gap-2">
        <Button
          onClick={adoptAll}
          size="sm"
          className="text-white"
          style={{ backgroundColor: '#1E49E2' }}
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          {t('impact.adoptAll')}
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-1.5 h-3.5 w-3.5" />
          {t('impact.exportPPT')}
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="mr-1.5 h-3.5 w-3.5" />
          {t('impact.shareApproval')}
        </Button>
      </div>
    </motion.div>
  )
}
