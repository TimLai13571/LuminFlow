import ReactECharts from 'echarts-for-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import type { DocumentCategory } from '@/types/sampling'

interface SunburstChartProps {
  data: DocumentCategory[]
  onCategorySelect: (category: string | null) => void
}

export function SunburstChart({ data, onCategorySelect }: SunburstChartProps) {
  const { t } = useTranslation()
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.percentage,
    itemStyle: { color: item.color },
    children: item.subTypes.map((sub, idx) => ({
      name: sub,
      value: Math.round(item.percentage / item.subTypes.length),
      itemStyle: {
        color: item.color,
        opacity: 0.6 + (idx * 0.15),
      },
    })),
  }))

  const option = {
    tooltip: {
      trigger: 'item' as const,
      formatter: '{b}: {c}%',
    },
    series: [
      {
        type: 'sunburst',
        data: chartData,
        radius: ['20%', '90%'],
        label: {
          fontSize: 11,
          color: '#333',
          overflow: 'truncate' as const,
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: '#fff',
        },
        levels: [
          {},
          {
            r0: '20%',
            r: '55%',
            label: {
              fontSize: 12,
              fontWeight: 'bold' as const,
            },
          },
          {
            r0: '55%',
            r: '90%',
            label: {
              fontSize: 10,
              position: 'outside' as const,
            },
          },
        ],
      },
    ],
  }

  const handleChartClick = (params: { name?: string; data?: { children?: unknown[] } }) => {
    if (params.data && params.data.children) {
      // clicked inner ring (category)
      onCategorySelect(params.name || null)
    } else {
      // clicked outer ring (sub-type) - select parent category
      const parent = data.find((d) => d.subTypes.includes(params.name || ''))
      onCategorySelect(parent?.category || null)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('sampling.docTypeDist')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ReactECharts
          option={option}
          style={{ height: '320px', width: '100%' }}
          onEvents={{ click: handleChartClick }}
        />
        <div className="flex flex-wrap gap-3 mt-2 justify-center">
          {data.map((item) => (
            <button
              key={item.category}
              onClick={() => onCategorySelect(item.category)}
              className="flex items-center gap-1.5 text-xs hover:opacity-75 transition-opacity"
            >
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.category} {item.percentage}%</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
