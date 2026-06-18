import ReactECharts from 'echarts-for-react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'

function generateDates(days: number): string[] {
  const dates: string[] = []
  const now = new Date(2026, 5, 16) // 2026-06-16
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }
  return dates
}

function generateVisits(days: number): number[] {
  const base = [5, 3, 8, 12, 7, 4, 6, 15, 9, 11, 3, 7, 20, 14, 8, 5, 10, 18, 6, 9, 4, 13, 22, 8, 11, 7, 16, 12, 9, 14]
  return base.slice(0, days)
}

const EVENT_MARKS = [
  { xAxis: '5/25', nameKey: 'team.submitPBC' },
  { xAxis: '6/3', nameKey: 'team.viewReport' },
  { xAxis: '6/10', nameKey: 'team.downloadWP' },
  { xAxis: '6/14', nameKey: 'team.giveFeedback' },
]

export default function InteractionChart() {
  const { t } = useTranslation()
  const dates = generateDates(30)
  const visits = generateVisits(30)

  const option = {
    tooltip: {
      trigger: 'axis' as const,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category' as const,
      boundaryGap: false,
      data: dates,
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'value' as const,
      name: t('team.visits'),
      nameTextStyle: { fontSize: 11 },
    },
    series: [
      {
        name: t('team.clientVisits'),
        type: 'line',
        smooth: true,
        data: visits,
        lineStyle: { color: '#00338D', width: 2 },
        itemStyle: { color: '#00338D' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,51,141,0.15)' },
              { offset: 1, color: 'rgba(0,51,141,0)' },
            ],
          },
        },
        markPoint: {
          symbol: 'diamond',
          symbolSize: 12,
          label: { show: true, fontSize: 10, position: 'top' },
          data: EVENT_MARKS.map((e) => ({
            name: t(e.nameKey),
            xAxis: e.xAxis,
            yAxis: visits[dates.indexOf(e.xAxis)] || 10,
            value: t(e.nameKey),
          })).filter((e) => dates.includes(e.xAxis)),
        },
      },
    ],
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card>
        <CardHeader>
          <CardTitle>{t('team.clientTrend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={option} style={{ height: 250 }} />
        </CardContent>
      </Card>
    </motion.div>
  )
}
