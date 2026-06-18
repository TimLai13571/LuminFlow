import { useState } from 'react'
import { Plus, Trash2, Database, X } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import type { ReferencedFinding } from '@/hooks/useNarrativeLens'

interface Finding {
  id: string
  title: string
  severity: 'high' | 'medium' | 'low'
}

interface FindingsInputProps {
  topic: string
  onTopicChange: (topic: string) => void
  findings: Finding[]
  onAddFinding: () => void
  onUpdateFinding: (id: string, field: keyof Finding, value: string) => void
  onRemoveFinding: (id: string) => void
  onGenerate: () => void
  isGenerating: boolean
  referencedFindings: ReferencedFinding[]
  onAddReferenced: (rf: ReferencedFinding) => void
  onRemoveReferenced: (id: string) => void
}

const SEVERITY_STYLES: Record<string, string> = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low: 'text-green-600 bg-green-50 border-green-200',
}

// Mock data for Clara and Cndocs
const CLARA_FINDINGS_ZH = [
  { id: 'CLARA-001', content: '贷款审批流程中发现3起越权审批，涉及金额合计580万元（2025Q1）' },
  { id: 'CLARA-002', content: '征信查询授权书签署率仅87%，13%的查询缺少书面授权（内审报告2025-01）' },
  { id: 'CLARA-003', content: '收入证明审核中20%的文档存在信息不一致但未被标记（质量管理报告Q1）' },
]
const CLARA_FINDINGS_EN = [
  { id: 'CLARA-001', content: '3 unauthorized loan approvals found, involving CNY 5.8 million total (2025Q1)' },
  { id: 'CLARA-002', content: 'Credit inquiry authorization signing rate only 87%, 13% lack written authorization (Internal Audit Report 2025-01)' },
  { id: 'CLARA-003', content: '20% of income verification documents had inconsistencies but were not flagged (QA Report Q1)' },
]

const CNDOCS_FILES_ZH = [
  { id: 'DOC-001', content: '《2025年度个人贷款ICFR审计方案》— 审计范围与方法论详细说明' },
  { id: 'DOC-002', content: '《Q1贷款审批权限矩阵》— 组织架构调整后的最新审批权限分配表' },
  { id: 'DOC-003', content: '《征信查询授权流程SOP》— 现行征信查询授权的标准操作流程文档' },
]
const CNDOCS_FILES_EN = [
  { id: 'DOC-001', content: 'FY2025 Personal Loan ICFR Audit Plan — Scope and methodology details' },
  { id: 'DOC-002', content: 'Q1 Loan Approval Authority Matrix — Latest authority allocation after org restructuring' },
  { id: 'DOC-003', content: 'Credit Inquiry Authorization SOP — Current standard operating procedure document' },
]

export default function FindingsInput({
  topic,
  onTopicChange,
  findings,
  onAddFinding,
  onUpdateFinding,
  onRemoveFinding,
  onGenerate,
  isGenerating,
  referencedFindings,
  onAddReferenced,
  onRemoveReferenced,
}: FindingsInputProps) {
  const { t, language } = useTranslation()
  const CLARA_FINDINGS = language === 'en' ? CLARA_FINDINGS_EN : CLARA_FINDINGS_ZH
  const CNDOCS_FILES = language === 'en' ? CNDOCS_FILES_EN : CNDOCS_FILES_ZH
  const [refModalOpen, setRefModalOpen] = useState(false)
  const [refTab, setRefTab] = useState<'clara' | 'cndocs'>('clara')

  return (
    <div className="space-y-4">
      {/* Topic */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">{t('narrative.topic')}</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          placeholder={t('narrative.topicPlaceholder')}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-interactive/30"
        />
      </div>

      {/* Findings */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500">{t('narrative.findings')}</label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setRefModalOpen(true)}
              className="flex items-center gap-1 text-xs text-[#C5A04E] hover:text-[#A8842E] transition-colors"
            >
              <Database className="h-3 w-3" />
              {t('narrative.referenceData')}
            </button>
            <button
              onClick={onAddFinding}
              className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-interactive transition-colors ml-2"
            >
              <Plus className="h-3 w-3" />
              {t('narrative.addFinding')}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {findings.map((finding) => (
            <div key={finding.id} className="flex items-center gap-2">
              <select
                value={finding.severity}
                onChange={(e) => onUpdateFinding(finding.id, 'severity', e.target.value)}
                className={`text-xs border rounded-lg px-2 py-1.5 ${SEVERITY_STYLES[finding.severity]}`}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input
                type="text"
                value={finding.title}
                onChange={(e) => onUpdateFinding(finding.id, 'title', e.target.value)}
                placeholder={t('narrative.findingDescPlaceholder')}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-interactive/30"
              />
              <button
                onClick={() => onRemoveFinding(finding.id)}
                className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Referenced Data Tags */}
      {referencedFindings.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {referencedFindings.map((ref) => (
            <span
              key={ref.id}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                ref.source === 'clara'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}
            >
              <span className="font-semibold">{ref.source === 'clara' ? 'Clara' : 'Cndocs'}</span>
              <span className="max-w-[120px] truncate">{ref.content}</span>
              <button
                onClick={() => onRemoveReferenced(ref.id)}
                className="text-current opacity-50 hover:opacity-100"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Reference Data Modal */}
      {refModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setRefModalOpen(false)}>
          <div
            className="bg-white rounded-xl shadow-xl border border-gray-200 w-[380px] max-h-[420px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-4 pt-3">
              <button
                onClick={() => setRefTab('clara')}
                className={`pb-2 px-2 text-xs font-medium transition-colors ${
                  refTab === 'clara'
                    ? 'text-brand-primary border-b-2 border-brand-primary'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t('narrative.referenceSource.clara')}
              </button>
              <button
                onClick={() => setRefTab('cndocs')}
                className={`pb-2 px-2 text-xs font-medium transition-colors ml-2 ${
                  refTab === 'cndocs'
                    ? 'text-brand-primary border-b-2 border-brand-primary'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t('narrative.referenceSource.cndocs')}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {refTab === 'clara' && CLARA_FINDINGS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!referencedFindings.find((r) => r.id === item.id)) {
                      onAddReferenced({
                        id: item.id,
                        source: 'clara',
                        sourceName: t('narrative.referenceSource.clara'),
                        content: item.content,
                      })
                    }
                    setRefModalOpen(false)
                  }}
                  disabled={!!referencedFindings.find((r) => r.id === item.id)}
                  className="w-full text-left p-2.5 rounded-lg border border-gray-100 hover:bg-blue-50/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="text-[11px] font-mono text-blue-600 font-semibold">{item.id}</span>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.content}</p>
                </button>
              ))}
              {refTab === 'cndocs' && CNDOCS_FILES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!referencedFindings.find((r) => r.id === item.id)) {
                      onAddReferenced({
                        id: item.id,
                        source: 'cndocs',
                        sourceName: t('narrative.referenceSource.cndocs'),
                        content: item.content,
                      })
                    }
                    setRefModalOpen(false)
                  }}
                  disabled={!!referencedFindings.find((r) => r.id === item.id)}
                  className="w-full text-left p-2.5 rounded-lg border border-gray-100 hover:bg-purple-50/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="text-[11px] font-mono text-purple-600 font-semibold">{item.id}</span>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.content}</p>
                </button>
              ))}
              {refTab === 'clara' && CLARA_FINDINGS.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">{t('narrative.referenceEmpty')}</p>
              )}
              {refTab === 'cndocs' && CNDOCS_FILES.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">{t('narrative.referenceEmpty')}</p>
              )}
            </div>

            {/* Close button */}
            <div className="border-t border-gray-100 p-2">
              <button
                onClick={() => setRefModalOpen(false)}
                className="w-full text-xs text-gray-500 py-1.5 hover:text-gray-700 transition-colors"
              >
                {t('team.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || !topic}
        className="w-full flex items-center justify-center gap-2 rounded-btn bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-interactive disabled:opacity-50 transition-colors"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t('narrative.generating')}
          </>
        ) : (
          <>✨ {t('narrative.generate')}</>
        )}
      </button>
    </div>
  )
}
