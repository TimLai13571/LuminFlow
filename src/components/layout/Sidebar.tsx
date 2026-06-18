import { NavLink, useLocation } from 'react-router-dom'
import { useUIStore } from '@/store/ui-store'
import { NAV_GROUPS, type NavItem } from '@/lib/constants'
import { LayoutDashboard, Target, Filter, TrendingUp, Users, Flame, ClipboardList, FileText, PanelLeftClose, PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/store/auth-store'
import { hasPermission, type Permission } from '@/lib/permissions'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Target,
  Filter,
  TrendingUp,
  Users,
  Flame,
  ClipboardList,
  FileText,
}

// Map route paths to required permissions
const ROUTE_PERMISSION: Record<string, Permission> = {
  '/': 'view_dashboard',
  '/tracemap': 'view_objectives',
  '/objective': 'view_objectives',
  '/heatlens': 'view_heatlens',
  '/sampling': 'view_sampling',
  '/pbcview': 'view_pbcview',
  '/narrative': 'view_narrative',
  '/impact': 'view_impact',
  '/team': 'view_team',
}

function NavItemLink({ item }: { item: NavItem }) {
  const { t } = useTranslation()
  const { sidebarCollapsed } = useUIStore()
  const Icon = iconMap[item.icon] || LayoutDashboard

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors mb-0.5',
          isActive
            ? 'bg-brand-light text-brand-primary'
            : 'text-gray-600 hover:bg-gray-50 hover:text-text-primary'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-brand-primary" />
          )}
          <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-brand-primary' : 'text-gray-400')} />
          <span className={cn('hidden truncate', !sidebarCollapsed && 'xl:inline')}>
            {t(item.labelKey)}
          </span>
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { t } = useTranslation()
  const currentRole = useAuthStore((s) => s.currentRole)
  const location = useLocation()

  // Filter nav groups by role permissions
  const visibleGroups = NAV_GROUPS.map((group) => {
    const filteredItems = group.items.filter((item) => {
      const requiredPermission = ROUTE_PERMISSION[item.path]
      if (!requiredPermission) return true
      return hasPermission(currentRole, requiredPermission)
    })
    return { ...group, items: filteredItems }
  }).filter((group) => group.items.length > 0)

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 bottom-0 z-30 flex flex-col border-r border-gray-200 bg-white transition-all duration-300',
        'w-16 xl:w-[280px]',
        sidebarCollapsed && 'xl:w-16'
      )}
    >
      {/* Project Overview Card */}
      <div className={cn('mx-4 mt-4 rounded-card border border-gray-100 bg-page p-3', 'hidden', !sidebarCollapsed && 'xl:block')}>
        <div className="text-sm font-medium text-text-primary">{t('sidebar.projectName')}</div>
        <div className="mt-1 text-xs text-gray-500">{t('sidebar.companyName')}</div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full w-[65%] rounded-full bg-brand-interactive" />
          </div>
          <span className="text-xs font-medium text-brand-interactive">65%</span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 mt-4 px-2 overflow-y-auto">
        {visibleGroups.map((group, groupIdx) => (
          <div key={group.id} className={cn(groupIdx > 0 && 'mt-3 pt-3 border-t border-gray-100')}>
            {/* Group header - only show on xl when not collapsed */}
            <div className={cn(
              'mb-1 px-3',
              'hidden',
              !sidebarCollapsed && 'xl:block'
            )}>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {t(group.labelKey)}
              </span>
            </div>
            {group.items.map((item) => (
              <NavItemLink key={item.path} item={item} />
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse Button */}
      <div className="hidden xl:block border-t border-gray-100 p-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-btn py-2 text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span>{t('sidebar.collapse')}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
