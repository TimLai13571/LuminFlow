import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Target, Filter, FileText, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_GROUPS } from '@/lib/constants'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/store/auth-store'
import { hasPermission } from '@/lib/permissions'

const ROUTE_PERMISSION: Record<string, string> = {
  '/': 'view_dashboard',
  '/tracemap': 'view_objectives',
  '/sampling': 'view_sampling',
  '/narrative': 'view_narrative',
  '/team': 'view_team',
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Target, Filter, FileText, Users,
}

// Mobile: 5 core entries (Portal, TraceMap, SampleLens, NarrativeLens, TeamPanel)
const mobilePaths = ['/', '/tracemap', '/sampling', '/narrative', '/team']

export function MobileNav() {
  const { t } = useTranslation()
  const currentRole = useAuthStore((s) => s.currentRole)

  // Build mobile nav items from NAV_GROUPS with permission filtering
  const allItems = NAV_GROUPS.flatMap((g) => g.items)
  const visibleItems = allItems.filter((item) => {
    const perm = ROUTE_PERMISSION[item.path] as import('@/lib/permissions').Permission | undefined
    if (!perm) return false
    return hasPermission(currentRole, perm) && mobilePaths.includes(item.path)
  })

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-gray-200 bg-white">
      {visibleItems.map((item) => {
        const Icon = iconMap[item.icon] || LayoutDashboard
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors',
                isActive ? 'text-brand-primary' : 'text-gray-400'
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
