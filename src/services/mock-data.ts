// ============================================================
// Mock Data Service
// ============================================================

import type {
  AuditTreeNode,
  Control,
  Finding,
  PBCRequest,
  KPIMetric,
  RCMEntry,
  COSOPrinciple,
} from '@/types/audit';
import type { SamplingPlan } from '@/types/sampling';
import type { UserRole } from '@/types/user';
import { useLanguageStore, type Language } from '@/store/language-store';
import { translateData } from '@/locales/data-translations';

import cosoFrameworkData from '@/data/coso-framework.json';
import auditObjectivesData from '@/data/audit-objectives.json';
import controlsData from '@/data/controls.json';
import testResultsData from '@/data/test-results.json';
import pbcRequestsData from '@/data/pbc-requests.json';
import samplingParamsData from '@/data/sampling-params.json';
import kpiMetricsData from '@/data/kpi-metrics.json';
import rcmMatrixData from '@/data/rcm-matrix.json';

// ---- Utilities ----

function getLang(): Language {
  return useLanguageStore.getState().language;
}

function td(text: string): string {
  return translateData(text, getLang());
}

function translateTree(node: Record<string, unknown>): Record<string, unknown> {
  const result = { ...node };
  if (typeof result.name === 'string') result.name = td(result.name);
  if (typeof result.description === 'string') result.description = td(result.description);
  if (Array.isArray(result.children)) {
    result.children = (result.children as Record<string, unknown>[]).map(translateTree);
  }
  if (Array.isArray(result.findings)) {
    result.findings = (result.findings as Record<string, unknown>[]).map((f) => ({
      ...f,
      title: typeof f.title === 'string' ? td(f.title) : f.title,
      description: typeof f.description === 'string' ? td(f.description) : f.description,
      impactAssessment: typeof f.impactAssessment === 'string' ? td(f.impactAssessment) : f.impactAssessment,
      remediation: typeof f.remediation === 'string' ? td(f.remediation) : f.remediation,
    }));
  }
  return result;
}

function delay(ms?: number): Promise<void> {
  const wait = ms ?? Math.floor(Math.random() * 300) + 200;
  return new Promise((resolve) => setTimeout(resolve, wait));
}

// ---- Data Access Functions ----

export async function getAuditTree(): Promise<AuditTreeNode> {
  await delay();
  return translateTree(auditObjectivesData as unknown as Record<string, unknown>) as unknown as AuditTreeNode;
}

export async function getControls(): Promise<Control[]> {
  await delay();
  const controls = controlsData as unknown as Record<string, unknown>[];
  return controls.map((c) => translateTree(c)) as unknown as Control[];
}

export async function getFindings(): Promise<Finding[]> {
  await delay();
  const findings = testResultsData.findings as unknown as Record<string, unknown>[];
  return findings.map((f) => ({
    ...f,
    title: typeof f.title === 'string' ? td(f.title) : f.title,
    description: typeof f.description === 'string' ? td(f.description) : f.description,
    impactAssessment: typeof f.impactAssessment === 'string' ? td(f.impactAssessment) : f.impactAssessment,
    remediation: typeof f.remediation === 'string' ? td(f.remediation) : f.remediation,
  })) as unknown as Finding[];
}

export async function getTestSummary() {
  await delay();
  return testResultsData.testSummary;
}

export async function getBranchCoverage() {
  await delay();
  const data = testResultsData.branchCoverage;
  return {
    ...data,
    branchList: data.branchList.map((b) => ({
      ...b,
      name: td(b.name),
      region: td(b.region),
    })),
  };
}

/**
 * 获取 PBC 请求列表（按角色过滤）
 * - CFO: 仅看到 overdue 项
 * - Auditor: 全部
 * - Partner: 仅看到 overdue + submitted
 */
export async function getPBCRequests(role: UserRole): Promise<PBCRequest[]> {
  await delay();
  const all = (pbcRequestsData as unknown as Record<string, unknown>[]).map((r) => ({
    ...r,
    documentType: typeof r.documentType === 'string' ? td(r.documentType) : r.documentType,
    category: typeof r.category === 'string' ? td(r.category) : r.category,
    description: typeof r.description === 'string' ? td(r.description) : r.description,
  })) as unknown as PBCRequest[];

  switch (role) {
    case 'cfo':
      return all.filter((r) => r.status === 'overdue');
    case 'partner':
      return all.filter((r) => r.status === 'overdue' || r.status === 'submitted');
    case 'auditor':
    default:
      return all;
  }
}

export async function getSamplingPlan(): Promise<SamplingPlan> {
  await delay();
  const data = samplingParamsData;
  return {
    objectiveId: 'OBJ-ROOT',
    period: data.currentPlan.period,
    totalRange: data.currentPlan.totalRange,
    confidence: data.currentPlan.confidence,
    documentDistribution: data.documentDistribution.map((d) => ({
      category: td(d.category),
      percentage: d.percentage,
      subTypes: d.subTypes.map(td),
      controlMapping: d.controlMapping,
      color: d.color,
    })),
    timeWindows: data.timeWindows.map((w) => ({ ...w, period: td(w.period) })),
    historicalTrend: data.historicalTrend,
    rationale: data.rationale.map(td),
    elevatedControls: data.elevatedControls.map((e) => ({
      ...e,
      controlName: td(e.controlName),
      reason: td(e.reason),
    })),
  };
}

/**
 * 获取 KPI 指标（按角色过滤）
 * - CFO: client 类
 * - Auditor: audit 类
 * - Partner: review + audit 类
 */
export async function getKPIMetrics(role: UserRole): Promise<KPIMetric[]> {
  await delay();
  const all = (kpiMetricsData as unknown as Record<string, unknown>[]).map((m) => ({
    ...m,
    name: typeof m.name === 'string' ? td(m.name) : m.name,
    unit: typeof m.unit === 'string' ? td(m.unit) : m.unit,
  })) as unknown as KPIMetric[];

  switch (role) {
    case 'cfo':
      return all.filter((m) => m.category === 'client');
    case 'auditor':
      return all.filter((m) => m.category === 'audit');
    case 'partner':
      return all.filter((m) => m.category === 'review' || m.category === 'audit');
    default:
      return all;
  }
}

export async function getRCMMatrix(): Promise<RCMEntry[]> {
  await delay();
  return (rcmMatrixData as unknown as Record<string, unknown>[]).map((r) => ({
    ...r,
    riskName: typeof r.riskName === 'string' ? td(r.riskName) : r.riskName,
    controlName: typeof r.controlName === 'string' ? td(r.controlName) : r.controlName,
    controlType: typeof r.controlType === 'string' ? td(r.controlType) : r.controlType,
    frequency: typeof r.frequency === 'string' ? td(r.frequency) : r.frequency,
    testProcedure: typeof r.testProcedure === 'string' ? td(r.testProcedure) : r.testProcedure,
  })) as unknown as RCMEntry[];
}

export async function getCOSOFramework(): Promise<COSOPrinciple[]> {
  await delay();
  const lang = getLang();
  return cosoFrameworkData.map((item) => ({
    id: item.id,
    component: item.component as COSOPrinciple['component'],
    name: lang === 'en' ? item.name_en : item.name_cn,
    description: lang === 'en' ? td(item.description) : item.description,
  }));
}

export async function getSamplingParams() {
  await delay();
  return samplingParamsData.params;
}

export async function getHistoricalTrend() {
  await delay();
  return samplingParamsData.historicalTrend;
}

export async function getElevatedControls() {
  await delay();
  const data = samplingParamsData.elevatedControls;
  return data.map((e) => ({
    ...e,
    controlName: td(e.controlName),
    reason: td(e.reason),
  }));
}
