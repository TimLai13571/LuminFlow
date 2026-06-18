import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import { useLanguageStore } from '@/store/language-store'

interface TimelineEvent {
  id: string
  timestamp: string
  description: string
  operator: string
  type: 'pbc' | 'test' | 'finding' | 'review' | 'system'
}

const eventsZh: TimelineEvent[] = [
  { id: 'E-001', timestamp: '2025-03-16 14:30', description: 'PBC材料提交：华东区分行信贷审批档案（25份）', operator: '李华', type: 'pbc' },
  { id: 'E-002', timestamp: '2025-03-16 10:15', description: '控制测试完成：CTRL-009 定期回访检查（通过）', operator: '张明', type: 'test' },
  { id: 'E-003', timestamp: '2025-03-15 16:45', description: '新发现缺陷：F-004 风险分类调整设计缺陷（低）', operator: '王强', type: 'finding' },
  { id: 'E-004', timestamp: '2025-03-15 09:00', description: '合伙人复核：抽样方案审阅意见已反馈', operator: '刘总', type: 'review' },
  { id: 'E-005', timestamp: '2025-03-14 17:20', description: '系统预警：CTRL-003 征信查询授权偏差率升至8%', operator: '系统', type: 'system' },
]

const eventsEn: TimelineEvent[] = [
  { id: 'E-001', timestamp: '2025-03-16 14:30', description: 'PBC Submission: East China Branch credit approval files (25 copies)', operator: 'Li Hua', type: 'pbc' },
  { id: 'E-002', timestamp: '2025-03-16 10:15', description: 'Control Test Completed: CTRL-009 Regular Follow-up Inspection (Passed)', operator: 'Zhang Ming', type: 'test' },
  { id: 'E-003', timestamp: '2025-03-15 16:45', description: 'New Finding: F-004 Risk Classification Adjustment Design Deficiency (Low)', operator: 'Wang Qiang', type: 'finding' },
  { id: 'E-004', timestamp: '2025-03-15 09:00', description: 'Partner Review: Sampling plan review comments submitted', operator: 'Director Liu', type: 'review' },
  { id: 'E-005', timestamp: '2025-03-14 17:20', description: 'System Alert: CTRL-003 Credit inquiry authorization deviation rate rose to 8%', operator: 'System', type: 'system' },
]

const typeColors: Record<TimelineEvent['type'], string> = {
  pbc: 'bg-brand-interactive',
  test: 'bg-status-success',
  finding: 'bg-status-danger',
  review: 'bg-accent-gold',
  system: 'bg-gray-400',
}

export default function ActivityTimeline() {
  const { t } = useTranslation()
  const language = useLanguageStore((s) => s.language)
  const events = language === 'en' ? eventsEn : eventsZh

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('dashboard.recentActivity')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
          {events.map((event) => (
            <div key={event.id} className="relative flex gap-4 pl-6">
              <div className={`absolute left-0 top-1.5 w-[14px] h-[14px] rounded-full border-2 border-white ${typeColors[event.type]} shadow-sm`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary leading-relaxed">{event.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-muted">{event.timestamp}</span>
                  <span className="text-xs text-text-secondary">{event.operator}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
