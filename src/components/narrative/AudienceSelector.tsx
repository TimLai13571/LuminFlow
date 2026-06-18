import { Users, Building2, Monitor } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import type { NarrativeAudience } from '@/types/narrative'

interface AudienceSelectorProps {
  audience: NarrativeAudience
  onChange: (audience: NarrativeAudience) => void
}

const AUDIENCES: { key: NarrativeAudience; labelKey: string; icon: React.ComponentType<{ className?: string }>; descKey: string }[] = [
  { key: 'CFO', labelKey: 'narrative.audienceCFO', icon: Building2, descKey: 'narrative.audienceDescCFO' },
  { key: 'internal_audit', labelKey: 'narrative.audienceInternalAudit', icon: Users, descKey: 'narrative.audienceDescInternalAudit' },
  { key: 'IT', labelKey: 'narrative.audienceIT', icon: Monitor, descKey: 'narrative.audienceDescIT' },
]

export default function AudienceSelector({ audience, onChange }: AudienceSelectorProps) {
  const { t } = useTranslation()

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-3">{t('narrative.audience')}</p>
      <div className="space-y-2">
        {AUDIENCES.map((a) => {
          const Icon = a.icon
          const isActive = audience === a.key
          return (
            <button
              key={a.key}
              onClick={() => onChange(a.key)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isActive
                  ? 'border-brand-primary bg-brand-light/50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className={`text-sm font-medium ${isActive ? 'text-brand-primary' : 'text-text-primary'}`}>
                  {t(a.labelKey)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{t(a.descKey)}</p>
              </div>
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-brand-primary" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
