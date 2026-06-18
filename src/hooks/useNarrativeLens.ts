import { useState, useCallback } from 'react'
import type { NarrativeSegment, NarrativeApprovalStatus } from '@/types/narrative'
import { useLanguageStore } from '@/store/language-store'

interface Finding {
  id: string
  title: string
  severity: 'high' | 'medium' | 'low'
}

export interface ReferencedFinding {
  id: string
  source: 'clara' | 'cndocs'
  sourceName: string
  content: string
}

interface NarrativeState {
  topic: string
  findings: Finding[]
  narrative: NarrativeSegment[]
  keyPoints: string[]
  isGenerating: boolean
  approval: NarrativeApprovalStatus
  isDraft: boolean
}

const DEFAULT_APPROVAL: NarrativeApprovalStatus = {
  aiScreening: 'pending',
  managerApproval: 'pending',
  partnerQC: 'pending',
}

// Mock narrative content — Chinese
const mockNarrativeZh = {
  segments: [
    {
      type: 'fact' as const,
      content: '在本次FY2025中期审计中，我们对个人贷款业务的12个核心控制点进行了系统性评估。总体控制有效率为78%，较上年同期提升6个百分点。其中，贷款审批授权(CTRL-004)和收入证明审核(CTRL-002)两个领域发现中度缺陷，主要涉及越权审批和文档完整性不足。当前已提交整改方案，预计在Q3完成全部整改。',
    },
    {
      type: 'judgment' as const,
      content: '从审计专业判断角度看，CTRL-003(征信查询授权)和CTRL-004(贷款审批授权)的控制缺陷具有系统性特征。CTRL-003的征信查询授权书签署存在后补现象，表明控制执行存在时间性偏差。CTRL-004的越权审批主要集中在分行行长级别，可能与Q1组织架构调整后的权限交接不及时有关。这两个缺陷相互独立但共同指向授权管理体系的标准化不足。',
    },
    {
      type: 'suggestion' as const,
      content: '建议：(1) 征信查询系统应增加强制授权书上传节点，实现系统硬控制替代人工软控制；(2) 审批权限矩阵建议改为系统自动同步，组织架构变更后72小时内自动更新；(3) 针对Q2审计计划，建议将CTRL-003和CTRL-004的追加测试样本量提升至40笔；(4) 考虑在FY2026审计计划中加入授权管理专项审计。',
    },
  ],
  keyPoints: ['控制有效率78%，同比+6%', 'CTRL-003/004为系统性缺陷，授权管理标准化不足', '建议系统硬控制替代人工软控制', 'Q2追加测试建议40笔'],
  findings: [
    { id: '1', title: '贷款审批授权越权(CTRL-004)', severity: 'high' as const },
    { id: '2', title: '收入证明审核偏差率高(CTRL-002)', severity: 'medium' as const },
  ],
}

const mockNarrativeEn = {
  segments: [
    {
      type: 'fact' as const,
      content: 'During this FY2025 interim audit, we performed a systematic evaluation of 12 core control points for personal loan operations. Overall control effectiveness rate is 78%, a 6-percentage-point increase year-over-year. Moderate deficiencies were identified in Loan Approval Authorization (CTRL-004) and Income Verification (CTRL-002), primarily involving unauthorized approvals and insufficient documentation completeness. Remediation plans have been submitted with full completion expected in Q3.',
    },
    {
      type: 'judgment' as const,
      content: 'From an audit professional judgment perspective, the control deficiencies in CTRL-003 (Credit Inquiry Authorization) and CTRL-004 (Loan Approval Authorization) exhibit systemic characteristics. The post-dated signing of credit inquiry authorization forms for CTRL-003 indicates a timing deviation in control execution. Unauthorized approvals for CTRL-004 are concentrated at the branch manager level, possibly related to delayed authority handover following Q1 organizational restructuring. These two deficiencies are independent but collectively point to insufficient standardization of the authorization management framework.',
    },
    {
      type: 'suggestion' as const,
      content: 'Recommendations: (1) Add a mandatory authorization document upload checkpoint in the credit inquiry system to replace manual soft controls with system hard controls; (2) Implement automatic synchronization of the approval authority matrix within 72 hours of organizational changes; (3) Increase supplemental testing sample size for CTRL-003 and CTRL-004 to 40 items for Q2 audit plan; (4) Consider adding a dedicated authorization management audit to the FY2026 audit plan.',
    },
  ],
  keyPoints: ['Control effectiveness 78%, +6% YoY', 'CTRL-003/004 are systemic deficiencies — insufficient authorization standardization', 'Recommend system hard controls over manual soft controls', 'Q2 supplemental testing: 40 items recommended'],
  findings: [
    { id: '1', title: 'Unauthorized Loan Approval (CTRL-004)', severity: 'high' as const },
    { id: '2', title: 'High Income Verification Deviation Rate (CTRL-002)', severity: 'medium' as const },
  ],
}

export function useNarrativeLens() {
  const language = useLanguageStore((s) => s.language)
  const mockNarrative = language === 'en' ? mockNarrativeEn : mockNarrativeZh
  const [topic, setTopic] = useState('')
  const [findings, setFindings] = useState<Finding[]>([...mockNarrative.findings])
  const [referencedFindings, setReferencedFindings] = useState<ReferencedFinding[]>([])
  const [narrative, setNarrative] = useState<NarrativeSegment[]>([])
  const [keyPoints, setKeyPoints] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [approval, setApproval] = useState<NarrativeApprovalStatus>({ ...DEFAULT_APPROVAL })
  const [isDraft, setIsDraft] = useState(false)
  const [editableNarrative, setEditableNarrative] = useState<NarrativeSegment[]>([])

  const addFinding = useCallback(() => {
    const newId = String(findings.length + 1)
    setFindings((prev) => [
      ...prev,
      { id: newId, title: '', severity: 'medium' as const },
    ])
  }, [findings.length])

  const updateFinding = useCallback((id: string, field: keyof Finding, value: string) => {
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: field === 'severity' ? value : value } : f))
    )
  }, [])

  const removeFinding = useCallback((id: string) => {
    setFindings((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const generate = useCallback(async () => {
    setIsGenerating(true)
    setNarrative([])

    await new Promise((r) => setTimeout(r, 1500))

    setNarrative(mockNarrative.segments)
    setKeyPoints(mockNarrative.keyPoints)
    setEditableNarrative([...mockNarrative.segments])
    setIsGenerating(false)
    setApproval({
      ...DEFAULT_APPROVAL,
      aiScreening: 'completed',
    })
    setIsDraft(true)
  }, [])

  const saveDraft = useCallback(() => {
    setNarrative([...editableNarrative])
    setIsDraft(true)
  }, [editableNarrative])

  const updateSegment = useCallback((index: number, content: string) => {
    setEditableNarrative((prev) =>
      prev.map((s, i) => (i === index ? { ...s, content } : s))
    )
  }, [])

  const submitForApproval = useCallback(() => {
    setApproval((prev) => ({
      ...prev,
      aiScreening: 'approved',
      managerApproval: 'pending',
    }))
  }, [])

  const approveManager = useCallback(() => {
    setApproval((prev) => ({
      ...prev,
      managerApproval: 'approved',
      partnerQC: 'pending',
    }))
  }, [])

  const approvePartner = useCallback(() => {
    setApproval((prev) => ({
      ...prev,
      partnerQC: 'approved',
    }))
  }, [])

  const rejectStep = useCallback((step: keyof NarrativeApprovalStatus) => {
    setApproval((prev) => ({
      ...prev,
      [step]: 'rejected' as const,
    }))
  }, [])

  const addReferencedFinding = useCallback((rf: ReferencedFinding) => {
    setReferencedFindings((prev) => [...prev, rf])
  }, [])

  const removeReferencedFinding = useCallback((id: string) => {
    setReferencedFindings((prev) => prev.filter((f) => f.id !== id))
  }, [])

  return {
    topic,
    setTopic,
    findings,
    addFinding,
    updateFinding,
    removeFinding,
    referencedFindings,
    addReferencedFinding,
    removeReferencedFinding,
    narrative,
    keyPoints,
    isGenerating,
    approval,
    isDraft,
    editableNarrative,
    generate,
    saveDraft,
    updateSegment,
    submitForApproval,
    approveManager,
    approvePartner,
    rejectStep,
  }
}
