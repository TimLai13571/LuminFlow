import { Globe } from 'lucide-react'
import { useLanguageStore } from '@/store/language-store'

export function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguageStore()

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 rounded-btn bg-white/10 px-2.5 py-1.5 text-sm text-white/90 hover:bg-white/20 transition-colors"
      title={language === 'en' ? 'Switch to Chinese' : '切换为英文'}
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{language === 'en' ? '中文' : 'EN'}</span>
    </button>
  )
}
