import { Bell, AlertCircle, AlertTriangle, CheckCircle, Bot } from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu'
import type { Notification } from '@/types/user'
import { useTranslation } from '@/hooks/useTranslation'

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'pbc_overdue':
      return <AlertCircle className="h-4 w-4 text-status-danger" />
    case 'new_finding':
      return <AlertTriangle className="h-4 w-4 text-status-warning" />
    case 'simulation_complete':
      return <CheckCircle className="h-4 w-4 text-brand-interactive" />
    case 'ai_approval':
      return <Bot className="h-4 w-4 text-accent-gold" />
    default:
      return <Bell className="h-4 w-4 text-gray-400" />
  }
}

function formatTime(timestamp: string, t: (key: string, params?: Record<string, string | number>) => string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 60) return t('notification.minutesAgo', { n: diffMin })
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return t('notification.hoursAgo', { n: diffHours })
  const diffDays = Math.floor(diffHours / 24)
  return t('notification.daysAgo', { n: diffDays })
}

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useUIStore()
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-white/10 transition-colors">
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-status-danger text-[10px] font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[320px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <span className="text-sm font-semibold text-gray-800">{t('notification.title')}</span>
          <button
            onClick={markAllRead}
            className="text-xs text-brand-interactive hover:underline"
          >
            {t('notification.markAllRead')}
          </button>
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.slice(0, 8).map((notification) => (
            <div
              key={notification.id}
              className={`flex gap-3 px-4 py-3 border-b last:border-b-0 transition-colors ${
                notification.read ? 'bg-white' : 'bg-blue-50/50'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {notification.titleKey ? t(notification.titleKey) : notification.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {notification.descriptionKey ? t(notification.descriptionKey) : notification.description}
                </p>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {formatTime(notification.timestamp, t)}
                </span>
              </div>
              {!notification.read && (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-interactive" />
              )}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
