import ReactECharts from 'echarts-for-react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'

const HOT_QUESTIONS = [
  { questionKey: 'team.question.1', count: 28 },
  { questionKey: 'team.question.2', count: 23 },
  { questionKey: 'team.question.3', count: 19 },
  { questionKey: 'team.question.4', count: 15 },
  { questionKey: 'team.question.5', count: 12 },
]

export default function HotQuestionsBar() {
  const { t } = useTranslation()
  const option = {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
    },
    grid: {
      left: '3%',
      right: '12%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value' as const,
      name: t('team.questionCount'),
      nameTextStyle: { fontSize: 11 },
    },
    yAxis: {
      type: 'category' as const,
      data: [...HOT_QUESTIONS].reverse().map((q) => t(q.questionKey)),
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        name: t('team.questionCount'),
        type: 'bar',
        data: [...HOT_QUESTIONS].reverse().map((q) => q.count),
        barWidth: '50%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#00338D' },
              { offset: 1, color: '#1E49E2' },
            ],
          },
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: 'right' as const,
          formatter: t('team.timesLabel'),
          fontSize: 11,
          color: '#333',
        },
      },
    ],
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }}>
      <Card>
        <CardHeader>
          <CardTitle>{t('team.hotQuestions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={option} style={{ height: 250 }} />
        </CardContent>
      </Card>
    </motion.div>
  )
}
