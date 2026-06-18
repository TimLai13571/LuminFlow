import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { AIFloatingButton } from '@/components/ai/AIFloatingButton'
import { AIChatDrawer } from '@/components/ai/AIChatDrawer'
import { useUIStore } from '@/store/ui-store'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="h-full bg-page">
      <TopBar />
      {/* Desktop sidebar - hidden below 768px */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Mobile bottom nav - visible below 768px */}
      <div className="block md:hidden">
        <MobileNav />
      </div>
      <main
        className={cn(
          'pt-14 transition-all duration-300 min-h-full',
          // responsive left padding
          'md:pl-16 lg:pl-16 xl:pl-[280px]',
          // override when sidebar is manually collapsed on xl+
          sidebarCollapsed && 'xl:pl-16',
          // No left padding on mobile
          'pl-0',
          // bottom padding on mobile for nav bar
          'pb-16 md:pb-0'
        )}
      >
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
      <AIFloatingButton />
      <AIChatDrawer />
    </div>
  )
}
