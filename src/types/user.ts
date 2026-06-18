// ============================================================
// 用户角色类型定义
// ============================================================

export type UserRole = 'cfo' | 'auditor' | 'partner' | 'finance_clerk' | 'finance_manager';

export type VisibilityLevel = 'full' | 'partial' | 'hidden';

export interface VisibilityConfig {
  module: string;
  level: VisibilityLevel;
  isDraft: boolean;
  pageLevel?: VisibilityLevel;
  moduleLevel?: VisibilityLevel;
}

export interface ApprovalItem {
  id: string;
  type: 'ai_insight' | 'pbc_description' | 'impact_report' | 'narrative';
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision';
  createdAt: string;
  reviewedAt?: string;
}

export interface Notification {
  id: string;
  type: 'pbc_overdue' | 'new_finding' | 'simulation_complete' | 'ai_approval' | 'mention';
  title: string;
  description: string;
  titleKey?: string;
  descriptionKey?: string;
  timestamp: string;
  read: boolean;
}
