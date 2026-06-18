import { create } from 'zustand'
import type { Notification } from '@/types/user'

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'pbc_overdue', titleKey: 'notification.pbc_overdue', descriptionKey: 'notification.desc.1', title: 'PBC 材料逾期', description: '银行对账单（3月）已逾期3天未提交', timestamp: '2026-06-16T09:00:00Z', read: false },
  { id: '2', type: 'new_finding', titleKey: 'notification.new_finding', descriptionKey: 'notification.desc.2', title: '新缺陷发现', description: '应收账款科目发现异常波动，需进一步审查', timestamp: '2026-06-16T08:30:00Z', read: false },
  { id: '3', type: 'simulation_complete', titleKey: 'notification.simulation_complete', descriptionKey: 'notification.desc.3', title: '影响模拟完成', description: '收入确认控制失效模拟已完成，结果可查看', timestamp: '2026-06-15T17:00:00Z', read: false },
  { id: '4', type: 'ai_approval', titleKey: 'notification.ai_approval', descriptionKey: 'notification.desc.4', title: 'AI 内容待审批', description: '抽样逻辑说明草稿已生成，等待合伙人审批', timestamp: '2026-06-15T15:20:00Z', read: false },
  { id: '5', type: 'pbc_overdue', titleKey: 'notification.pbc_overdue', descriptionKey: 'notification.desc.5', title: 'PBC 材料逾期', description: '固定资产台账（Q1）逾期5天', timestamp: '2026-06-15T10:00:00Z', read: true },
  { id: '6', type: 'new_finding', titleKey: 'notification.new_finding', descriptionKey: 'notification.desc.6', title: '新缺陷发现', description: '采购审批流程中发现职责分离不足', timestamp: '2026-06-14T14:00:00Z', read: true },
  { id: '7', type: 'simulation_complete', titleKey: 'notification.simulation_complete', descriptionKey: 'notification.desc.7', title: '模拟运行完成', description: '库存计价错误影响模拟已输出报告', timestamp: '2026-06-14T11:30:00Z', read: true },
]

interface UIState {
  sidebarCollapsed: boolean
  aiDrawerOpen: boolean
  notifications: Notification[]
  unreadCount: number
  toggleSidebar: () => void
  toggleAIDrawer: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setAIDrawerOpen: (open: boolean) => void
  markAllRead: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  aiDrawerOpen: false,
  notifications: INITIAL_NOTIFICATIONS,
  unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.read).length,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleAIDrawer: () => set((state) => ({ aiDrawerOpen: !state.aiDrawerOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setAIDrawerOpen: (open) => set({ aiDrawerOpen: open }),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}))
