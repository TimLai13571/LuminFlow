import { useState, type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Zap, Play, Loader2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { GlossaryTerm } from '@/components/ui/glossary-term'
import type { ChangeEvent, ChangeEventType } from '@/types/impact'

interface EventConfigProps {
  onSimulate: (config: ChangeEvent) => void
  isSimulating: boolean
}

const eventTypes: { value: ChangeEventType; label: string }[] = [
  { value: 'control_deficiency', label: '控制缺陷（Control Deficiency）' },
  { value: 'organizational_change', label: '组织调整（Organizational Change）' },
  { value: 'regulatory_change', label: '法规变更（Regulatory Change）' },
  { value: 'it_system_change', label: 'IT系统变更（IT System Change）' },
]

const dimensions = [
  { value: 'control_test' as const, label: '财务报表' },
  { value: 'sample_size' as const, label: '运营流程' },
  { value: 'timeline' as const, label: '合规性' },
  { value: 'compliance' as const, label: '声誉' },
]

const strategies = [
  { value: 'accept', label: '接受风险' },
  { value: 'transfer', label: '风险转移' },
  { value: 'enhance', label: '控制增强' },
  { value: 'redesign', label: '流程重设计' },
]

export default function EventConfig({ onSimulate, isSimulating }: EventConfigProps) {
  const { t } = useTranslation()
  const [eventType, setEventType] = useState<ChangeEventType>('control_deficiency')
  const [severity, setSeverity] = useState(5)
  const [selectedDimensions, setSelectedDimensions] = useState<ChangeEvent['affectedDimensions']>(['control_test'])
  const [_strategy, setStrategy] = useState('enhance')

  const eventTypes: { value: ChangeEventType; node: ReactNode }[] = [
    {
      value: 'control_deficiency',
      node: <GlossaryTerm term="deficiency">{t('impact.controlDeficiency')}</GlossaryTerm>,
    },
    { value: 'organizational_change', node: t('impact.orgChange') },
    { value: 'regulatory_change', node: t('impact.regChange') },
    {
      value: 'it_system_change',
      node: <GlossaryTerm term="gitc">{t('impact.itChange')}</GlossaryTerm>,
    },
  ]

  const dimensions = [
    { value: 'control_test' as const, label: t('impact.financialStatements') },
    { value: 'sample_size' as const, label: t('impact.operations') },
    { value: 'timeline' as const, label: t('impact.compliance') },
    { value: 'compliance' as const, label: t('impact.reputation') },
  ]

  const strategies = [
    { value: 'accept', label: t('impact.acceptRisk') },
    { value: 'transfer', label: t('impact.transferRisk') },
    { value: 'enhance', label: t('impact.enhanceControl') },
    { value: 'redesign', label: t('impact.redesignProcess') },
  ]

  const toggleDimension = (dim: ChangeEvent['affectedDimensions'][number]) => {
    setSelectedDimensions((prev) =>
      prev.includes(dim)
        ? prev.filter((d) => d !== dim)
        : [...prev, dim]
    )
  }

  const handleSimulate = () => {
    onSimulate({
      type: eventType,
      severity,
      affectedDimensions: selectedDimensions,
    })
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5" style={{ color: '#1E49E2' }} />
          {t('impact.eventConfig')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Event Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('impact.eventType')}</label>
          <div className="space-y-2">
            {eventTypes.map((et) => (
              <label
                key={et.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="eventType"
                  value={et.value}
                  checked={eventType === et.value}
                  onChange={() => setEventType(et.value)}
                  className="w-4 h-4 accent-[#1E49E2]"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {et.node}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Severity Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{t('impact.severity')}</label>
            <span
              className="text-sm font-bold px-2 py-0.5 rounded"
              style={{
                backgroundColor: severity > 7 ? '#FEE2E2' : severity > 4 ? '#FEF3C7' : '#DCFCE7',
                color: severity > 7 ? '#D32F2F' : severity > 4 ? '#92400E' : '#166534',
              }}
            >
              {severity}/10
            </span>
          </div>
          <Slider
            value={[severity]}
            onValueChange={(v) => setSeverity(v[0])}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{t('impact.low')}</span>
            <span>{t('impact.high')}</span>
          </div>
        </div>

        {/* Affected Dimensions */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('impact.affectedDimensions')}</label>
          <div className="space-y-2">
            {dimensions.map((dim) => (
              <label
                key={dim.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedDimensions.includes(dim.value)}
                  onChange={() => toggleDimension(dim.value)}
                  className="w-4 h-4 rounded accent-[#1E49E2]"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {dim.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Response Strategy */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('impact.responseStrategy')}</label>
          <Select value={_strategy} onValueChange={setStrategy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('impact.selectStrategy')} />
            </SelectTrigger>
            <SelectContent>
              {strategies.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Run Button */}
        <Button
          onClick={handleSimulate}
          disabled={isSimulating || selectedDimensions.length === 0}
          className="w-full h-11 text-white font-medium"
          style={{ backgroundColor: isSimulating ? undefined : '#1E49E2' }}
        >
          {isSimulating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('impact.simulating')}
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              {t('impact.runSimulation')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
