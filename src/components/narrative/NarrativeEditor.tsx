import { Edit3, Save } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import type { NarrativeSegment } from '@/types/narrative'

interface NarrativeEditorProps {
  editableNarrative: NarrativeSegment[]
  isDraft: boolean
  onUpdateSegment: (index: number, content: string) => void
  onSaveDraft: () => void
}

const SEGMENT_LABELS: Record<string, string> = {
  fact: 'FACT',
  judgment: 'JUDGMENT',
  suggestion: 'SUGGESTION',
}

const SEGMENT_COLORS: Record<string, string> = {
  fact: 'border-blue-300 focus:ring-blue-500/30',
  judgment: 'border-amber-300 focus:ring-amber-500/30',
  suggestion: 'border-green-300 focus:ring-green-500/30',
}

export default function NarrativeEditor({
  editableNarrative,
  isDraft,
  onUpdateSegment,
  onSaveDraft,
}: NarrativeEditorProps) {
  const { t } = useTranslation()

  if (editableNarrative.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-brand-primary" />
            {t('narrative.edit')}
          </CardTitle>
          <button
            onClick={onSaveDraft}
            className="flex items-center gap-1.5 rounded-btn border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Save className="h-3 w-3" />
            {isDraft ? '✓ Draft Saved' : t('narrative.saveDraft')}
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {editableNarrative.map((segment, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  segment.type === 'fact'
                    ? 'bg-blue-100 text-blue-700'
                    : segment.type === 'judgment'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {SEGMENT_LABELS[segment.type]}
              </span>
              <span className="text-xs text-gray-400">Section {idx + 1}</span>
            </div>
            <textarea
              value={segment.content}
              onChange={(e) => onUpdateSegment(idx, e.target.value)}
              rows={5}
              className={`w-full rounded-lg border-2 ${SEGMENT_COLORS[segment.type]} px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-y`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
