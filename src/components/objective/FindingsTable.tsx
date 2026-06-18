import { useState, useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { getFindings } from '@/services/mock-data'
import { useTranslation } from '@/hooks/useTranslation'
import { GlossaryTerm } from '@/components/ui/glossary-term'
import type { Finding } from '@/types/audit'
import { ChevronUp, ChevronDown } from 'lucide-react'

type SortField = 'id' | 'title' | 'severity' | 'status' | 'deviationRate'
type SortDir = 'asc' | 'desc'

const SEVERITY_CONFIG: Record<string, { color: string; variant: 'danger' | 'warning' | 'success'; labelKey: string }> = {
  high: { color: '#D32F2F', variant: 'danger', labelKey: 'objective.high' },
  medium: { color: '#FF6B00', variant: 'warning', labelKey: 'objective.medium' },
  low: { color: '#009A44', variant: 'success', labelKey: 'objective.low' },
}

const STATUS_LABEL: Record<string, string> = {
  open: 'objective.openStatus',
  remediated: 'objective.remediated',
  accepted: 'objective.accepted',
}

const PAGE_SIZE = 10

export default function FindingsTable() {
  const { t } = useTranslation()
  const [findings, setFindings] = useState<Finding[]>([])
  const [sortField, setSortField] = useState<SortField>('severity')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)

  useEffect(() => {
    getFindings().then(setFindings)
  }, [])

  const sortedFindings = useMemo(() => {
    const sorted = [...findings].sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      let cmp = 0
      switch (sortField) {
        case 'id':
          cmp = a.id.localeCompare(b.id)
          break
        case 'title':
          cmp = a.title.localeCompare(b.title)
          break
        case 'severity':
          cmp = (severityOrder[a.severity] || 0) - (severityOrder[b.severity] || 0)
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        case 'deviationRate':
          cmp = a.deviationRate - b.deviationRate
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [findings, sortField, sortDir])

  const pagedFindings = useMemo(() => {
    const start = page * PAGE_SIZE
    return sortedFindings.slice(start, start + PAGE_SIZE)
  }, [sortedFindings, page])

  const totalPages = Math.ceil(sortedFindings.length / PAGE_SIZE)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 text-gray-300" />
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3 w-3 text-[#1E49E2]" />
    ) : (
      <ChevronDown className="h-3 w-3 text-[#1E49E2]" />
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">{t('objective.findings')}</h3>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div className="grid grid-cols-[60px_1fr_80px_80px_100px_80px] gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500">
            <button className="flex items-center gap-1 text-left" onClick={() => handleSort('id')}>
              {t('objective.id')} <SortIcon field="id" />
            </button>
            <button className="flex items-center gap-1 text-left" onClick={() => handleSort('title')}>
              {t('objective.findingTitle')} <SortIcon field="title" />
            </button>
            <button className="flex items-center gap-1 text-left" onClick={() => handleSort('severity')}>
              {t('objective.severity')} <SortIcon field="severity" />
            </button>
            <button className="flex items-center gap-1 text-left" onClick={() => handleSort('status')}>
              {t('objective.findingStatus')} <SortIcon field="status" />
            </button>
            <div>{t('objective.controlPoint')}</div>
            <button className="flex items-center gap-1 text-left" onClick={() => handleSort('deviationRate')}>
              <GlossaryTerm term="deviation">{t('objective.deviationRate')}</GlossaryTerm> <SortIcon field="deviationRate" />
            </button>
          </div>

          {/* Rows */}
          {pagedFindings.map((f) => {
            const sev = SEVERITY_CONFIG[f.severity] || SEVERITY_CONFIG.low
            return (
              <div
                key={f.id}
                className="grid grid-cols-[60px_1fr_80px_80px_100px_80px] gap-2 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-xs"
              >
                <span className="font-mono text-gray-500">{f.id}</span>
                <span className="font-medium text-gray-800 truncate">{f.title}</span>
                <span><Badge variant={sev.variant}>{t(sev.labelKey)}</Badge></span>
                <span className="text-gray-600">{t(STATUS_LABEL[f.status]) || f.status}</span>
                <span className="text-gray-500 font-mono">{f.controlId}</span>
                <span
                  className="font-mono cursor-help"
                  style={{ color: sev.color }}
                  title={t('objective.deviationRateTip', { deviations: f.deviationsFound, samples: f.samplesTested, rate: f.deviationRate })}
                >
                  {f.deviationRate}%
                </span>
              </div>
            )
          })}

          {pagedFindings.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">{t('objective.noFindings')}</div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">{t('objective.totalItems')} {sortedFindings.length} {t('objective.totalItemsSuffix')}</span>
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              {t('sampling.prevPage')}
            </button>
            <span className="text-xs text-gray-600">{page + 1} / {totalPages}</span>
            <button
              className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('sampling.nextPage')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
