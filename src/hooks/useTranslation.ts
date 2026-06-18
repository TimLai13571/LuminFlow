import { useLanguageStore } from '@/store/language-store'
import { getTranslation } from '@/locales/translations'
import { translateData, translateArray, translateObject } from '@/locales/data-translations'

export function useTranslation() {
  const language = useLanguageStore((s) => s.language)

  const t = (key: string, params?: Record<string, string | number>): string => {
    return getTranslation(language, key, params)
  }

  /** Translate a data-layer string (from JSON mock data) */
  const td = (text: string | undefined | null): string => {
    return translateData(text, language)
  }

  return { t, td, language, translateArray, translateObject }
}
