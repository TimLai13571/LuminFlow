// 类型统一导出
export type {
  COSOComponent,
  COSOPrinciple,
  AuditStatus,
  AuditObjective,
  RiskArea,
  ControlType,
  ControlFrequency,
  Control,
  FindingSeverity,
  FindingType,
  Finding,
  PBCStatus,
  PBCRequest,
  RCMEntry,
  KPIMetric,
  AuditTreeNode,
  RiskFactor,
  RiskScoringInput,
} from './audit';

export type {
  SamplingPlan,
  DocumentCategory,
  TimeWindow,
  HistoricalSample,
  ElevatedControl,
  SamplingParams,
} from './sampling';

export type {
  ChangeEventType,
  ImpactLevel,
  ChangeEvent,
  ImpactNode,
  ImpactLink,
  ComparisonRow,
  Recommendation,
  ImpactResult,
} from './impact';

export type {
  UserRole,
  VisibilityLevel,
  VisibilityConfig,
  ApprovalItem,
  Notification,
} from './user'

export type {
  NarrativeAudience,
  NarrativeSegmentType,
  NarrativeRequest,
  NarrativeResult,
  NarrativeSegment,
  ApprovalStepStatus,
  NarrativeApprovalStatus,
} from './narrative';
