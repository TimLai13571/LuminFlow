import { useState, useCallback, useMemo, useEffect } from 'react'
import type { RiskFactor, RiskScoringInput, RCMEntry } from '@/types/audit'
import { useLanguageStore } from '@/store/language-store'
import { translateData } from '@/locales/data-translations'
import riskFactorsData from '@/data/risk-factors.json'
import rcmMatrixData from '@/data/rcm-matrix.json'

/** RAWTC risk level classification */
export type RAWTCLevel = 'Base' | 'Elevated' | 'Significant' | 'Significant+'

interface FactorDetail {
  factorId: string
  factorName: string
  score: number
  detail: string
}

/** A single (risk, control) cell in the heatmap */
export interface RCMRiskScore {
  riskId: string
  riskName: string
  controlId: string
  controlName: string
  rawtcScore: number
  adjustedScore: number
  rawtcLevel: RAWTCLevel
  factorScores: FactorDetail[]
}

/** Aggregated risk info per control point (for tooltips) */
export interface ControlRiskSummary {
  controlId: string
  name: string
  riskScores: RCMRiskScore[]
  avgAdjustedScore: number
  dominantLevel: RAWTCLevel
  factorScores: FactorDetail[]
}

const defaultWeights: RiskScoringInput = {
  historicalDeficiency: 0.30,
  processChange: 0.20,
  systemUpgrade: 0.18,
  regulatoryRule: 0.17,
  regulatoryPenalty: 0.15,
}

const controlNamesZh: Record<string, string> = {
  'CTRL-001': '信用评分模型',
  'CTRL-002': '收入证明审核',
  'CTRL-003': '征信查询授权',
  'CTRL-004': '贷款审批授权',
  'CTRL-005': '贷款用途监控',
  'CTRL-006': '资金流向监控',
  'CTRL-007': '关联方核查',
  'CTRL-008': '异常交易识别',
  'CTRL-009': '客户回访管理',
  'CTRL-010': '抵押物评估',
  'CTRL-011': '逾期预警系统',
  'CTRL-012': '风险分类调整',
}

const controlNamesEn: Record<string, string> = {
  'CTRL-001': 'Credit Scoring Model',
  'CTRL-002': 'Income Verification',
  'CTRL-003': 'Credit Inquiry Authorization',
  'CTRL-004': 'Loan Approval Authorization',
  'CTRL-005': 'Loan Purpose Monitoring',
  'CTRL-006': 'Fund Flow Monitoring',
  'CTRL-007': 'Related Party Review',
  'CTRL-008': 'Anomaly Transaction Detection',
  'CTRL-009': 'Client Follow-up Management',
  'CTRL-010': 'Collateral Valuation',
  'CTRL-011': 'Overdue Alert System',
  'CTRL-012': 'Risk Classification Adjustment',
}

/** Classify numeric score into RAWTC level */
function classifyRAWTC(score: number): RAWTCLevel {
  if (score >= 8.0) return 'Significant+'
  if (score >= 6.0) return 'Significant'
  if (score >= 4.0) return 'Elevated'
  return 'Base'
}

export function useHeatLens() {
  const language = useLanguageStore((s) => s.language)
  const controlNames = language === 'en' ? controlNamesEn : controlNamesZh
  const [weights, setWeights] = useState<RiskScoringInput>({ ...defaultWeights })
  const [isCalculating, setIsCalculating] = useState(false)
  const [rcmData] = useState<RCMEntry[]>(rcmMatrixData as RCMEntry[])

  // Build factor impact per control point (weighted sum of 5 factors)
  const controlFactorMap = useMemo(() => {
    const weightMap: Record<string, number> = {
      historical_deficiency: weights.historicalDeficiency,
      process_change: weights.processChange,
      system_upgrade: weights.systemUpgrade,
      regulatory_rule: weights.regulatoryRule,
      regulatory_penalty: weights.regulatoryPenalty,
    }

    const data = riskFactorsData as Array<{
      id: string
      name: string
      impacts: Array<{ controlId: string; score: number; detail: string }>
    }>

    const map: Record<string, { totalImpact: number; factorScores: FactorDetail[] }> = {}

    data.forEach((factor) => {
      const w = weightMap[factor.id] || 0
      factor.impacts.forEach((impact) => {
        if (!map[impact.controlId]) {
          map[impact.controlId] = { totalImpact: 0, factorScores: [] }
        }
        map[impact.controlId].totalImpact += impact.score * w
        map[impact.controlId].factorScores.push({
          factorId: factor.id,
          factorName: factor.name,
          score: impact.score,
          detail: translateData(impact.detail, language),
        })
      })
    })

    return map
  }, [weights])

  // Compute risk scores for each (risk, control) pair from RCM
  const rcmRiskScores: RCMRiskScore[] = useMemo(() => {
    return rcmData.map((entry) => {
      const cf = controlFactorMap[entry.controlId]
      const factorImpact = cf?.totalImpact || 0
      // Adjust rawtc by factor impact: factorImpact ranges ~1.5-7, center at 3.5
      const adjustment = (factorImpact - 3.5) * 0.4
      const adjustedScore = Math.max(1, Math.min(10, entry.rawtc + adjustment))
      const rawtcLevel = classifyRAWTC(adjustedScore)

      return {
        riskId: entry.riskId,
        riskName: translateData(entry.riskName, language),
        controlId: entry.controlId,
        controlName: controlNames[entry.controlId] || entry.controlName,
        rawtcScore: entry.rawtc,
        adjustedScore: Math.round(adjustedScore * 10) / 10,
        rawtcLevel,
        factorScores: cf?.factorScores || [],
      }
    })
  }, [rcmData, controlFactorMap])

  // Group by control point for summary view
  const controlSummaries: ControlRiskSummary[] = useMemo(() => {
    const map: Record<string, ControlRiskSummary> = {}
    rcmRiskScores.forEach((rs) => {
      if (!map[rs.controlId]) {
        map[rs.controlId] = {
          controlId: rs.controlId,
          name: rs.controlName,
          riskScores: [],
          avgAdjustedScore: 0,
          dominantLevel: 'Base',
          factorScores: rs.factorScores,
        }
      }
      map[rs.controlId].riskScores.push(rs)
    })

    return Object.values(map).map((cs) => {
      const total = cs.riskScores.reduce((s, r) => s + r.adjustedScore, 0)
      cs.avgAdjustedScore = Math.round((total / cs.riskScores.length) * 10) / 10
      // Dominant level: count most frequent level
      const levelCount: Record<RAWTCLevel, number> = { Base: 0, Elevated: 0, Significant: 0, 'Significant+': 0 }
      cs.riskScores.forEach((r) => { levelCount[r.rawtcLevel]++ })
      cs.dominantLevel = (Object.entries(levelCount) as [RAWTCLevel, number][])
        .sort((a, b) => b[1] - a[1])[0][0]
      return cs
    }).sort((a, b) => b.avgAdjustedScore - a.avgAdjustedScore)
  }, [rcmRiskScores])

  // Factor breakdown (unchanged logic, but no COSO component)
  const factorBreakdown = useMemo(() => {
    const data = riskFactorsData as Array<{
      id: string
      name: string
      nameKey: string
      impacts: Array<{ controlId: string; score: number; detail: string }>
    }>

    return data.map((factor) => {
      const top5 = [...factor.impacts]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((impact) => ({
          ...impact,
          controlName: controlNames[impact.controlId] || impact.controlId,
          detail: translateData(impact.detail, language),
        }))
      return {
        factorId: factor.id,
        factorName: factor.name,
        factorNameKey: factor.nameKey,
        top5,
      }
    })
  }, [])

  const factors: RiskFactor[] = useMemo(() => {
    return (riskFactorsData as Array<{
      id: string
      name: string
      nameKey: string
      weight: number
      description: string
      descriptionKey: string
    }>).map((f) => ({
      id: f.id,
      name: f.name,
      nameKey: f.nameKey,
      weight: f.weight,
      score: 0,
      description: f.description,
      descriptionKey: f.descriptionKey,
    }))
  }, [])

  const updateWeight = useCallback((factorKey: keyof RiskScoringInput, value: number) => {
    setWeights((prev) => ({ ...prev, [factorKey]: Math.round(value * 100) / 100 }))
  }, [])

  const recalculate = useCallback(async () => {
    setIsCalculating(true)
    await new Promise((r) => setTimeout(r, 800))
    setIsCalculating(false)
  }, [])

  const resetWeights = useCallback(() => {
    setWeights({ ...defaultWeights })
  }, [])

  return {
    factors,
    rcmRiskScores,
    controlSummaries,
    factorBreakdown,
    weights,
    isCalculating,
    updateWeight,
    recalculate,
    resetWeights,
  }
}
