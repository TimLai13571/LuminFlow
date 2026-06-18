// ============================================================
// 抽样类型定义
// ============================================================

export interface SamplingPlan {
  objectiveId: string;
  period: string;
  totalRange: { min: number; max: number; median: number };
  confidence: number; // 百分比
  documentDistribution: DocumentCategory[];
  timeWindows: TimeWindow[];
  historicalTrend: HistoricalSample[];
  rationale: string[];
  elevatedControls: ElevatedControl[];
}

export interface DocumentCategory {
  category: string;
  percentage: number;
  subTypes: string[];
  controlMapping: string[];
  color?: string;
}

export interface TimeWindow {
  period: string;
  percentage: number;
  color: string;
}

export interface HistoricalSample {
  year: number;
  sampleSize: number;
  isPrediction?: boolean;
}

export interface ElevatedControl {
  controlId: string;
  controlName: string;
  additionalSamples: number;
  reason: string;
}

export interface SamplingParams {
  riskThreshold: number; // 1-10
  confidenceLevel: number; // 90/95/99
  elevatedCoefficient: number; // 1.0-2.0
}
