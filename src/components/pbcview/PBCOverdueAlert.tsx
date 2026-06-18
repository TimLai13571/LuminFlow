import { AlertTriangle, Mail, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface PBCOverdueAlertProps {
  overdueCount: number
  overdueLongest: number
  onGenerateEmail: () => void
  onViewList: () => void
}

export default function PBCOverdueAlert({
  overdueCount,
  overdueLongest,
  onGenerateEmail,
  onViewList,
}: PBCOverdueAlertProps) {
  const { t } = useTranslation()

  if (overdueCount === 0) return null

  return (
    <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-700">
            {t('pbcview.overdueAlert', { n: overdueCount, d: overdueLongest })}
          </p>
          <button
            onClick={onViewList}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 mt-0.5 transition-colors"
          >
            {t('pbcview.viewOverdueList')}
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
      <button
        onClick={onGenerateEmail}
        className="flex items-center gap-2 rounded-btn bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
      >
        <Mail className="h-4 w-4" />
        {t('pbcview.generateReminderEmail')}
      </button>
    </div>
  )
}
