import ReactECharts from 'echarts-for-react'
import { ExternalLink } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import { GlossaryTerm } from '@/components/ui/glossary-term'
import type { RCMEntry } from '@/types/audit'

interface RiskHeatmapProps {
  rcmData: RCMEntry[]
  onViewFull?: () => void
}

export default function RiskHeatmap({ rcmData, onViewFull }: RiskHeatmapProps) {
  const { t } = useTranslation()
  // Extract unique controls and risks for axes
  const controlNames = [...new Set(rcmData.map((r) => r.controlName))]
  const riskNames = [...new Set(rcmData.map((r) => r.riskName))]

  // Build heatmap data: [xIndex, yIndex, value]
  const heatmapData: [number, number, number][] = []
  rcmData.forEach((entry) => {
    const x = riskNames.indexOf(entry.riskName)
    const y = controlNames.indexOf(entry.controlName)
    if (x !== -1 && y !== -1) {
      heatmapData.push([x, y, entry.rawtc])
    }
  })

  const option = {
    tooltip: {
      trigger: 'item' as const,
      formatter: (params: { data: [number, number, number] }) => {
        const [x, y, value] = params.data
        return `
          <div style="width:200px;padding:4px 0;">
            <div style="font-weight:600;margin-bottom:4px;">${t('heatlens.controlPoint')}: ${controlNames[y]}</div>
            <div style="color:#666;font-size:12px;">${t('heatlens.riskPoint')}: ${riskNames[x]}</div>
            <div style="margin-top:4px;font-size:14px;font-weight:600;color:${
              value >= 7 ? '#D32F2F' : value >= 5 ? '#FF6B00' : '#009A44'
            }">风险值: ${value}</div>
          </div>
        `
      },
    },
    grid: {
      left: '15%',
      right: '10%',
      top: '8%',
      bottom: '20%',
    },
    xAxis: {
      type: 'category' as const,
      name: t('heatlens.riskPoint'),
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { fontSize: 11, color: '#4A4A68', fontWeight: 'bold' },
      data: riskNames.map((name) => name.length > 6 ? name.slice(0, 6) + '...' : name),
      splitArea: { show: true },
      axisLabel: {
        fontSize: 10,
        rotate: 30,
        color: '#4A4A68',
      },
    },
    yAxis: {
      type: 'category' as const,
      name: t('heatlens.controlPoint'),
      nameLocation: 'middle',
      nameGap: 35,
      nameTextStyle: { fontSize: 11, color: '#4A4A68', fontWeight: 'bold' },
      data: controlNames.map((name) => name.length > 6 ? name.slice(0, 6) + '...' : name),
      splitArea: { show: true },
      axisLabel: {
        fontSize: 10,
        color: '#4A4A68',
      },
    },
    visualMap: {
      min: 3,
      max: 9,
      calculable: true,
      orient: 'horizontal' as const,
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#009A44', '#FFD700', '#FF6B00', '#D32F2F'],
      },
      textStyle: {
        fontSize: 10,
        color: '#4A4A68',
      },
    },
    series: [
      {
        name: '风险矩阵',
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: true,
          fontSize: 10,
          color: '#fff',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      },
    ],
  }

  const handleClick = (params: { data: [number, number, number] }) => {
    const [x, y] = params.data
    console.log('Heatmap cell clicked:', {
      control: controlNames[y],
      risk: riskNames[x],
    })
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            <GlossaryTerm term="rcm">{t('dashboard.riskHeatmap')}</GlossaryTerm>
          </CardTitle>
          {onViewFull && (
            <button
              onClick={onViewFull}
              className="flex items-center gap-1 text-xs text-brand-interactive hover:text-brand-primary transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              {t('dashboard.viewFullHeatmap')}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ReactECharts
          option={option}
          style={{ height: '300px', width: '100%' }}
          onEvents={{ click: handleClick }}
        />
      </CardContent>
    </Card>
  )
}
