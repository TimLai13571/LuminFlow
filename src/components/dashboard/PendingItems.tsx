import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useLanguageStore } from '@/store/language-store'

interface PendingItem {
  id: string
  title: string
  description: string
  status: 'overdue' | 'due_soon' | 'completed'
  dueDate: string
}

const pendingItemsZh: PendingItem[] = [
  { id: 'P-001', title: 'PBC-收入证明材料补充', description: '华东区分行收入证明交叉验证材料尚未提交，需尽快补充', status: 'overdue', dueDate: '2025-03-10' },
  { id: 'P-002', title: '征信查询授权书整改', description: '华中区分行需补充征信查询前置授权流程证据', status: 'overdue', dueDate: '2025-03-12' },
  { id: 'P-003', title: '抵押物重估报告跟进', description: '西南区分行评估机构重估报告延迟，需督促提交', status: 'overdue', dueDate: '2025-03-15' },
  { id: 'P-004', title: '资金监控规则更新确认', description: '系统白名单更新后的监控规则有效性确认', status: 'due_soon', dueDate: '2025-03-20' },
  { id: 'P-005', title: '风险分类调整方案审批', description: '新版分类触发规则方案待管理层审批', status: 'due_soon', dueDate: '2025-03-22' },
  { id: 'P-006', title: '信用评分模型验证完成', description: '模型参数验证与输出一致性测试已完成', status: 'completed', dueDate: '2025-03-05' },
  { id: 'P-007', title: '定期回访记录抽查', description: '12月份回访记录核验完毕', status: 'completed', dueDate: '2025-03-03' },
  { id: 'P-008', title: '资金流向监控日志审查', description: '异常划转预警记录审阅完毕', status: 'completed', dueDate: '2025-03-01' },
  { id: 'P-009', title: '逾期预警系统测试', description: 'T+0触发时效性验证完成', status: 'completed', dueDate: '2025-02-28' },
  { id: 'P-010', title: '用途声明审核流程确认', description: '合规性审核流程验证通过', status: 'completed', dueDate: '2025-02-25' },
]

const pendingItemsEn: PendingItem[] = [
  { id: 'P-001', title: 'PBC - Income Verification Supplement', description: 'East China branch income cross-validation materials not yet submitted, urgent supplement needed', status: 'overdue', dueDate: '2025-03-10' },
  { id: 'P-002', title: 'Credit Inquiry Authorization Remediation', description: 'Central China branch needs pre-authorization process evidence supplement', status: 'overdue', dueDate: '2025-03-12' },
  { id: 'P-003', title: 'Collateral Revaluation Report Follow-up', description: 'Southwest branch appraisal agency report delayed, follow-up needed', status: 'overdue', dueDate: '2025-03-15' },
  { id: 'P-004', title: 'Fund Monitoring Rule Update Confirmation', description: 'Post-whitelist-update monitoring rule effectiveness confirmation', status: 'due_soon', dueDate: '2025-03-20' },
  { id: 'P-005', title: 'Risk Classification Adjustment Approval', description: 'New classification trigger rules pending management approval', status: 'due_soon', dueDate: '2025-03-22' },
  { id: 'P-006', title: 'Credit Scoring Model Validation Complete', description: 'Model parameter and output consistency testing completed', status: 'completed', dueDate: '2025-03-05' },
  { id: 'P-007', title: 'Regular Follow-up Record Sampling', description: 'December follow-up records verification completed', status: 'completed', dueDate: '2025-03-03' },
  { id: 'P-008', title: 'Fund Flow Monitoring Log Review', description: 'Abnormal transfer alert records review completed', status: 'completed', dueDate: '2025-03-01' },
  { id: 'P-009', title: 'Overdue Alert System Testing', description: 'T+0 trigger timeliness verification completed', status: 'completed', dueDate: '2025-02-28' },
  { id: 'P-010', title: 'Purpose Statement Review Confirmation', description: 'Compliance review process verification passed', status: 'completed', dueDate: '2025-02-25' },
]

const statusConfig: Record<PendingItem['status'], { icon: React.ElementType; label: string; variant: 'danger' | 'warning' | 'success'; emoji: string }> = {
  overdue: { icon: AlertCircle, label: 'overdue', variant: 'danger', emoji: '🔴' },
  due_soon: { icon: Clock, label: 'due_soon', variant: 'warning', emoji: '🟡' },
  completed: { icon: CheckCircle2, label: 'completed', variant: 'success', emoji: '🟢' },
}

export default function PendingItems() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { t } = useTranslation()
  const language = useLanguageStore((s) => s.language)
  const pendingItems = language === 'en' ? pendingItemsEn : pendingItemsZh

  const overdueCount = pendingItems.filter((i) => i.status === 'overdue').length
  const dueSoonCount = pendingItems.filter((i) => i.status === 'due_soon').length
  const completedCount = pendingItems.filter((i) => i.status === 'completed').length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t('dashboard.pendingItems')}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="danger">{overdueCount} {t('dashboard.overdue')}</Badge>
            <Badge variant="warning">{dueSoonCount} {t('dashboard.dueSoon')}</Badge>
            <Badge variant="success">{completedCount} {t('dashboard.completed')}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
          {pendingItems.map((item) => {
            const config = statusConfig[item.status]
            const isExpanded = expandedId === item.id

            return (
              <div key={item.id}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-input hover:bg-gray-50 transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-text-muted flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-text-muted flex-shrink-0" />
                  )}
                  <span className="text-xs mr-1">{config.emoji}</span>
                  <span className="text-sm text-text-primary flex-1 truncate">{item.title}</span>
                  <span className="text-xs text-text-muted">{item.dueDate}</span>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-10 pr-4 pb-2">
                        <p className="text-xs text-text-secondary leading-relaxed">{item.description}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
