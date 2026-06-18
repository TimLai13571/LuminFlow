import { useState, useCallback } from 'react'
import type { ChangeEvent, ImpactResult, ImpactNode, ImpactLink, ComparisonRow, Recommendation } from '@/types/impact'
import { useLanguageStore } from '@/store/language-store'
import { translateData } from '@/locales/data-translations'

function generateMockResult(config: ChangeEvent, lang: 'en' | 'zh'): ImpactResult {
  const severityFactor = config.severity / 10
  const td = (text: string) => translateData(text, lang)

  const nodeNames: Record<string, string[]> = {
    control_deficiency: [
      '控制缺陷事件', '内部控制', '财务报告', '审计范围',
      '风险评估', '样本量', '测试程序', '合规检查',
      '管理层评估', '信息系统', '人员培训', '文档管理',
    ],
    organizational_change: [
      '组织调整事件', '人员配置', '权限分离', '审批流程',
      '部门职责', '信息传递', '控制环境', '风险应对',
      '培训计划', '系统访问', '知识转移', '绩效评估',
    ],
    regulatory_change: [
      '法规变更事件', '合规要求', '披露标准', '审计准则',
      '内控框架', '报告格式', '评估标准', '监管申报',
      '风险阈值', '控制目标', '测试方法', '证据标准',
    ],
    it_system_change: [
      'IT系统变更事件', '数据完整性', '访问控制', '变更管理',
      '接口测试', '备份恢复', '审计轨迹', '自动化控制',
      '系统集成', '数据迁移', '性能监控', '安全策略',
    ],
  }

  const names = nodeNames[config.type]
  const nodeCount = Math.floor(Math.random() * 5) + 8

  const nodes: ImpactNode[] = names.slice(0, nodeCount).map((name, i) => {
    let level: ImpactNode['level']
    let radius: number
    let color: string

    if (i === 0) {
      level = 'direct'
      radius = 36
      color = '#FF6B00'
    } else if (i <= 3) {
      level = 'direct'
      radius = 28
      color = Math.random() > 0.3 ? '#D32F2F' : '#009A44'
    } else if (i <= 7) {
      level = 'indirect'
      radius = 22
      color = Math.random() > 0.5 ? '#D32F2F' : Math.random() > 0.5 ? '#009A44' : '#757575'
    } else {
      level = 'potential'
      radius = 14
      color = Math.random() > 0.6 ? '#757575' : '#D32F2F'
    }

    return { id: `node-${i}`, name: td(name), level, radius, color }
  })

  const links: ImpactLink[] = []
  for (let i = 1; i <= Math.min(3, nodeCount - 1); i++) {
    links.push({ source: 'node-0', target: `node-${i}`, style: 'solid', width: 2 })
  }
  for (let i = 4; i <= Math.min(7, nodeCount - 1); i++) {
    const src = Math.floor(Math.random() * 3) + 1
    links.push({ source: `node-${src}`, target: `node-${i}`, style: 'dashed', width: 1.5 })
  }
  for (let i = 8; i < nodeCount; i++) {
    const src = Math.floor(Math.random() * 4) + 4
    links.push({ source: `node-${src}`, target: `node-${i}`, style: 'dotted', width: 1 })
  }
  if (nodeCount > 5) {
    links.push({ source: 'node-2', target: 'node-5', style: 'dashed', width: 1.5 })
  }
  if (nodeCount > 7) {
    links.push({ source: 'node-3', target: 'node-6', style: 'dotted', width: 1 })
  }

  const comparison: ComparisonRow[] = [
    {
      dimension: td('残余风险'),
      before: `${(25 + Math.random() * 10).toFixed(1)}%`,
      after: `${(25 + severityFactor * 30 + Math.random() * 10).toFixed(1)}%`,
      delta: `+${(severityFactor * 30).toFixed(1)}%`,
      direction: 'negative',
    },
    {
      dimension: td('控制有效性'),
      before: `${(85 + Math.random() * 5).toFixed(1)}%`,
      after: `${(85 - severityFactor * 20 + Math.random() * 5).toFixed(1)}%`,
      delta: `−${(severityFactor * 20).toFixed(1)}%`,
      direction: 'negative',
    },
    {
      dimension: td('合规指标'),
      before: `${(90 + Math.random() * 5).toFixed(1)}%`,
      after: `${(90 - severityFactor * 15 + Math.random() * 5).toFixed(1)}%`,
      delta: `−${(severityFactor * 15).toFixed(1)}%`,
      direction: severityFactor > 0.5 ? 'negative' : 'neutral',
    },
    {
      dimension: td('运营效率'),
      before: `${(78 + Math.random() * 5).toFixed(1)}%`,
      after: `${(78 - severityFactor * 10 + Math.random() * 5).toFixed(1)}%`,
      delta: `−${(severityFactor * 10).toFixed(1)}%`,
      direction: severityFactor > 0.3 ? 'negative' : 'neutral',
    },
    {
      dimension: td('成本影响'),
      before: lang === 'en' ? 'Baseline' : '基准',
      after: `+${(severityFactor * 25).toFixed(0)}${lang === 'en' ? 'K' : '万'}`,
      delta: `+${(severityFactor * 25).toFixed(0)}${lang === 'en' ? 'K' : '万'}`,
      direction: 'negative',
    },
  ]

  const allRecommendations: Recommendation[] = [
    {
      id: 'rec-1',
      priority: 'P1',
      description: td('立即加强关键控制点的测试频率，将抽样量提升50%'),
      riskReduction: 35,
      adopted: false,
    },
    {
      id: 'rec-2',
      priority: 'P1',
      description: td('增设补偿性控制以覆盖识别的控制缺口'),
      riskReduction: 28,
      adopted: false,
    },
    {
      id: 'rec-3',
      priority: 'P2',
      description: td('更新风险评估矩阵，重新评估受影响流程的固有风险等级'),
      riskReduction: 20,
      adopted: false,
    },
    {
      id: 'rec-4',
      priority: 'P3',
      description: td('安排专项培训，确保相关人员理解变更后的控制要求'),
      riskReduction: 12,
      adopted: false,
    },
  ]

  const recCount = Math.floor(Math.random() * 2) + 3
  const recommendations = allRecommendations.slice(0, recCount)

  const typeLabel = lang === 'en'
    ? config.type === 'control_deficiency' ? 'Control Deficiency'
      : config.type === 'organizational_change' ? 'Organizational Change'
      : config.type === 'regulatory_change' ? 'Regulatory Change'
      : 'IT System Change'
    : config.type === 'control_deficiency' ? '控制缺陷'
      : config.type === 'organizational_change' ? '组织调整'
      : config.type === 'regulatory_change' ? '法规变更'
      : 'IT系统变更'

  const summary = lang === 'en'
    ? `Based on ${typeLabel} event (severity ${config.severity}/10), AI identified ${nodes.length} affected nodes and ${links.length} impact chains.`
    : `基于${typeLabel}事件（严重度 ${config.severity}/10），AI 已识别 ${nodes.length} 个受影响节点和 ${links.length} 条影响链路。`

  return { nodes, links, comparison, recommendations, summary }
}

export function useImpactSimulation() {
  const language = useLanguageStore((s) => s.language)
  const [config, setConfig] = useState<ChangeEvent>({
    type: 'control_deficiency',
    severity: 5,
    affectedDimensions: ['control_test'],
  })
  const [result, setResult] = useState<ImpactResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const simulate = useCallback(async (eventConfig: ChangeEvent) => {
    setIsSimulating(true)
    setResult(null)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const mockResult = generateMockResult(eventConfig, language)
    setResult(mockResult)
    setIsSimulating(false)
  }, [language])

  const reset = useCallback(() => {
    setResult(null)
    setConfig({
      type: 'control_deficiency',
      severity: 5,
      affectedDimensions: ['control_test'],
    })
  }, [])

  return { config, setConfig, result, isSimulating, simulate, reset }
}
