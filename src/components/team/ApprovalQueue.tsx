import { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuthStore } from '@/store/auth-store'
import { useTranslation } from '@/hooks/useTranslation'
import { useLanguageStore } from '@/store/language-store'
import { GlossaryTerm } from '@/components/ui/glossary-term'
import type { ApprovalItem } from '@/types/user'

const ITEMS_ZH: ApprovalItem[] = [
  { id: '1', type: 'ai_insight', content: '基于当前抽样结果分析，建议关注应收账款科目中超过90天账龄的客户群体，其坏账准备计提比例可能低估约12%，建议扩大抽样范围至全部大额客户。', status: 'pending', createdAt: '2026-06-15 14:30' },
  { id: '2', type: 'pbc_description', content: '请提供2025年度第四季度所有单笔超过500万元的关联交易明细表，包含交易对手方名称、交易金额、审批流程记录及相关合同扫描件。', status: 'pending', createdAt: '2026-06-15 11:20' },
  { id: '3', type: 'impact_report', content: '收入确认政策变更影响分析：新收入准则下，分期收款销售商品的收入确认时点将从发货日变更为客户验收日，预计影响当期收入约8,500万元。', status: 'pending', createdAt: '2026-06-14 16:45' },
  { id: '4', type: 'narrative', content: '经复核固定资产盘点记录，发现3项已报废资产仍在账面列示，账面价值合计230万元，建议计提全额减值准备并调整资产台账。', status: 'approved', createdAt: '2026-06-14 09:10', reviewedAt: '2026-06-14 15:30' },
  { id: '5', type: 'ai_insight', content: '通过对比同行业上市公司数据，被审计单位存货周转天数偏高约15天，建议重点关注存货跌价准备的充分性。', status: 'approved', createdAt: '2026-06-13 10:00', reviewedAt: '2026-06-13 17:20' },
]

const ITEMS_EN: ApprovalItem[] = [
  { id: '1', type: 'ai_insight', content: 'Based on current sampling results, recommend focusing on accounts receivable clients with aging >90 days. Bad debt provision may be underestimated by ~12%. Suggest expanding sampling to all major clients.', status: 'pending', createdAt: '2026-06-15 14:30' },
  { id: '2', type: 'pbc_description', content: 'Please provide all Q4 2025 related party transactions exceeding CNY 5 million, including counterparty names, amounts, approval records, and contract scans.', status: 'pending', createdAt: '2026-06-15 11:20' },
  { id: '3', type: 'impact_report', content: 'Revenue recognition policy change impact: Under new standards, installment sales revenue recognition shifts from shipment to customer acceptance, estimated impact ~CNY 85 million on current period revenue.', status: 'pending', createdAt: '2026-06-14 16:45' },
  { id: '4', type: 'narrative', content: 'Upon reviewing fixed asset inventory records, found 3 scrapped assets still on books with total book value CNY 2.3 million. Recommend full impairment provision and ledger adjustment.', status: 'approved', createdAt: '2026-06-14 09:10', reviewedAt: '2026-06-14 15:30' },
  { id: '5', type: 'ai_insight', content: 'Compared with industry peers, the auditee\'s inventory turnover days are ~15 days higher. Recommend focusing on inventory impairment provision adequacy.', status: 'approved', createdAt: '2026-06-13 10:00', reviewedAt: '2026-06-13 17:20' },
]

const TYPE_LABELS: Record<ApprovalItem['type'], string> = {
  ai_insight: 'AI Insight',
  pbc_description: 'PBC',
  impact_report: 'Impact',
  narrative: 'Narrative',
}

export default function ApprovalQueue() {
  const { currentRole } = useAuthStore()
  const { t } = useTranslation()
  const language = useLanguageStore((s) => s.language)
  const [items, setItems] = useState<ApprovalItem[]>(language === 'en' ? ITEMS_EN : ITEMS_ZH)
  const [previewItem, setPreviewItem] = useState<ApprovalItem | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const canApprove = currentRole === 'auditor' || currentRole === 'partner'

  const pendingCount = items.filter((i) => i.status === 'pending').length
  const approvedCount = items.filter((i) => i.status === 'approved').length

  const handleApprove = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'approved' as const, reviewedAt: new Date().toLocaleString() }
          : item
      )
    )
    console.log('[API] 审批通过:', id)
  }

  const handleReject = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'rejected' as const, reviewedAt: new Date().toLocaleString() }
          : item
      )
    )
    console.log('[API] 审批退回:', id)
  }

  const handleEditStart = (item: ApprovalItem) => {
    setEditingId(item.id)
    setEditContent(item.content)
  }

  const handleEditSave = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content: editContent } : item))
    )
    setEditingId(null)
    console.log('[API] 编辑内容:', id, editContent)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className="flex items-center gap-3 mb-4">
        <Badge variant="warning">{t('team.approvalPending')} {pendingCount}</Badge>
        <Badge variant="success">{t('team.approvalPassed')} {approvedCount}</Badge>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className={item.status === 'rejected' ? 'border-[#D32F2F]/30' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="gold">🤖 {t('team.aiGenerated')}</Badge>
                <Badge variant="secondary">
                  {item.type === 'pbc_description' ? (
                    <GlossaryTerm term="pbc">{TYPE_LABELS[item.type]}</GlossaryTerm>
                  ) : (
                    TYPE_LABELS[item.type]
                  )}
                </Badge>
                {item.status === 'approved' && <Badge variant="success">{t('team.passed')}</Badge>}
                {item.status === 'rejected' && <Badge variant="danger">{t('team.rejected')}</Badge>}
              </div>

              {editingId === item.id ? (
                <div className="space-y-2">
                  <textarea
                    className="w-full border border-gray-200 rounded-btn p-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-brand-interactive"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditSave(item.id)}>{t('team.save')}</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>{t('team.cancel')}</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 line-clamp-3 mb-2">{item.content}</p>
              )}

              <p className="text-xs text-gray-400 mb-3">{t('team.generatedAt')} {item.createdAt}</p>

              {item.status === 'pending' && canApprove && editingId !== item.id && (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPreviewItem(item)}>
                    👁 {t('team.preview')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditStart(item)}>
                    ✏️ {t('team.edit')}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#009A44] hover:bg-[#009A44]/90 text-white"
                    onClick={() => handleApprove(item.id)}
                  >
                    ✓ {t('team.approve')}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(item.id)}>
                    ✗ {t('team.reject')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {previewItem && TYPE_LABELS[previewItem.type]} — {t('team.fullContent')}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{previewItem?.content}</p>
            <p className="text-xs text-gray-400 mt-4">{t('team.generatedAt')} {previewItem?.createdAt}</p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
