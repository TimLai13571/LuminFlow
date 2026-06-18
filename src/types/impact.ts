// ============================================================
// 影响分析类型定义
// ============================================================

export type ChangeEventType =
  | 'control_deficiency'
  | 'organizational_change'
  | 'regulatory_change'
  | 'it_system_change';

export type ImpactLevel = 'direct' | 'indirect' | 'potential' | 'unaffected';

export interface ChangeEvent {
  type: ChangeEventType;
  severity: number; // 1-10
  affectedDimensions: ('control_test' | 'sample_size' | 'timeline' | 'compliance')[];
  description?: string;
}

export interface ImpactNode {
  id: string;
  name: string;
  level: ImpactLevel;
  radius: number; // 36/28/22/18/14
  color: string;
  x?: number;
  y?: number;
}

export interface ImpactLink {
  source: string;
  target: string;
  style: 'solid' | 'dashed' | 'dotted';
  width: number;
}

export interface ComparisonRow {
  dimension: string;
  before: string;
  after: string;
  delta: string;
  direction: 'negative' | 'neutral' | 'positive';
}

export interface Recommendation {
  id: string;
  priority: 'P1' | 'P2' | 'P3';
  description: string;
  riskReduction: number;
  adopted: boolean;
}

export interface ImpactResult {
  nodes: ImpactNode[];
  links: ImpactLink[];
  comparison: ComparisonRow[];
  recommendations: Recommendation[];
  summary: string;
}
