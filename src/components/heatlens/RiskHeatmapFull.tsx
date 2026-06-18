import ReactECharts from 'echarts-for-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import type { RCMRiskScore, RAWTCLevel } from '@/hooks/useHeatLens'

interface RiskHeatmapFullProps {
  rcmRiskScores: RCMRiskScore[]
}

const RAWTC_LEVELS: { level: RAWTCLevel; color: string; labelKey: string }[] = [
  { level: 'Base', color: '#009A44', labelKey: 'heatlens.rawtc.base' },
  { level: 'Elevated', color: '#FFD700', labelKey: 'heatlens.rawtc.elevated' },
  { level: 'Significant', color: '#FF6B00', labelKey: 'heatlens.rawtc.significant' },
  { level: 'Significant+', color: '#D32F2F', labelKey: 'heatlens.rawtc.significantPlus' },
]

const LEVEL_INDEX: Record<RAWTCLevel, number> = {
  'Base': 0,
  'Elevated': 1,
  'Significant': 2,
  'Significant+': 3,
}

export default function RiskHeatmapFull({ rcmRiskScores }: RiskHeatmapFullProps) {
  const { t } = useTranslation()

  // Extract unique axes values
  const riskNames = [...new Set(rcmRiskScores.map((r) => r.riskName))]
  const controlNames = [...new Set(rcmRiskScores.map((r) => r.controlName))]

  // Build heatmap data: [riskIndex, controlIndex, levelIndex]
  const heatmapData: [number, number, number][] = rcmRiskScores.map((rs) => {
    const x = riskNames.indexOf(rs.riskName)
    const y = controlNames.indexOf(rs.controlName)
    return [x, y !== -1 ? y : 0, LEVEL_INDEX[rs.rawtcLevel]]
  })

  const option = {
    tooltip: {
      trigger: 'item' as const,
      formatter: (params: { data?: [number, number, number] }) => {
        if (!params.data) return ''
        const [x, y, levelIdx] = params.data
        const riskName = riskNames[x] || ''
        const controlName = controlNames[y] || ''
        const cell = rcmRiskScores.find(
          (r) => r.riskName === riskName && r.controlName === controlName
        )
        if (!cell) return ''
        const level = RAWTC_LEVELS[levelIdx]
        const factorLines = cell.factorScores.map((f) =>
          `<div style="font-size:11px;color:#666;">· ${f.factorName}: ${f.score.toFixed(1)}</div>`
        ).join('')
        return `
          <div style="width:260px;padding:4px;">
            <div style="font-weight:600;margin-bottom:4px;">${controlName}</div>
            <div style="font-size:12px;color:#666;margin-bottom:4px;">${t('heatlens.riskPoint')}: ${riskName}</div>
            <div style="font-size:12px;color:#666;margin-bottom:6px;">RAWTC: ${cell.rawtcScore} → ${cell.adjustedScore}</div>
            <div style="font-size:15px;font-weight:700;color:${level.color};margin-bottom:6px;">
              ${t(level.labelKey)}
            </div>
            ${factorLines}
          </div>
        `
      },
    },
    grid: {
      left: '18%',
      right: '8%',
      top: '8%',
      bottom: '18%',
    },
    xAxis: {
      type: 'category' as const,
      name: t('heatlens.riskPoint'),
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { fontSize: 11, color: '#4A4A68', fontWeight: 'bold' },
      data: riskNames.map((name) => name.length > 6 ? name.slice(0, 6) + '…' : name),
      axisLabel: { fontSize: 10, color: '#4A4A68', rotate: 25 },
    },
    yAxis: {
      type: 'category' as const,
      name: t('heatlens.controlPoint'),
      nameLocation: 'middle',
      nameGap: 35,
      nameTextStyle: { fontSize: 11, color: '#4A4A68', fontWeight: 'bold' },
      data: controlNames.map((name) => name.length > 8 ? name.slice(0, 8) + '…' : name),
      axisLabel: { fontSize: 10, color: '#4A4A68' },
    },
    visualMap: {
      type: 'piecewise' as const,
      orient: 'horizontal' as const,
      left: 'center',
      bottom: '0%',
      pieces: RAWTC_LEVELS.map((l, i) => ({
        value: i,
        label: t(l.labelKey),
        color: l.color,
      })),
      textStyle: { fontSize: 10, color: '#4A4A68' },
    },
    series: [
      {
        name: t('heatlens.rawtcMethodology'),
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: true,
          fontSize: 10,
          formatter: (p: { data: [number, number, number] }) => {
            const idx = p.data[2]
            return RAWTC_LEVELS[idx] ? t(RAWTC_LEVELS[idx].labelKey).slice(0, 3) : ''
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
      },
    ],
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('dashboard.riskHeatmap')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: '440px', width: '100%' }} />
        {/* RAWTC Legend */}
        <div className="flex items-center justify-center gap-4 mt-3">
          {RAWTC_LEVELS.map((l) => (
            <div key={l.level} className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ backgroundColor: l.color }}
              />
              <span className="text-xs text-gray-500">{t(l.labelKey)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
