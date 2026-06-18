import { create } from 'zustand'

export type Language = 'en' | 'zh'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('luminflow-language')
    if (stored === 'zh' || stored === 'en') return stored
  }
  return 'en' // Default to English
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (lang) => {
    localStorage.setItem('luminflow-language', lang)
    set({ language: lang })
  },
  toggleLanguage: () =>
    set((state) => {
      const newLang = state.language === 'en' ? 'zh' : 'en'
      localStorage.setItem('luminflow-language', newLang)
      return { language: newLang }
    }),
}))
