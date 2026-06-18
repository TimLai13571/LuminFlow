// ============================================================
// 叙事生成器类型定义
// ============================================================

export type NarrativeAudience = 'CFO' | 'internal_audit' | 'IT'

export type NarrativeSegmentType = 'fact' | 'judgment' | 'suggestion'

export interface NarrativeRequest {
  topic: string
  audience: NarrativeAudience
  findings: string[]
}

export interface NarrativeResult {
  narrative: string
  key_points: string[]
  suggested_actions: string[]
}

export interface NarrativeSegment {
  type: NarrativeSegmentType
  content: string
}

export type ApprovalStepStatus = 'pending' | 'completed' | 'approved' | 'rejected'

export interface NarrativeApprovalStatus {
  aiScreening: ApprovalStepStatus
  managerApproval: ApprovalStepStatus
  partnerQC: ApprovalStepStatus
}
