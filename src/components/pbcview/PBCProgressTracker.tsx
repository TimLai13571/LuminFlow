import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import { useLanguageStore } from '@/store/language-store'

interface ProgressItem {
  controlId: string
  total: number
  submitted: number
  progress: number
}

interface PBCProgressTrackerProps {
  progressItems: ProgressItem[]
}

const CONTROL_NAMES_ZH: Record<string, string> = {
  'CTRL-001': '信用评分模型', 'CTRL-002': '收入证明审核',
  'CTRL-003': '征信查询授权', 'CTRL-004': '贷款审批授权',
  'CTRL-005': '贷款用途监控', 'CTRL-006': '资金流向监控',
  'CTRL-007': '关联方核查', 'CTRL-008': '异常交易识别',
  'CTRL-009': '客户回访管理', 'CTRL-010': '抵押物评估',
  'CTRL-011': '逾期预警系统', 'CTRL-012': '风险分类调整',
}
const CONTROL_NAMES_EN: Record<string, string> = {
  'CTRL-001': 'Credit Scoring Model', 'CTRL-002': 'Income Verification',
  'CTRL-003': 'Credit Inquiry Auth', 'CTRL-004': 'Loan Approval Auth',
  'CTRL-005': 'Loan Purpose Monitoring', 'CTRL-006': 'Fund Flow Monitoring',
  'CTRL-007': 'Related Party Review', 'CTRL-008': 'Anomaly Detection',
  'CTRL-009': 'Client Follow-up', 'CTRL-010': 'Collateral Valuation',
  'CTRL-011': 'Overdue Alert System', 'CTRL-012': 'Risk Classification',
}

export default function PBCProgressTracker({ progressItems }: PBCProgressTrackerProps) {
  const { t } = useTranslation()
  const language = useLanguageStore((s) => s.language)
  const controlNames = language === 'en' ? CONTROL_NAMES_EN : CONTROL_NAMES_ZH

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('pbcview.progressByControl')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {progressItems.map((item) => (
            <div key={item.controlId} className="rounded-lg border border-gray-100 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-primary">
                  {controlNames[item.controlId] || item.controlId}
                </span>
                <span className="text-[10px] text-gray-400">
                  {item.submitted}/{item.total}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.progress === 100
                      ? 'bg-green-500'
                      : item.progress >= 50
                      ? 'bg-brand-interactive'
                      : 'bg-yellow-400'
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{item.progress}% {t('pbcview.completed')}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
