import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/hooks/useTranslation'
import type { AuditTreeNode } from '@/types/audit'

interface NodeDetailProps {
  node: AuditTreeNode | null
  open: boolean
  onClose: () => void
}


export default function NodeDetail({ node, open, onClose }: NodeDetailProps) {
  const { t } = useTranslation()
  if (!node) return null

  const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'default' | 'warning' | 'danger' | 'outline' }> = {
    completed: { label: t('objective.nodeCompleted'), variant: 'success' },
    in_progress: { label: t('objective.nodeInProgress'), variant: 'default' },
    pending: { label: t('objective.nodePending'), variant: 'outline' },
    deficiency: { label: t('objective.nodeDeficiency'), variant: 'danger' },
    delayed: { label: t('objective.nodeDelayed'), variant: 'warning' },
  }

  const LEVEL_LABEL: Record<string, string> = {
    root: t('objective.levelRoot'),
    risk_area: t('objective.levelRiskArea'),
    control: t('objective.levelControl'),
    finding: t('objective.levelFinding'),
  }

  const COSO_LABEL: Record<string, string> = {
    control_environment: t('objective.controlEnvironment'),
    risk_assessment: t('objective.riskAssessment'),
    control_activities: t('objective.controlActivities'),
    information_communication: t('objective.infoCommunication'),
    monitoring: t('objective.monitoring'),
  }

  const statusInfo = STATUS_MAP[node.status] || STATUS_MAP.pending
  const cosoMapping = node.metadata?.cosoComponent as string | undefined

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }} side="right">
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{LEVEL_LABEL[node.level] || node.level}</Badge>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <SheetTitle>{node.name}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* 基本信息 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{t('objective.nodeId')}</span>
              <span className="font-mono text-gray-800">{node.id}</span>
            </div>
            {node.value !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t('objective.completion')}</span>
                <span className="font-semibold text-gray-800">{node.value}%</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{t('objective.level')}</span>
              <span className="text-gray-800">{LEVEL_LABEL[node.level]}</span>
            </div>
          </div>

          {/* COSO 映射 */}
          {cosoMapping && (
            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('objective.cosoMapping')}</h4>
              <Badge variant="secondary">{COSO_LABEL[cosoMapping] || cosoMapping}</Badge>
            </div>
          )}

          {/* 元数据 */}
          {node.metadata && (
            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('objective.detailedMetrics')}</h4>
              <div className="space-y-1.5">
                {Object.entries(node.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{key}</span>
                    <span className="font-mono text-gray-800">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 关联子节点 */}
          {node.children && node.children.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                {t('objective.relatedNodes')} ({node.children.length})
              </h4>
              <div className="space-y-1.5">
                {node.children.map((child) => {
                  const childStatus = STATUS_MAP[child.status] || STATUS_MAP.pending
                  return (
                    <div key={child.id} className="flex items-center justify-between py-1 text-xs">
                      <span className="text-gray-700">{child.name}</span>
                      <Badge variant={childStatus.variant}>{childStatus.label}</Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* AI 建议区域 */}
          <div className="border-t-4 border-[#C5A04E] mt-4 pt-4 bg-[#FFFDF7] -mx-6 px-6 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🤖</span>
              <h4 className="text-sm font-semibold text-gray-800">{t('objective.aiSuggestion')}</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {node.status === 'deficiency'
                ? t('objective.aiDeficiency')
                : node.status === 'delayed'
                ? t('objective.aiDelayed')
                : t('objective.aiNormal')}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
