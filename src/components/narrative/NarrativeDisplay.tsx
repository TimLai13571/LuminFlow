import { Lightbulb } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import type { NarrativeSegment } from '@/types/narrative'

interface NarrativeDisplayProps {
  narrative: NarrativeSegment[]
  keyPoints: string[]
}

const SEGMENT_STYLES = {
  fact: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50/50',
    label: 'narrative.factLabel',
    labelColor: 'text-blue-700 bg-blue-100',
  },
  judgment: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50/50',
    label: 'narrative.judgmentLabel',
    labelColor: 'text-amber-700 bg-amber-100',
  },
  suggestion: {
    border: 'border-l-green-500',
    bg: 'bg-green-50/50',
    label: 'narrative.suggestionLabel',
    labelColor: 'text-green-700 bg-green-100',
  },
}

export default function NarrativeDisplay({ narrative, keyPoints }: NarrativeDisplayProps) {
  const { t } = useTranslation()

  if (narrative.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="py-16 text-center">
          <Lightbulb className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">{t('narrative.placeholder')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('narrative.keyPoints')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Points */}
        {keyPoints.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {keyPoints.map((point, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-light text-xs text-brand-primary"
              >
                <span className="text-[10px]">●</span>
                {point}
              </span>
            ))}
          </div>
        )}

        {/* Narrative Segments */}
        <div className="space-y-4">
          {narrative.map((segment, idx) => {
            const style = SEGMENT_STYLES[segment.type]
            return (
              <div
                key={idx}
                className={`border-l-4 ${style.border} ${style.bg} rounded-r-lg p-4`}
              >
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase mb-2 ${style.labelColor}`}
                >
                  {t(style.label)}
                </span>
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                  {segment.content}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
