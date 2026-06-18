import { useState } from 'react'
import { Mail, Copy, Send, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'

interface PBCEmailDraftProps {
  to: string
  subject: string
  body: string
  visible: boolean
  onClose: () => void
}

export default function PBCEmailDraft({ to, subject, body, visible, onClose }: PBCEmailDraftProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  if (!visible || !to) return null

  const handleCopy = async () => {
    const fullText = `To: ${to}\nSubject: ${subject}\n\n${body}`
    await navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-brand-light/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-brand-primary" />
            {t('pbcview.emailDraft')}
          </CardTitle>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">{t('pbcview.emailTo')}</label>
          <input
            readOnly
            value={to}
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm bg-gray-50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">{t('pbcview.emailSubject')}</label>
          <input
            readOnly
            value={subject}
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm bg-gray-50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500">{t('pbcview.emailBody')}</label>
          <textarea
            readOnly
            value={body}
            rows={8}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 resize-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-btn border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? '✓ Copied' : t('pbcview.copyToClipboard')}
          </button>
          <button className="flex items-center gap-1.5 rounded-btn bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-interactive transition-colors">
            <Send className="h-3.5 w-3.5" />
            {t('pbcview.send')}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
