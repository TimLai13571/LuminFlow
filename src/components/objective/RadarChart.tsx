import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/hooks/useTranslation'
import { GlossaryTerm } from '@/components/ui/glossary-term'

export default function RadarChart() {
  const { t } = useTranslation()

  const COSO_DIMENSIONS = [
    t('objective.controlEnvironment'),
    t('objective.riskAssessment'),
    t('objective.controlActivities'),
    t('objective.infoCommunication'),
    t('objective.monitoring'),
  ]

  const radarOption: EChartsOption = {
    tooltip: { trigger: 'item' },
    legend: {
      data: [t('objective.currentPeriod'), t('objective.priorPeriod'), t('objective.industryBenchmark')],
      bottom: 0,
      textStyle: { fontSize: 11, color: '#666' },
    },
    radar: {
      indicator: COSO_DIMENSIONS.map((name) => ({ name, max: 10 })),
      shape: 'polygon',
      splitNumber: 5,
      axisName: { color: '#333', fontSize: 11 },
      splitLine: { lineStyle: { color: '#E8EDF5' } },
      splitArea: { areaStyle: { color: ['#FAFBFC', '#fff'] } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [7.2, 8.0, 7.8, 7.0, 8.0],
            name: t('objective.currentPeriod'),
            lineStyle: { color: '#00338D', width: 2 },
            areaStyle: { color: 'rgba(0, 51, 141, 0.12)' },
            itemStyle: { color: '#00338D' },
          },
          {
            value: [6.5, 7.2, 7.0, 6.8, 7.5],
            name: t('objective.priorPeriod'),
            lineStyle: { color: '#9E9E9E', width: 2, type: 'dashed' },
            areaStyle: { color: 'rgba(158, 158, 158, 0.05)' },
            itemStyle: { color: '#9E9E9E' },
          },
          {
            value: [7.8, 7.5, 8.2, 7.6, 7.8],
            name: t('objective.industryBenchmark'),
            lineStyle: { color: '#009A44', width: 2, type: 'dotted' },
            areaStyle: { color: 'rgba(0, 154, 68, 0.05)' },
            itemStyle: { color: '#009A44' },
          },
        ],
      },
    ],
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">
          <GlossaryTerm term="coso">{t('objective.controlEffectivenessAssessment')}</GlossaryTerm>
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#00338D]">7.6</span>
          <Badge variant="success">{t('objective.good')}</Badge>
        </div>
      </div>
      <ReactECharts
        option={radarOption}
        style={{ height: '260px', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  )
}
