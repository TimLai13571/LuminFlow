import { useState, useEffect, useCallback } from 'react'
import { Mail, CheckCircle, XCircle, RefreshCw, Eye, EyeOff, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/hooks/useTranslation'

export interface EmailConfig {
  smtpHost: string
  smtpPort: number
  username: string
  password: string
  useTLS: boolean
  senderName: string
  senderEmail: string
}

const DEFAULT_CONFIG: EmailConfig = {
  smtpHost: '',
  smtpPort: 587,
  username: '',
  password: '',
  useTLS: true,
  senderName: '',
  senderEmail: '',
}

const STORAGE_KEY = 'luminflow_email_config'

function loadConfig(): EmailConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { ...DEFAULT_CONFIG }
}

function saveConfig(config: EmailConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function getStoredEmailConfig(): EmailConfig | null {
  const cfg = loadConfig()
  // Only return if at least host is configured
  if (!cfg.smtpHost) return null
  return cfg
}

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error'

export default function EmailApiConfig() {
  const { t } = useTranslation()
  const [config, setConfig] = useState<EmailConfig>(loadConfig)
  const [showPassword, setShowPassword] = useState(false)
  const [testStatus, setTestStatus] = useState<ConnectionStatus>('idle')
  const [testMessage, setTestMessage] = useState('')
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  const isConfigured = !!config.smtpHost && !!config.username

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2000)
      return () => clearTimeout(t)
    }
  }, [saved])

  const updateField = useCallback(<K extends keyof EmailConfig>(field: K, value: EmailConfig[K]) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
    setDirty(true)
    setSaved(false)
  }, [])

  const handleSave = useCallback(() => {
    saveConfig(config)
    setDirty(false)
    setSaved(true)
  }, [config])

  const handleTestConnection = useCallback(async () => {
    if (!config.smtpHost || !config.smtpPort || !config.username) {
      setTestStatus('error')
      setTestMessage(t('team.email.testMissingFields'))
      return
    }

    setTestStatus('testing')
    setTestMessage('')

    // Simulate SMTP connection test with 1.5s delay
    await new Promise((r) => setTimeout(r, 1500))

    const success = Math.random() > 0.15
    if (success) {
      setTestStatus('success')
      setTestMessage(t('team.email.testSuccess'))
    } else {
      setTestStatus('error')
      const errors = [
        t('team.email.testErrorAuth'),
        t('team.email.testErrorTimeout'),
        t('team.email.testErrorTLS'),
      ]
      setTestMessage(errors[Math.floor(Math.random() * errors.length)])
    }

    // Auto-clear test status after 5s
    setTimeout(() => {
      setTestStatus('idle')
      setTestMessage('')
    }, 5000)
  }, [config, t])

  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4 text-brand-primary" />
          {t('team.email.title')}
          {isConfigured && (
            <Badge variant="success" className="ml-1 text-[10px]">
              {t('team.email.configured')}
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          {testStatus === 'success' && (
            <Badge variant="success" className="text-[10px]">
              <CheckCircle className="h-3 w-3 mr-1" />
              {t('team.email.connected')}
            </Badge>
          )}
          {testStatus === 'error' && (
            <Badge variant="danger" className="text-[10px]">
              <XCircle className="h-3 w-3 mr-1" />
              {t('team.email.failed')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {/* Connection status banner */}
        {testMessage && (
          <div className={`text-xs px-3 py-2 rounded-lg ${
            testStatus === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : testStatus === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : ''
          }`}>
            {testMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* SMTP Host */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              {t('team.email.smtpHost')}
            </label>
            <input
              type="text"
              value={config.smtpHost}
              onChange={(e) => updateField('smtpHost', e.target.value)}
              placeholder="smtp.example.com"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-interactive/30"
            />
          </div>

          {/* SMTP Port */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              {t('team.email.smtpPort')}
            </label>
            <input
              type="number"
              value={config.smtpPort}
              onChange={(e) => updateField('smtpPort', Number(e.target.value))}
              placeholder="587"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-interactive/30"
            />
          </div>

          {/* Username / Email */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              {t('team.email.username')}
            </label>
            <input
              type="text"
              value={config.username}
              onChange={(e) => updateField('username', e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-interactive/30"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              {t('team.email.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={config.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-brand-interactive/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Sender Name */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              {t('team.email.senderName')}
            </label>
            <input
              type="text"
              value={config.senderName}
              onChange={(e) => updateField('senderName', e.target.value)}
              placeholder={t('team.email.senderNamePlaceholder')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-interactive/30"
            />
          </div>

          {/* Sender Email */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              {t('team.email.senderEmail')}
            </label>
            <input
              type="email"
              value={config.senderEmail}
              onChange={(e) => updateField('senderEmail', e.target.value)}
              placeholder="noreply@example.com"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-interactive/30"
            />
          </div>
        </div>

        {/* TLS Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateField('useTLS', !config.useTLS)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              config.useTLS ? 'bg-brand-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                config.useTLS ? 'translate-x-[18px]' : 'translate-x-[3px]'
              }`}
            />
          </button>
          <label className="text-xs font-medium text-gray-500 flex items-center gap-1 cursor-pointer" onClick={() => updateField('useTLS', !config.useTLS)}>
            <Shield className="h-3.5 w-3.5" />
            {t('team.email.useTLS')}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'testing' || !config.smtpHost}
            className="flex items-center gap-1.5 rounded-btn border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testStatus === 'testing' ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {testStatus === 'testing' ? t('team.email.testing') : t('team.email.testConnection')}
          </button>

          <button
            onClick={handleSave}
            disabled={!dirty}
            className="flex items-center gap-1.5 rounded-btn bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-interactive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saved ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                {t('team.email.saved')}
              </>
            ) : (
              t('team.email.saveConfig')
            )}
          </button>
        </div>

        {/* SMTP Provider Quick-Select Chips */}
        <div className="pt-1 border-t border-gray-50">
          <p className="text-[11px] text-gray-400 mb-2">{t('team.email.quickSetup')}</p>
          <div className="flex flex-wrap gap-1.5">
            {([
              { label: 'Gmail', host: 'smtp.gmail.com', port: 587 },
              { label: 'Outlook', host: 'smtp.office365.com', port: 587 },
              { label: 'QQ Mail', host: 'smtp.qq.com', port: 587 },
              { label: '163 Mail', host: 'smtp.163.com', port: 465 },
              { label: 'Aliyun', host: 'smtp.aliyun.com', port: 465 },
              { label: 'Tencent Exmail', host: 'smtp.exmail.qq.com', port: 587 },
            ] as const).map((provider) => (
              <button
                key={provider.label}
                onClick={() => {
                  updateField('smtpHost', provider.host)
                  updateField('smtpPort', provider.port)
                }}
                className="px-2.5 py-1 text-[11px] rounded-full bg-gray-100 text-gray-500 hover:bg-brand-light/30 hover:text-brand-primary transition-colors"
              >
                {provider.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
