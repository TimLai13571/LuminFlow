import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { ANIMATION_VARIANTS } from '@/lib/constants'
import { useAuthStore } from '@/store/auth-store'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import VisibilityPanel from '@/components/team/VisibilityPanel'
import ApprovalQueue from '@/components/team/ApprovalQueue'
import InteractionChart from '@/components/team/InteractionChart'
import HotQuestionsBar from '@/components/team/HotQuestionsBar'
import ApiManager from '@/components/team/ApiManager'
import { useTranslation } from '@/hooks/useTranslation'

export default function TeamPanelPage() {
  const { currentRole } = useAuthStore()
  const { t } = useTranslation()

  // CFO 仅显示客户互动统计
  const defaultTab = currentRole === 'cfo' ? 'interaction' : 'visibility'
  const [activeTab, setActiveTab] = useState(defaultTab)

  const roleBadgeVariant = currentRole === 'cfo' ? 'warning' : currentRole === 'partner' ? 'secondary' : 'default'

  return (
    <motion.div {...ANIMATION_VARIANTS.fadeIn}>
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-7 w-7 text-brand-primary" />
        <h1 className="text-2xl font-bold text-text-primary">{t('team.title')}</h1>
        <Badge variant={roleBadgeVariant}>{t(`role.${currentRole}`)}</Badge>
      </div>

      {/* Tabs 布局 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {currentRole !== 'cfo' && (
            <TabsTrigger value="visibility">{t('team.visibility')}</TabsTrigger>
          )}
          {currentRole !== 'cfo' && (
            <TabsTrigger value="approval">{t('team.approval')}</TabsTrigger>
          )}
          <TabsTrigger value="interaction">{t('team.interaction')}</TabsTrigger>
          {currentRole !== 'cfo' && (
            <TabsTrigger value="api">{t('team.apiManagement')}</TabsTrigger>
          )}
        </TabsList>

        {/* Tab 1: 可见性管理 */}
        {currentRole !== 'cfo' && (
          <TabsContent value="visibility">
            <div className="mt-4">
              <VisibilityPanel />
            </div>
          </TabsContent>
        )}

        {/* Tab 2: AI 审批 */}
        {currentRole !== 'cfo' && (
          <TabsContent value="approval">
            <div className="mt-4">
              <ApprovalQueue />
            </div>
          </TabsContent>
        )}

        {/* Tab 3: 客户互动 */}
        <TabsContent value="interaction">
          <div className="mt-4 space-y-6">
            <InteractionChart />
            <HotQuestionsBar />
          </div>
        </TabsContent>

        {/* Tab 4: API 管理 */}
        {currentRole !== 'cfo' && (
          <TabsContent value="api">
            <div className="mt-4">
              <ApiManager />
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* AI 建议卡片（底部） */}
      <Card className="mt-6 border-l-4 border-l-[#C5A04E]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Badge variant="gold">AI</Badge>
            <div>
              <p className="text-sm font-medium text-text-primary mb-1">{t('team.feedbackTitle')}</p>
              <p className="text-sm text-gray-600">
                {t('team.feedbackContent')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
