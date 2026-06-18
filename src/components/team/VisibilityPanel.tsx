import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'
import { useTranslation } from '@/hooks/useTranslation'
import { GlossaryTerm } from '@/components/ui/glossary-term'
import type { VisibilityConfig, VisibilityLevel, UserRole } from '@/types/user'
import PublishDialog from './PublishDialog'

const ALL_ROLES: { role: UserRole; labelKey: string }[] = [
  { role: 'cfo', labelKey: 'role.cfo' },
  { role: 'finance_manager', labelKey: 'role.financeManager' },
  { role: 'finance_clerk', labelKey: 'role.financeClerk' },
  { role: 'partner', labelKey: 'role.partner' },
]

const MODULES = [
  { module: 'team.moduleProgress', label: '审计进度概览' },
  { module: 'team.moduleControl', label: '控制点测试状态' },
  { module: 'team.moduleDeficiency', label: '缺陷详情' },
  { module: 'team.moduleSampling', label: '抽样逻辑' },
  { module: 'team.moduleImpact', label: '影响分析' },
  { module: 'team.moduleAI', label: 'AI 洞察建议' },
]

const INITIAL_CONFIGS: Record<UserRole, VisibilityConfig[]> = {
  cfo: [
    { module: 'team.moduleProgress', level: 'full', isDraft: false, pageLevel: 'full', moduleLevel: 'full' },
    { module: 'team.moduleControl', level: 'partial', isDraft: false, pageLevel: 'partial', moduleLevel: 'partial' },
    { module: 'team.moduleDeficiency', level: 'hidden', isDraft: false, pageLevel: 'hidden', moduleLevel: 'hidden' },
    { module: 'team.moduleSampling', level: 'hidden', isDraft: false, pageLevel: 'hidden', moduleLevel: 'hidden' },
    { module: 'team.moduleImpact', level: 'partial', isDraft: false, pageLevel: 'partial', moduleLevel: 'hidden' },
    { module: 'team.moduleAI', level: 'partial', isDraft: false, pageLevel: 'partial', moduleLevel: 'partial' },
  ],
  finance_manager: [
    { module: 'team.moduleProgress', level: 'full', isDraft: false, pageLevel: 'full', moduleLevel: 'full' },
    { module: 'team.moduleControl', level: 'partial', isDraft: false, pageLevel: 'partial', moduleLevel: 'partial' },
    { module: 'team.moduleDeficiency', level: 'partial', isDraft: false, pageLevel: 'partial', moduleLevel: 'partial' },
    { module: 'team.moduleSampling', level: 'hidden', isDraft: false, pageLevel: 'hidden', moduleLevel: 'hidden' },
    { module: 'team.moduleImpact', level: 'partial', isDraft: false, pageLevel: 'partial', moduleLevel: 'partial' },
    { module: 'team.moduleAI', level: 'full', isDraft: false, pageLevel: 'full', moduleLevel: 'full' },
  ],
  finance_clerk: [
    { module: 'team.moduleProgress', level: 'partial', isDraft: false, pageLevel: 'partial', moduleLevel: 'partial' },
    { module: 'team.moduleControl', level: 'hidden', isDraft: false, pageLevel: 'hidden', moduleLevel: 'hidden' },
    { module: 'team.moduleDeficiency', level: 'hidden', isDraft: false, pageLevel: 'hidden', moduleLevel: 'hidden' },
    { module: 'team.moduleSampling', level: 'hidden', isDraft: false, pageLevel: 'hidden', moduleLevel: 'hidden' },
    { module: 'team.moduleImpact', level: 'hidden', isDraft: false, pageLevel: 'hidden', moduleLevel: 'hidden' },
    { module: 'team.moduleAI', level: 'hidden', isDraft: false, pageLevel: 'hidden', moduleLevel: 'hidden' },
  ],
  partner: [
    { module: 'team.moduleProgress', level: 'full', isDraft: false, pageLevel: 'full', moduleLevel: 'full' },
    { module: 'team.moduleControl', level: 'full', isDraft: false, pageLevel: 'full', moduleLevel: 'full' },
    { module: 'team.moduleDeficiency', level: 'full', isDraft: false, pageLevel: 'full', moduleLevel: 'full' },
    { module: 'team.moduleSampling', level: 'full', isDraft: false, pageLevel: 'full', moduleLevel: 'full' },
    { module: 'team.moduleImpact', level: 'full', isDraft: false, pageLevel: 'full', moduleLevel: 'full' },
    { module: 'team.moduleAI', level: 'full', isDraft: false, pageLevel: 'full', moduleLevel: 'full' },
  ],
  auditor: [
    { module: 'team.moduleProgress', level: 'full', isDraft: false, pageLevel: 'full', moduleLevel: 'full' },
    { module: 'team.moduleControl', level: 'full', isDraft: false, pageLevel: 'full', moduleLevel: 'full' },
    { module: 'team.moduleDeficiency', level: 'full', isDraft: false, pageLevel: 'full', moduleLevel: 'full' },
    { module: 'team.moduleSampling', level: 'full', isDraft: false, pageLevel: 'full', moduleLevel: 'full' },
    { module: 'team.moduleImpact', level: 'full', isDraft: false, pageLevel: 'full', moduleLevel: 'full' },
    { module: 'team.moduleAI', level: 'full', isDraft: false, pageLevel: 'full', moduleLevel: 'full' },
  ],
}

const LEVEL_LABELS: Record<VisibilityLevel, string> = {
  full: 'team.fullVisible',
  partial: 'team.partialVisible',
  hidden: 'team.hidden',
}

const LEVEL_BADGE_VARIANT: Record<VisibilityLevel, 'success' | 'warning' | 'danger'> = {
  full: 'success',
  partial: 'warning',
  hidden: 'danger',
}

export default function VisibilityPanel() {
  const { currentRole } = useAuthStore()
  const { t } = useTranslation()
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole === 'cfo' ? 'cfo' : currentRole === 'finance_clerk' ? 'finance_clerk' : currentRole === 'finance_manager' ? 'finance_manager' : currentRole === 'partner' ? 'partner' : 'auditor')
  const [allConfigs, setAllConfigs] = useState<Record<UserRole, VisibilityConfig[]>>(INITIAL_CONFIGS)
  const [publishOpen, setPublishOpen] = useState(false)

  const isEditable = currentRole === 'auditor'
  const configs = allConfigs[selectedRole] || []
  const hasDraft = configs.some((c) => c.isDraft)

  const handleToggle = useCallback((index: number) => {
    setAllConfigs((prev) => ({
      ...prev,
      [selectedRole]: prev[selectedRole].map((c, i) => {
        if (i !== index) return c
        const nextLevel: VisibilityLevel =
          c.level === 'full' ? 'partial' : c.level === 'partial' ? 'hidden' : 'full'
        return { ...c, level: nextLevel, pageLevel: nextLevel, moduleLevel: nextLevel, isDraft: true }
      }),
    }))
  }, [selectedRole])

  const getChanges = (): string[] => {
    return configs
      .filter((c) => c.isDraft)
      .map((c) => `「${t(c.module)}」→ ${t(LEVEL_LABELS[c.level])}`)
  }

  const handlePublish = () => {
    console.log('[API] 发布可见性配置:', selectedRole, configs)
    setAllConfigs((prev) => ({
      ...prev,
      [selectedRole]: prev[selectedRole].map((c) => ({ ...c, isDraft: false })),
    }))
    setPublishOpen(false)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card className={hasDraft ? 'border-dashed border-[#FF6B00]' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>{t('team.visibilityMgmt')}</CardTitle>
              <Badge variant="secondary">v3</Badge>
            </div>
            {hasDraft && (
              <Badge variant="warning">{t('team.pendingPublish')}</Badge>
            )}
          </div>
          {/* Role Selector */}
          <div className="mt-3">
            <label className="text-[11px] font-medium text-gray-400 block mb-1.5">
              {t('team.visibilityForRole')}:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ROLES.map(({ role, labelKey }) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                    selectedRole === role
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configs.map((config, idx) => (
              <div
                key={config.module}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={config.level !== 'hidden'}
                    onCheckedChange={() => handleToggle(idx)}
                    disabled={!isEditable}
                  />
                  <span className="text-sm font-medium text-text-primary">
                    {config.module === 'team.moduleSampling' ? (
                      <GlossaryTerm term="mus">{t(config.module)}</GlossaryTerm>
                    ) : (
                      t(config.module)
                    )}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400">{t('team.pageLevel')}:</span>
                    <Badge variant={LEVEL_BADGE_VARIANT[config.pageLevel || config.level]} className="text-[10px] px-1.5 py-0">
                      {t(LEVEL_LABELS[config.pageLevel || config.level])}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400">{t('team.moduleLevel')}:</span>
                    <Badge variant={LEVEL_BADGE_VARIANT[config.moduleLevel || config.level]} className="text-[10px] px-1.5 py-0">
                      {t(LEVEL_LABELS[config.moduleLevel || config.level])}
                    </Badge>
                  </div>
                </div>
                <Badge variant={LEVEL_BADGE_VARIANT[config.level]}>
                  {t(LEVEL_LABELS[config.level])}
                </Badge>
              </div>
            ))}
          </div>

          {isEditable && (
            <div className="mt-6">
              <Button
                onClick={() => setPublishOpen(true)}
                disabled={!hasDraft}
                className="w-full"
              >
                {t('team.batchPublish')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <PublishDialog
        open={publishOpen}
        onConfirm={handlePublish}
        onCancel={() => setPublishOpen(false)}
        changes={getChanges()}
      />
    </motion.div>
  )
}
