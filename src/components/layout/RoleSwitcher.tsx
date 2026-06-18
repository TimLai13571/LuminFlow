import { useAuthStore, getLocalizedName, type UserRole } from '@/store/auth-store'
import { ChevronDown, UserCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from '@/hooks/useTranslation'

const auditTeamRoles: UserRole[] = ['auditor', 'partner']
const clientRoles: UserRole[] = ['cfo', 'finance_manager', 'finance_clerk']

const ROLE_KEYS: Record<UserRole, string> = {
  cfo: 'role.cfo',
  auditor: 'role.auditor',
  partner: 'role.partner',
  finance_clerk: 'role.financeClerk',
  finance_manager: 'role.financeManager',
}

export function RoleSwitcher() {
  const { currentRole, userName, setRole } = useAuthStore()
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-btn px-2 py-1.5 hover:bg-white/10 transition-colors">
        <UserCircle className="h-7 w-7 text-white/90" />
        <div className="flex flex-col items-start">
          <span className="text-xs text-white/90 font-medium">{getLocalizedName(userName)}</span>
          <span className="text-[10px] text-white/60">{t(ROLE_KEYS[currentRole])}</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-white/60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{t('role.switch')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-gray-400 font-normal">{t('role.groupAudit')}</DropdownMenuLabel>
        {auditTeamRoles.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => setRole(role)}
            className={currentRole === role ? 'bg-brand-light text-brand-primary' : ''}
          >
            <span className="flex-1">{t(ROLE_KEYS[role])}</span>
            {currentRole === role && (
              <span className="ml-2 h-1.5 w-1.5 rounded-full bg-brand-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-gray-400 font-normal">{t('role.groupClient')}</DropdownMenuLabel>
        {clientRoles.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => setRole(role)}
            className={currentRole === role ? 'bg-brand-light text-brand-primary' : ''}
          >
            <span className="flex-1">{t(ROLE_KEYS[role])}</span>
            {currentRole === role && (
              <span className="ml-2 h-1.5 w-1.5 rounded-full bg-brand-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
