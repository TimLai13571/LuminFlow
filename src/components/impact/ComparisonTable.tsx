import { motion } from 'framer-motion'
import { useTranslation } from '@/hooks/useTranslation'
import { GlossaryTerm } from '@/components/ui/glossary-term'
import type { ComparisonRow } from '@/types/impact'

interface ComparisonTableProps {
  comparison: ComparisonRow[]
}

const directionConfig = {
  negative: { color: '#D32F2F', icon: '▼', bg: '#FEF2F2' },
  neutral: { color: '#757575', icon: '—', bg: '#F9FAFB' },
  positive: { color: '#009A44', icon: '▲', bg: '#F0FDF4' },
}

export default function ComparisonTable({ comparison }: ComparisonTableProps) {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-lg border border-gray-200 overflow-hidden"
    >
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">{t('impact.comparison')}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                <GlossaryTerm term="rmm">{t('impact.dimension')}</GlossaryTerm>
              </th>
              <th className="px-4 py-2.5 text-center font-medium text-gray-600">{t('impact.before')}</th>
              <th className="px-4 py-2.5 text-center font-medium text-gray-600">{t('impact.after')}</th>
              <th className="px-4 py-2.5 text-center font-medium text-gray-600">{t('impact.delta')}</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row, i) => {
              const config = directionConfig[row.direction]
              return (
                <motion.tr
                  key={row.dimension}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-700">{row.dimension}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{row.before}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{row.after}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        color: config.color,
                        backgroundColor: config.bg,
                      }}
                    >
                      {config.icon} {row.delta}
                    </span>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
