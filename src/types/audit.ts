// ============================================================
// 核心审计类型定义 — COSO框架 + 审计目标 + 控制 + 发现 + PBC + RCM + KPI
// ============================================================

// COSO 五要素
export type COSOComponent =
  | 'control_environment'
  | 'risk_assessment'
  | 'control_activities'
  | 'information_communication'
  | 'monitoring';

export interface COSOPrinciple {
  id: number; // 1-17
  component: COSOComponent;
  name: string;
  description: string;
}

// 通用状态
export type AuditStatus = 'completed' | 'in_progress' | 'pending' | 'deficiency' | 'delayed';

// 审计目标层级
export interface AuditObjective {
  id: string;
  name: string;
  description: string;
  status: AuditStatus;
  progress: number; // 0-100
  children?: (RiskArea | Control | Finding)[];
  level: 'root' | 'risk_area' | 'control' | 'finding';
}

export interface RiskArea {
  id: string;
  name: string;
  inherentRisk: number; // 1-10
  residualRisk: number; // 1-10
  status: AuditStatus;
  controls: Control[];
  cosoComponent: COSOComponent;
}

export type ControlType = '授权审批' | '验证核对' | '系统自动' | '报告生成';
export type ControlFrequency = '每笔交易' | '每日' | '每周' | '每月' | '每季度';

export interface Control {
  id: string;
  name: string;
  description: string;
  controlType: ControlType;
  frequency: ControlFrequency;
  rawtc: number; // 1-10 Risk Assessment Weighting of Testing Controls
  status: AuditStatus;
  priorYearDeficiency: boolean;
  elevatedRisk: boolean;
  testCompletion: number; // 0-100
  cosoComponent: COSOComponent;
  cosoPrinciple: number; // 1-17
  findings: Finding[];
}

export type FindingSeverity = 'high' | 'medium' | 'low';
export type FindingType = 'design' | 'execution';

export interface Finding {
  id: string; // e.g., F-001
  controlId: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  type: FindingType;
  deviationRate: number; // 百分比
  samplesTested: number;
  deviationsFound: number;
  impactAssessment: string;
  remediation: string;
  status: 'open' | 'remediated' | 'accepted';
}

export type PBCStatus = 'submitted' | 'pending' | 'overdue';

export interface PBCRequest {
  id: string;
  controlId: string;
  documentType: string;
  category: '审批记录' | '凭证单据' | '系统日志' | '报告文件';
  description: string;
  dueDate: string;
  submittedDate?: string;
  status: PBCStatus;
  overdueDays?: number;
}

export type PBCApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface GeneratedPBCItem {
  id: string;
  documentType: string;
  category: '审批记录' | '凭证单据' | '系统日志' | '报告文件';
  controlId: string;
  dueDate: string;
  description: string;
  approvalStatus: PBCApprovalStatus;
  status: PBCStatus;
}

export interface RCMEntry {
  riskId: string;
  riskName: string;
  controlId: string;
  controlName: string;
  cosoComponent: COSOComponent;
  cosoPrinciple: number;
  controlType: ControlType;
  frequency: ControlFrequency;
  rawtc: number;
  testProcedure: string;
}

// KPI
export interface KPIMetric {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  category: 'client' | 'audit' | 'review';
  status: 'good' | 'warning' | 'danger';
}

// 审计树节点（用于D3.js）
export interface AuditTreeNode {
  id: string
  name: string
  status: AuditStatus
  level: 'root' | 'risk_area' | 'control' | 'finding'
  value?: number
  children?: AuditTreeNode[]
  metadata?: Record<string, unknown>
}

// 风险因子
export interface RiskFactor {
  id: string
  name: string
  nameKey: string
  weight: number       // 0-1
  score: number        // 0-10 per control
  description: string
  descriptionKey: string
}

export interface RiskScoringInput {
  historicalDeficiency: number
  processChange: number
  systemUpgrade: number
  regulatoryRule: number
  regulatoryPenalty: number
}
