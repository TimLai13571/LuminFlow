import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, FileText, FileDown } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { translateData } from '@/locales/data-translations'
import { useLanguageStore } from '@/store/language-store'
import { GlossaryTerm } from '@/components/ui/glossary-term'
import type { DocumentCategory } from '@/types/sampling'

interface SampleItem {
  id: number
  pbcCode: string
  docName: string
  category: string
  controlId: string
  status: 'pending' | 'submitted' | 'approved' | 'overdue'
  dueDate: string
  assignee: string
}

interface SampleTableProps {
  categories: DocumentCategory[]
  selectedCategory: string | null
}

// 生成模拟样本数据
function generateMockSamples(categories: DocumentCategory[]): SampleItem[] {
  const statusList: SampleItem['status'][] = ['pending', 'submitted', 'approved', 'overdue']
  const assignees = ['张明', '李华', '王芳', '赵丽', '刘伟']
  const items: SampleItem[] = []
  let id = 1

  categories.forEach((cat) => {
    const count = Math.round((cat.percentage / 100) * 45)
    const controlMappings = cat.controlMapping || []
    cat.subTypes.forEach((subType, idx) => {
      const perSub = Math.max(1, Math.round(count / cat.subTypes.length))
      for (let i = 0; i < perSub; i++) {
        const ctrlId = controlMappings.length > 0 ? controlMappings[i % controlMappings.length] : `CTRL-${String((id % 12) + 1).padStart(3, '0')}`
        items.push({
          id,
          pbcCode: `PBC-${String(id).padStart(3, '0')}`,
          docName: `${subType}_${String(i + 1).padStart(2, '0')}`,
          category: cat.category,
          controlId: ctrlId,
          status: statusList[(id + idx) % statusList.length],
          dueDate: `2025-0${1 + (id % 3)}-${String(10 + (id % 20)).padStart(2, '0')}`,
          assignee: assignees[id % assignees.length],
        })
        id++
      }
    })
  })

  return items
}

const statusBadgeVariant: Record<SampleItem['status'], 'success' | 'warning' | 'danger' | 'secondary'> = {
  approved: 'success',
  submitted: 'warning',
  pending: 'secondary',
  overdue: 'danger',
}

const statusLabel: Record<SampleItem['status'], string> = {
  approved: 'sampling.approved',
  submitted: 'sampling.submitted',
  pending: 'sampling.pending',
  overdue: 'sampling.overdueStatus',
}

export function SampleTable({ categories, selectedCategory }: SampleTableProps) {
  const [page, setPage] = useState(1)
  const { t } = useTranslation()
  const language = useLanguageStore((s) => s.language)
  const pageSize = 20

  const allSamples = useMemo(() => generateMockSamples(categories), [categories])

  const filtered = useMemo(() => {
    if (!selectedCategory) return allSamples
    return allSamples.filter((s) => s.category === selectedCategory)
  }, [allSamples, selectedCategory])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-base">{t('sampling.sampleList')}</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => console.log('Export Excel')}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => console.log('Export CSV')}
          >
            <FileText className="h-3.5 w-3.5" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => console.log('Export PDF')}
          >
            <FileDown className="h-3.5 w-3.5" />
            PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {selectedCategory && (
          <div className="mb-3">
            <Badge variant="secondary" className="text-xs">
              {t('sampling.filter')} {selectedCategory}
              <button
                className="ml-1.5 text-gray-400 hover:text-gray-600"
                onClick={() => {/* parent controls this */}}
              >
                ×
              </button>
            </Badge>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-2 pr-4 font-medium text-gray-500 w-12">#</th>
                <th className="pb-2 pr-4 font-medium text-gray-500">
                  <GlossaryTerm term="pbc">{t('sampling.pbcCode')}</GlossaryTerm>
                </th>
                <th className="pb-2 pr-4 font-medium text-gray-500">{t('sampling.docName')}</th>
                <th className="pb-2 pr-4 font-medium text-gray-500">{t('sampling.docType')}</th>
                <th className="pb-2 pr-4 font-medium text-gray-500">{t('sampling.controlPoint')}</th>
                <th className="pb-2 pr-4 font-medium text-gray-500">{t('sampling.status')}</th>
                <th className="pb-2 pr-4 font-medium text-gray-500">{t('sampling.dueDate')}</th>
                <th className="pb-2 font-medium text-gray-500">{t('sampling.assignee')}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 pr-4 text-gray-400">{item.id}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{item.pbcCode}</td>
                  <td className="py-2 pr-4">{item.docName}</td>
                  <td className="py-2 pr-4">
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {translateData(item.category, language)}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-brand-primary">{item.controlId}</td>
                  <td className="py-2 pr-4">
                    <Badge variant={statusBadgeVariant[item.status]} className="text-xs">
                      {t(statusLabel[item.status])}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4 text-gray-600">{item.dueDate}</td>
                  <td className="py-2 text-gray-600">{translateData(item.assignee, language)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {t('sampling.total')} {filtered.length} {t('sampling.items')}{page}/{totalPages} {t('sampling.page')}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t('sampling.prevPage')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('sampling.nextPage')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
