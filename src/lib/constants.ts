import type { UserRole } from '@/store/auth-store'
import type { Permission } from './permissions'

// Status Colors
export const STATUS_COLORS = {
  success: '#009A44',
  warning: '#FF6B00',
  danger: '#D32F2F',
  pending: '#757575',
} as const

// Brand Colors
export const BRAND_COLORS = {
  primary: '#00338D',
  interactive: '#1E49E2',
  light: '#E8EDF5',
} as const

// Framer Motion Animation Variants
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  slideInRight: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  slideInLeft: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  slideInUp: {
    initial: { y: 10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 10, opacity: 0 },
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.2 },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  staggerItem: {
    initial: { y: 10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  },
} as const

// Role Labels (Chinese)
export const ROLE_LABELS: Record<UserRole, string> = {
  cfo: 'CFO (客户管理层)',
  auditor: '审计经理',
  partner: '合伙人 (QC)',
  finance_clerk: '财务部经办人',
  finance_manager: '财务部负责人',
} as const

// Navigation item interface
export interface NavItem {
  path: string
  label: string
  labelKey: string
  icon: string
  requiredPermission: Permission
}

// Navigation group interface
export interface NavGroup {
  id: string
  label: string
  labelKey: string
  phaseKey?: 'planning' | 'execution' | 'deficiency'
  items: NavItem[]
}

// Navigation groups (三阶段工作流 + 独立工具)
export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'portal',
    label: '门户',
    labelKey: 'nav.section.portal',
    items: [
      { path: '/', label: '门户首页', labelKey: 'nav.dashboard', icon: 'LayoutDashboard', requiredPermission: 'view_dashboard' },
    ],
  },
  {
    id: 'planning',
    label: '第一阶段：审计计划',
    labelKey: 'nav.section.planning',
    phaseKey: 'planning',
    items: [
      { path: '/tracemap', label: 'TraceMap', labelKey: 'nav.tracemap', icon: 'Target', requiredPermission: 'view_objectives' },
      { path: '/heatlens', label: 'HeatLens', labelKey: 'nav.heatlens', icon: 'Flame', requiredPermission: 'view_heatlens' },
    ],
  },
  {
    id: 'execution',
    label: '第二阶段：审计实施',
    labelKey: 'nav.section.execution',
    phaseKey: 'execution',
    items: [
      { path: '/sampling', label: 'SampleLens', labelKey: 'nav.sampling', icon: 'Filter', requiredPermission: 'view_sampling' },
      { path: '/pbcview', label: 'PBCView', labelKey: 'nav.pbcview', icon: 'ClipboardList', requiredPermission: 'view_pbcview' },
    ],
  },
  {
    id: 'deficiency',
    label: '第三阶段：评估与沟通',
    labelKey: 'nav.section.deficiency',
    phaseKey: 'deficiency',
    items: [
      { path: '/narrative', label: 'NarrativeLens', labelKey: 'nav.narrative', icon: 'FileText', requiredPermission: 'view_narrative' },
      { path: '/impact', label: 'ImpactSimulator', labelKey: 'nav.impact', icon: 'TrendingUp', requiredPermission: 'view_impact' },
    ],
  },
  {
    id: 'tools',
    label: '独立工具',
    labelKey: 'nav.section.tools',
    items: [
      { path: '/team', label: 'TeamPanel', labelKey: 'nav.team', icon: 'Users', requiredPermission: 'view_team' },
    ],
  },
] as const

// Legacy flat nav (kept for backward compatibility with mobile nav)
export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items)
