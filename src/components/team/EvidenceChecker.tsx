import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/hooks/useTranslation'
import { useLanguageStore } from '@/store/language-store'
import { GlossaryTerm } from '@/components/ui/glossary-term'

interface MissingItem {
  id: string
  name: string
  department: string
}

const MISSING_ITEMS_ZH: MissingItem[] = [
  { id: '1', name: '2025Q4关联交易明细表', department: '财务部' },
  { id: '2', name: '固定资产盘点差异说明', department: '资产管理部' },
  { id: '3', name: '银行函证回函（工商银行）', department: '资金部' },
  { id: '4', name: '存货跌价测试底稿', department: '仓储部' },
]

const MISSING_ITEMS_EN: MissingItem[] = [
  { id: '1', name: '2025 Q4 Related Party Transaction Details', department: 'Finance Dept.' },
  { id: '2', name: 'Fixed Asset Inventory Variance Statement', department: 'Asset Mgmt.' },
  { id: '3', name: 'Bank Confirmation Reply (ICBC)', department: 'Treasury Dept.' },
  { id: '4', name: 'Inventory Impairment Test Workpaper', department: 'Warehouse Dept.' },
]

export default function EvidenceChecker() {
  const [expanded, setExpanded] = useState(false)
  const { t } = useTranslation()
  const language = useLanguageStore((s) => s.language)
  const MISSING_ITEMS = language === 'en' ? MISSING_ITEMS_EN : MISSING_ITEMS_ZH

  const collected = 88
  const partial = 7
  const missing = 5

  const handleGeneratePBC = () => {
    console.log('[API] 一键生成 PBC 请求:', MISSING_ITEMS)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              <GlossaryTerm term="prp">{t('team.evidenceCheck')}</GlossaryTerm>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="success">{collected}% {t('team.collected')}</Badge>
              <Badge variant="warning">{partial}% {t('team.partial')}</Badge>
              <Badge variant="danger">{missing}% {t('team.missing')}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 堆叠进度条 */}
          <div className="w-full h-6 rounded-full overflow-hidden flex mb-4">
            <div
              className="h-full flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${collected}%`, backgroundColor: '#009A44' }}
            >
              {collected}%
            </div>
            <div
              className="h-full flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${partial}%`, backgroundColor: '#FF6B00' }}
            >
              {partial}%
            </div>
            <div
              className="h-full flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${missing}%`, backgroundColor: '#D32F2F' }}
            >
              {missing}%
            </div>
          </div>

          {/* 图例 */}
          <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#009A44' }} />
              {t('team.collected')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#FF6B00' }} />
              {t('team.partialCollected')}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#D32F2F' }} />
              {t('team.missing')}
            </span>
          </div>

          {/* 缺失项展开列表 */}
          <div className="border border-gray-100 rounded-btn">
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-primary hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded(!expanded)}
            >
              <span>{t('team.missingDocList')} ({MISSING_ITEMS.length})</span>
              <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
            </button>
            {expanded && (
              <div className="border-t border-gray-100">
                {MISSING_ITEMS.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-b-0">
                    <span className="text-sm text-gray-700">{item.name}</span>
                    <Badge variant="outline">{item.department}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="mt-4">
            <Button onClick={handleGeneratePBC} className="w-full">
              📋 {t('team.generatePBC')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
