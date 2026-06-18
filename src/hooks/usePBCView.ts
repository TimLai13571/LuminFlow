import { useState, useCallback, useMemo } from 'react'
import type { PBCRequest, GeneratedPBCItem, PBCApprovalStatus } from '@/types/audit'
import { useAuthStore } from '@/store/auth-store'
import { useLanguageStore } from '@/store/language-store'
import { translateData } from '@/locales/data-translations'
import pbcData from '@/data/pbc-requests.json'

interface PBCStats {
  total: number
  submitted: number
  pending: number
  overdue: number
  overdueLongest: number
}

interface PBCEmailDraft {
  to: string
  subject: string
  body: string
}

export function usePBCView() {
  const currentRole = useAuthStore((s) => s.currentRole)
  const language = useLanguageStore((s) => s.language)
  const [pbcList, setPBCList] = useState<PBCRequest[]>(() => {
    return (pbcData as unknown as PBCRequest[]).map((p) => ({
      ...p,
      overdueDays: p.status === 'overdue' ? (p.overdueDays || Math.floor(Math.random() * 7) + 1) : undefined,
    }))
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PBCRequest['status'] | 'all'>('all')
  const [showEmailDraft, setShowEmailDraft] = useState(false)
  const [showInterviewOutline, setShowInterviewOutline] = useState(false)

  // Industry & Process selection
  const [selectedIndustry, setSelectedIndustry] = useState<string>('bank')
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>(['loanApproval'])

  // Generated PBC items with approval workflow
  const [generatedItems, setGeneratedItems] = useState<GeneratedPBCItem[]>([])
  const [approvalStatus, setApprovalStatus] = useState<PBCApprovalStatus>('draft')

  const stats: PBCStats = useMemo(() => {
    const total = pbcList.length
    const submitted = pbcList.filter((p) => p.status === 'submitted').length
    const pending = pbcList.filter((p) => p.status === 'pending').length
    const overdue = pbcList.filter((p) => p.status === 'overdue').length
    const overdueLongest = Math.max(0, ...pbcList.filter((p) => p.status === 'overdue').map((p) => p.overdueDays || 0))
    return { total, submitted, pending, overdue, overdueLongest }
  }, [pbcList])

  const filteredList = useMemo(() => {
    return pbcList.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.documentType.includes(searchQuery) ||
        p.description.includes(searchQuery) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [pbcList, searchQuery, statusFilter])

  const progressByControl = useMemo(() => {
    const map: Record<string, { total: number; submitted: number }> = {}
    pbcList.forEach((p) => {
      if (!map[p.controlId]) map[p.controlId] = { total: 0, submitted: 0 }
      map[p.controlId].total++
      if (p.status === 'submitted') map[p.controlId].submitted++
    })
    return Object.entries(map).map(([controlId, data]) => ({
      controlId,
      total: data.total,
      submitted: data.submitted,
      progress: data.total > 0 ? Math.round((data.submitted / data.total) * 100) : 0,
    }))
  }, [pbcList])

  const emailDraft: PBCEmailDraft = useMemo(() => {
    const overdueItems = pbcList.filter((p) => p.status === 'overdue')
    if (overdueItems.length === 0) {
      return { to: '', subject: '', body: '' }
    }

    const isEn = language === 'en'

    const itemLines = overdueItems.map(
      (p) => `- ${p.id}: ${translateData(p.documentType, language)} (${isEn ? 'Due' : '截止日期'}: ${p.dueDate}, ${isEn ? 'overdue' : '逾期'} ${p.overdueDays || '?'} ${isEn ? 'days' : '天'})`
    ).join('\n')

    return {
      to: 'finance.department@abc-tech.com',
      subject: isEn
        ? `[Reminder] FY2025 Annual Audit — ${overdueItems.length} PBC Items Overdue`
        : `【催办】FY2025 年度审计 PBC 材料逾期提醒 - ${overdueItems.length} 项逾期`,
      body: isEn
        ? `Dear Finance Department Colleagues:\n\nThe following PBC materials have exceeded the submission deadline. Please arrange submission as soon as possible:\n\n${itemLines}\n\nThe above materials directly impact the audit schedule. For any questions, please contact the audit team promptly.\n\nThank you for your cooperation!\n\nAudit Team\nFY2025 Annual Audit Project Team`
        : `尊敬的财务部同事：\n\n以下 PBC 材料已超过提交截止日期，请尽快安排提交：\n\n${itemLines}\n\n以上材料对审计进度有直接影响，如有任何问题请及时与审计团队沟通。\n\n谢谢配合！\n\n审计团队\nFY2025 年度审计项目组`,
    }
  }, [pbcList, language])

  const generatePBCList = useCallback(async (industry?: string, processes?: string[]) => {
    const isEn = language === 'en'
    const industryLabels: Record<string, string> = isEn
      ? { insurance: 'Insurance', securities: 'Securities', bank: 'Bank' }
      : { insurance: '保险', securities: '证券', bank: '银行' }
    const industryLabel = industryLabels[industry || 'bank'] || industry || 'Bank'
    const processLabels = (processes && processes.length > 0 ? processes : ['loanApproval']).map((p) => {
      const mapZh: Record<string, string> = {
        loanApproval: '贷款审批', creditMgmt: '征信管理', incomeVerification: '收入验证',
        postLoanMonitoring: '贷后监控', fundFlow: '资金流向', collateralMgmt: '抵押物管理',
      }
      const mapEn: Record<string, string> = {
        loanApproval: 'Loan Approval', creditMgmt: 'Credit Mgmt', incomeVerification: 'Income Verification',
        postLoanMonitoring: 'Post-Loan Monitoring', fundFlow: 'Fund Flow', collateralMgmt: 'Collateral Mgmt',
      }
      return isEn ? (mapEn[p] || p) : (mapZh[p] || p)
    })
    const seed = Date.now()
    const generated: GeneratedPBCItem[] = [
      {
        id: `PBC-GEN-${seed}-1`,
        documentType: `${industryLabel} - ${processLabels[0]} - ${isEn ? 'Cross-Verification Table' : '交叉验证表'}`,
        category: '凭证单据',
        controlId: 'CTRL-002',
        dueDate: '2025-04-25',
        description: isEn
          ? `Supplementary PBC material auto-generated based on ${industryLabel} industry standards and ${processLabels.join(', ')} processes`
          : `基于${industryLabel}行业标准与${processLabels.join('、')}流程自动生成的补充PBC材料`,
        approvalStatus: 'draft',
        status: 'pending',
      },
      {
        id: `PBC-GEN-${seed}-2`,
        documentType: `${industryLabel} - ${processLabels.length > 1 ? processLabels[1] : processLabels[0]} - ${isEn ? 'Authorization Matrix Verification' : '权限矩阵验证'}`,
        category: '审批记录',
        controlId: 'CTRL-004',
        dueDate: '2025-04-25',
        description: isEn
          ? `Approval authorization verification checklist auto-generated based on ${industryLabel} internal control guidelines`
          : `基于${industryLabel}行业内控指引自动生成的审批权限验证清单`,
        approvalStatus: 'draft',
        status: 'pending',
      },
    ]
    setGeneratedItems((prev) => [...prev, ...generated])
    setApprovalStatus('draft')
  }, [language])

  const generateInterviewOutline = useCallback(() => {
    setShowInterviewOutline(true)
  }, [])

  const generateReminderEmail = useCallback(() => {
    setShowEmailDraft(true)
  }, [])

  // Generated PBC item management
  const editGeneratedItem = useCallback((id: string, field: keyof GeneratedPBCItem, value: string) => {
    setGeneratedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }, [])

  const removeGeneratedItem = useCallback((id: string) => {
    setGeneratedItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const submitForApproval = useCallback(() => {
    // Move generated items to main PBC list and set approval status
    const newPBCItems: PBCRequest[] = generatedItems.map((item) => ({
      id: item.id,
      controlId: item.controlId,
      documentType: item.documentType,
      category: item.category,
      description: item.description,
      dueDate: item.dueDate,
      status: item.status,
    }))
    setApprovalStatus('pending')
    setGeneratedItems((prev) => prev.map((item) => ({ ...item, approvalStatus: 'pending' as PBCApprovalStatus })))
    setPBCList((prev) => [...newPBCItems, ...prev])
  }, [generatedItems])

  return {
    pbcList,
    filteredList,
    stats,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    progressByControl,
    emailDraft,
    showEmailDraft,
    setShowEmailDraft,
    showInterviewOutline,
    setShowInterviewOutline,
    selectedIndustry,
    setSelectedIndustry,
    selectedProcesses,
    setSelectedProcesses,
    generatedItems,
    approvalStatus,
    generatePBCList,
    generateInterviewOutline,
    generateReminderEmail,
    editGeneratedItem,
    removeGeneratedItem,
    submitForApproval,
  }
}
