import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import { GlossaryTerm } from '@/components/ui/glossary-term'

interface Phase {
  id: number
  label: string
  status: 'completed' | 'in_progress' | 'pending'
}

const phases: Phase[] = [
  { id: 1, label: 'dashboard.planning', status: 'completed' },
  { id: 2, label: 'dashboard.execution', status: 'in_progress' },
  { id: 3, label: 'dashboard.reporting', status: 'pending' },
]

const overallProgress = 78

const statusStyles: Record<Phase['status'], { bg: string; border: string; text: string; line: string }> = {
  completed: {
    bg: 'bg-status-success',
    border: 'border-status-success',
    text: 'text-status-success',
    line: 'bg-status-success',
  },
  in_progress: {
    bg: 'bg-brand-interactive',
    border: 'border-brand-interactive',
    text: 'text-brand-interactive',
    line: 'bg-gray-200',
  },
  pending: {
    bg: 'bg-gray-200',
    border: 'border-gray-200',
    text: 'text-text-muted',
    line: 'bg-gray-200',
  },
}

export default function AuditStepper() {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            <GlossaryTerm term="di">{t('dashboard.auditPhaseProgress')}</GlossaryTerm>
          </CardTitle>
          <span className="text-sm font-semibold text-brand-primary">{overallProgress}%</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-brand-primary"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between">
          {phases.map((phase, index) => {
            const style = statusStyles[phase.status]
            return (
              <div key={phase.id} className="flex items-center flex-1">
                {/* Step circle + label */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${style.border} ${
                      phase.status === 'pending' ? 'bg-white' : style.bg
                    }`}
                  >
                    {phase.status === 'completed' ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : phase.status === 'in_progress' ? (
                      <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-semibold ${style.text}`}>
                      Phase {phase.id}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">{t(phase.label)}</p>
                  </div>
                </div>

                {/* Connector line */}
                {index < phases.length - 1 && (
                  <div className="flex-1 mx-3 mt-[-20px]">
                    <div className={`h-0.5 ${index < 1 ? 'bg-status-success' : 'bg-gray-200'} rounded-full`} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
