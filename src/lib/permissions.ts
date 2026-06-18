import type { UserRole } from '@/store/auth-store'

export type Permission =
  | 'view_dashboard'
  | 'view_objectives'
  | 'edit_objectives'
  | 'view_sampling'
  | 'edit_sampling'
  | 'view_impact'
  | 'edit_impact'
  | 'publish_impact'
  | 'view_team'
  | 'edit_team'
  | 'ai_approve'
  | 'quality_review'
  | 'visibility_manage'
  | 'view_pbc_progress'
  | 'approve_department'
  | 'view_project_progress'
  | 'view_heatlens'
  | 'view_pbcview'
  | 'edit_pbcview'
  | 'view_narrative'
  | 'edit_narrative'
  | 'approve_narrative'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  cfo: [
    'view_dashboard',
    'view_objectives',
    'view_sampling',
    'view_impact',
    'view_pbcview',
    'view_narrative',
  ],
  auditor: [
    'view_dashboard',
    'view_objectives',
    'edit_objectives',
    'view_sampling',
    'edit_sampling',
    'view_impact',
    'edit_impact',
    'publish_impact',
    'view_team',
    'edit_team',
    'ai_approve',
    'visibility_manage',
    'view_heatlens',
    'view_pbcview',
    'edit_pbcview',
    'view_narrative',
    'edit_narrative',
  ],
  partner: [
    'view_dashboard',
    'view_objectives',
    'view_sampling',
    'view_impact',
    'view_team',
    'quality_review',
    'view_heatlens',
    'view_pbcview',
    'view_narrative',
    'approve_narrative',
  ],
  finance_clerk: [
    'view_dashboard',
    'view_pbc_progress',
    'view_pbcview',
  ],
  finance_manager: [
    'view_dashboard',
    'view_objectives',
    'view_sampling',
    'view_pbc_progress',
    'approve_department',
    'view_project_progress',
    'view_pbcview',
    'view_narrative',
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

export { ROLE_PERMISSIONS }
