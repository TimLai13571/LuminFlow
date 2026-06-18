import { create } from 'zustand'
import { useLanguageStore } from './language-store'

export type UserRole = 'cfo' | 'auditor' | 'partner' | 'finance_clerk' | 'finance_manager'

interface AuthState {
  currentRole: UserRole
  userName: string
  setRole: (role: UserRole) => void
  setUserName: (name: string) => void
}

const NAMES: Record<string, string> = {
  '张明': 'Zhang Ming',
  '李华': 'Li Hua',
  '王强': 'Wang Qiang',
  '王芳': 'Wang Fang',
  '赵丽': 'Zhao Li',
  '刘伟': 'Liu Wei',
}

export function getLocalizedName(name: string): string {
  const lang = useLanguageStore.getState().language
  if (lang === 'en') return NAMES[name] || name
  return name
}

export const useAuthStore = create<AuthState>((set) => ({
  currentRole: 'auditor',
  userName: '张明',
  setRole: (role) => set({ currentRole: role }),
  setUserName: (name) => set({ userName: name }),
}))
