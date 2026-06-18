import { Search } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import type { PBCRequest } from '@/types/audit'

interface PBCListTableProps {
  pbcList: PBCRequest[]
  searchQuery: string
  onSearchChange: (q: string) => void
  statusFilter: PBCRequest['status'] | 'all'
  onStatusFilterChange: (s: PBCRequest['status'] | 'all') => void
}

const STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_LABEL_KEYS: Record<string, string> = {
  submitted: 'pbcview.submitted',
  pending: 'pbcview.pending',
  overdue: 'pbcview.overdue',
}

const CATEGORY_TRANSLATE: Record<string, string> = {
  '审批记录': 'pbcview.cat.approvalRecord',
  '凭证单据': 'pbcview.cat.voucher',
  '系统日志': 'pbcview.cat.systemLog',
  '报告文件': 'pbcview.cat.report',
}

export default function PBCListTable({
  pbcList,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: PBCListTableProps) {
  const { t, td } = useTranslation()

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base">PBC {t('pbcview.title')}</CardTitle>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder={t('pbcview.searchPBC')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-interactive/30 w-48"
              />
            </div>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as PBCRequest['status'] | 'all')}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand-interactive/30"
            >
              <option value="all">{t('pbcview.filterAll')}</option>
              <option value="submitted">{t('pbcview.submitted')}</option>
              <option value="pending">{t('pbcview.pending')}</option>
              <option value="overdue">{t('pbcview.overdue')}</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">PBC ID</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">{t('pbcview.docType')}</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 hidden md:table-cell">{t('pbcview.category')}</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">{t('pbcview.controlPoint')}</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">{t('pbcview.dueDate')}</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500">{t('pbcview.status')}</th>
              </tr>
            </thead>
            <tbody>
              {pbcList.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                    item.status === 'overdue' ? 'bg-red-50/30' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono text-xs text-brand-primary">{item.id}</td>
                  <td className="py-2.5 px-3">
                    <p className="text-xs font-medium text-text-primary line-clamp-1">{td(item.documentType)}</p>
                    <p className="text-[10px] text-gray-400 line-clamp-1 hidden md:block">{td(item.description)}</p>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-500 hidden md:table-cell">{t(CATEGORY_TRANSLATE[item.category] || item.category)}</td>
                  <td className="py-2.5 px-3 text-xs text-gray-500 font-mono hidden lg:table-cell">{item.controlId}</td>
                  <td className="py-2.5 px-3 text-xs text-gray-500">
                    <span className={item.status === 'overdue' ? 'text-red-600 font-semibold' : ''}>
                      {item.dueDate}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        STATUS_STYLES[item.status]
                      }`}
                    >
                      {t(STATUS_LABEL_KEYS[item.status] || item.status)}
                      {item.status === 'overdue' && item.overdueDays && (
                        <> {item.overdueDays}{t('pbcview.overdueDays', { n: 0 }).replace('0', String(item.overdueDays))}</>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
              {pbcList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                    {t('pbcview.noRecords')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          {t('pbcview.totalPBC')}: {pbcList.length} {t('sampling.items')}
        </div>
      </CardContent>
    </Card>
  )
}
