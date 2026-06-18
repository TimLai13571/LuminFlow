import { useState } from 'react'
import { Sparkles, FileText, Trash2, Send } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/hooks/useTranslation'
import type { GeneratedPBCItem } from '@/types/audit'

interface PBCAutoGeneratorProps {
  onGeneratePBC: (industry?: string, processes?: string[]) => void
  onGenerateInterview: () => void
  selectedIndustry: string
  onIndustryChange: (industry: string) => void
  selectedProcesses: string[]
  onProcessesChange: (processes: string[]) => void
  generatedItems: GeneratedPBCItem[]
  onEditGeneratedItem: (id: string, field: keyof GeneratedPBCItem, value: string) => void
  onRemoveGeneratedItem: (id: string) => void
  onSubmitForApproval: () => void
  approvalStatus: string
}

const STANDARDS = [
  { value: 'COSO 2013', label: 'COSO 2013' },
  { value: 'PCAOB AS 2201', label: 'PCAOB AS 2201' },
  { value: 'SOX 404', label: 'SOX 404' },
  { value: 'cbirc', labelKey: 'pbcview.standard.cbirc' },
]

const CONTROL_DOMAIN_KEYS = [
  { value: 'all', labelKey: 'pbcview.domain.all' },
  { value: 'creditApproval', labelKey: 'pbcview.domain.creditApproval' },
  { value: 'incomeVerification', labelKey: 'pbcview.domain.incomeVerification' },
  { value: 'creditManagement', labelKey: 'pbcview.domain.creditManagement' },
  { value: 'postLoanMonitoring', labelKey: 'pbcview.domain.postLoanMonitoring' },
  { value: 'fundFlow', labelKey: 'pbcview.domain.fundFlow' },
  { value: 'collateral', labelKey: 'pbcview.domain.collateral' },
]

const INDUSTRIES = [
  { value: 'bank', labelKey: 'pbcview.industry.bank' },
  { value: 'insurance', labelKey: 'pbcview.industry.insurance' },
  { value: 'securities', labelKey: 'pbcview.industry.securities' },
]

const BANK_PROCESSES = [
  { value: 'loanApproval', labelKey: 'pbcview.process.loanApproval' },
  { value: 'creditMgmt', labelKey: 'pbcview.process.creditMgmt' },
  { value: 'incomeVerification', labelKey: 'pbcview.process.incomeVerification' },
  { value: 'postLoanMonitoring', labelKey: 'pbcview.process.postLoanMonitoring' },
  { value: 'fundFlow', labelKey: 'pbcview.process.fundFlow' },
  { value: 'collateralMgmt', labelKey: 'pbcview.process.collateralMgmt' },
]

const CATEGORY_KEYS = [
  { value: '审批记录', labelKey: 'pbcview.cat.approvalRecord' },
  { value: '凭证单据', labelKey: 'pbcview.cat.voucher' },
  { value: '系统日志', labelKey: 'pbcview.cat.systemLog' },
  { value: '报告文件', labelKey: 'pbcview.cat.report' },
]
const APPROVAL_BADGE: Record<string, 'warning' | 'secondary' | 'success' | 'danger'> = {
  draft: 'secondary',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

export default function PBCAutoGenerator({
  onGeneratePBC,
  onGenerateInterview,
  selectedIndustry,
  onIndustryChange,
  selectedProcesses,
  onProcessesChange,
  generatedItems,
  onEditGeneratedItem,
  onRemoveGeneratedItem,
  onSubmitForApproval,
  approvalStatus,
}: PBCAutoGeneratorProps) {
  const { t } = useTranslation()
  const [selectedStandards, setSelectedStandards] = useState<string[]>(['COSO 2013'])
  const [selectedDomain, setSelectedDomain] = useState('all')

  const toggleStandard = (s: string) => {
    setSelectedStandards((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  const toggleProcess = (p: string) => {
    onProcessesChange(
      selectedProcesses.includes(p)
        ? selectedProcesses.filter((x) => x !== p)
        : [...selectedProcesses, p]
    )
  }

  const handleGenerate = () => {
    onGeneratePBC(selectedIndustry, selectedProcesses)
  }

  const hasGeneratedItems = generatedItems.length > 0
  const canSubmit = hasGeneratedItems && approvalStatus === 'draft'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-primary" />
          {t('pbcview.generatePBC')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Industry Selector */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">{t('pbcview.industry')}</p>
          <div className="flex gap-1.5">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.value}
                onClick={() => onIndustryChange(ind.value)}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                  selectedIndustry === ind.value
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {t(ind.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Process Selector (multi-select chips) */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">{t('pbcview.process')}</p>
          <div className="flex flex-wrap gap-1.5">
            {BANK_PROCESSES.map((proc) => (
              <button
                key={proc.value}
                onClick={() => toggleProcess(proc.value)}
                className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                  selectedProcesses.includes(proc.value)
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {t(proc.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Standard Library */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">{t('pbcview.standardLibrary')}</p>
          <div className="flex flex-wrap gap-1.5">
            {STANDARDS.map((s) => (
              <button
                key={s.value}
                onClick={() => toggleStandard(s.value)}
                className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                  selectedStandards.includes(s.value)
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {s.labelKey ? t(s.labelKey) : s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Control Domain */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">{t('pbcview.selectControlDomain')}</p>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-interactive/30"
          >
            {CONTROL_DOMAIN_KEYS.map((d) => (
              <option key={d.value} value={d.value}>{t(d.labelKey)}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 rounded-btn bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-interactive transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {t('pbcview.generatePBC')}
          </button>
          <button
            onClick={onGenerateInterview}
            className="w-full flex items-center justify-center gap-2 rounded-btn border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-4 w-4" />
            {t('pbcview.generateInterviewOutline')}
          </button>
        </div>

        {/* Generated Items List (Edit Mode) */}
        {hasGeneratedItems && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-600">{t('pbcview.generatedItems')}</p>
              <Badge variant={APPROVAL_BADGE[approvalStatus] || 'secondary'}>
                {t(`pbcview.approvalStatus.${approvalStatus}`)}
              </Badge>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {generatedItems.map((item) => (
                <div key={item.id} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.documentType}
                      onChange={(e) => onEditGeneratedItem(item.id, 'documentType', e.target.value)}
                      className="flex-1 text-xs font-medium bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-interactive/30"
                      disabled={approvalStatus !== 'draft'}
                    />
                    <button
                      onClick={() => onRemoveGeneratedItem(item.id)}
                      disabled={approvalStatus !== 'draft'}
                      className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={item.category}
                      onChange={(e) => onEditGeneratedItem(item.id, 'category', e.target.value)}
                      className="text-[11px] bg-white border border-gray-200 rounded px-1.5 py-1 focus:outline-none"
                      disabled={approvalStatus !== 'draft'}
                    >
                      {CATEGORY_KEYS.map((c) => (
                        <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={item.controlId}
                      onChange={(e) => onEditGeneratedItem(item.id, 'controlId', e.target.value)}
                      className="w-20 text-[11px] font-mono bg-white border border-gray-200 rounded px-1.5 py-1 focus:outline-none"
                      disabled={approvalStatus !== 'draft'}
                    />
                    <input
                      type="date"
                      value={item.dueDate}
                      onChange={(e) => onEditGeneratedItem(item.id, 'dueDate', e.target.value)}
                      className="flex-1 text-[11px] bg-white border border-gray-200 rounded px-1.5 py-1 focus:outline-none"
                      disabled={approvalStatus !== 'draft'}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Submit for Approval Button */}
            {canSubmit && (
              <button
                onClick={onSubmitForApproval}
                className="w-full mt-3 flex items-center justify-center gap-2 rounded-btn bg-[#C5A04E] px-4 py-2 text-sm font-medium text-white hover:bg-[#A8842E] transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                {t('pbcview.submitForApproval')}
              </button>
            )}
          </div>
        )}

        {/* Interview Outline (conditional) */}
        {false && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-sm font-medium mb-2">{t('pbcview.interviewOutline')}</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>1. 请介绍贵部门贷款审批流程的组织架构和职责分工</p>
              <p>2. Q1组织架构调整后，审批权限的交接流程是怎样的？</p>
              <p>3. 收入证明审核中遇到的主要挑战是什么？</p>
              <p>4. 是否有特殊情况下的越权审批机制？如何记录和追踪？</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
