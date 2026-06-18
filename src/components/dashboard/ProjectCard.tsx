import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { GlossaryTerm } from '@/components/ui/glossary-term'

export default function ProjectCard() {
  const { t } = useTranslation()
  const progress = 78

  // SVG ring progress calculation
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('dashboard.projectOverview')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          {/* SVG Ring Progress */}
          <div className="relative flex-shrink-0">
            <svg width="96" height="96" className="-rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                fill="none"
                stroke="#E8EDF5"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                fill="none"
                stroke="#00338D"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-brand-primary">{progress}%</span>
            </div>
          </div>

          {/* Project details */}
          <div className="flex-1 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary leading-tight">
              {t('dashboard.projectTitle').split('ICFR').map((part, idx, arr) => (
                <span key={idx}>
                  {part}
                  {idx < arr.length - 1 && (
                    <GlossaryTerm term="icfr">ICFR</GlossaryTerm>
                  )}
                </span>
              ))}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Calendar className="h-3.5 w-3.5" />
                <span>{t('dashboard.auditCycle')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Users className="h-3.5 w-3.5" />
                <span>{t('dashboard.teamInfo')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-btn hover:bg-brand-interactive transition-colors">
                    {t('dashboard.viewDetails')}
          <ArrowRight className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  )
}
