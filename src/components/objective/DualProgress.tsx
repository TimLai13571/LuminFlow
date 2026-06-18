import { motion } from 'framer-motion'
import { useTranslation } from '@/hooks/useTranslation'
import { GlossaryTerm } from '@/components/ui/glossary-term'

interface DualProgressProps {
  auditProgress?: number
  clientProgress?: number
}

export default function DualProgress({ auditProgress = 72, clientProgress = 48 }: DualProgressProps) {
  const { t } = useTranslation()
  const gap = auditProgress - clientProgress

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">{t('objective.dualProgress')}</h3>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-600">{t('objective.auditProgress')}</span>
          <span className="text-xs font-bold text-[#00338D]">{auditProgress}%</span>
        </div>
        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: '#00338D' }}
            initial={{ width: 0 }}
            animate={{ width: `${auditProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-600">
            <GlossaryTerm term="pbc">{t('objective.clientPBCProgress')}</GlossaryTerm>
          </span>
          <span className="text-xs font-bold text-[#FF6B00]">{clientProgress}%</span>
        </div>
        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: '#FF6B00',
              animation: clientProgress < 50 ? 'pulse-warning 2s ease-in-out infinite' : undefined,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${clientProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
      </div>

      {gap > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">{t('objective.progressGap')}</span>
          <span className="text-xs font-bold text-[#D32F2F]">⚠ {gap}% {t('objective.behind')}</span>
        </div>
      )}

      <style>{`
        @keyframes pulse-warning {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
