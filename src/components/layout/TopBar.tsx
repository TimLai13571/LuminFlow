import { Sparkles } from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { RoleSwitcher } from './RoleSwitcher'
import { NotificationBell } from './NotificationBell'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useLocation } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { NAV_GROUPS } from '@/lib/constants'

export function TopBar() {
  const { toggleAIDrawer } = useUIStore()
  const location = useLocation()
  const { t } = useTranslation()

  // Find current nav group for breadcrumb
  const currentGroup = NAV_GROUPS.find((g) => g.items.some((item) => item.path === location.pathname))
  const currentItem = currentGroup?.items.find((item) => item.path === location.pathname)

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between bg-brand-primary px-4">
      {/* Left side: Logo + Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-xl tracking-wide">{t('app.brand')}</span>
        </div>
        {currentGroup && currentGroup.id !== 'portal' && (
          <div className="flex items-center gap-1.5 text-white/70 text-sm">
            <span>/</span>
            <span className="text-white/60">{t(currentGroup.labelKey)}</span>
          </div>
        )}
        {currentItem && currentGroup?.id !== 'portal' && (
          <div className="flex items-center gap-1.5 text-white/70 text-sm">
            <span>/</span>
            <span className="text-white/90">{t(currentItem.labelKey)}</span>
          </div>
        )}
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notification Bell */}
        <NotificationBell />

        {/* AI Assistant */}
        <button
          onClick={toggleAIDrawer}
          className="flex items-center gap-1.5 rounded-btn bg-white/10 px-3 py-1.5 text-sm text-white/90 hover:bg-white/20 transition-colors"
        >
          <Sparkles className="h-4 w-4 text-accent-gold" />
          <span>{t('topbar.aiAssistant')}</span>
        </button>

        {/* Role Switcher */}
        <RoleSwitcher />
      </div>
    </header>
  )
}
