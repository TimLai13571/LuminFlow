import { useState } from 'react'
import { Mail, Copy, Send, X, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import { getStoredEmailConfig } from '@/components/team/EmailApiConfig'

interface PBCEmailDraftProps {
  to: string
  subject: string
  body: string
  visible: boolean
  onClose: () => void
}

type SendStatus = 'idle' | 'sending' | 'success' | 'error' | 'noconfig'

export default function PBCEmailDraft({ to, subject, body, visible, onClose }: PBCEmailDraftProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle')
  const [sendMessage, setSendMessage] = useState('')

  if (!visible || !to) return null

  const handleCopy = async () => {
    const fullText = `To: ${to}\nSubject: ${subject}\n\n${body}`
    await navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSend = async () => {
    const config = getStoredEmailConfig()
    if (!config) {
      setSendStatus('noconfig')
      setSendMessage(t('team.email.noConfig'))
      setTimeout(() => { setSendStatus('idle'); setSendMessage('') }, 4000)
      return
    }

    setSendStatus('sending')
    setSendMessage('')

    // Simulate sending via SMTP API with 1-2s delay
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800))

    const success = Math.random() > 0.1
    if (success) {
      setSendStatus('success')
      setSendMessage(t('team.email.sendSuccess'))
      setTimeout(() => { setSendStatus('idle'); setSendMessage('') }, 4000)
    } else {
      setSendStatus('error')
      setSendMessage(t('team.email.sendFailed'))
      setTimeout(() => { setSendStatus('idle'); setSendMessage('') }, 5000)
    }
  }

  const isSending = sendStatus === 'sending'

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
        {/* Send Status Feedback */}
        {sendStatus === 'noconfig' && (
          <div className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>{sendMessage}</span>
          </div>
        )}
        {sendStatus === 'success' && (
          <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>{sendMessage}</span>
          </div>
        )}
        {sendStatus === 'error' && (
          <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200">
            <XCircle className="h-3.5 w-3.5" />
            <span>{sendMessage}</span>
          </div>
        )}

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
          <button
            onClick={handleSend}
            disabled={isSending}
            className="flex items-center gap-1.5 rounded-btn bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-interactive transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {isSending ? t('team.email.sending') : t('team.email.sendViaSMTP')}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
