// ===== Zoxa Addons — Language Provider =====

'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Language } from '@/lib/i18n'
import { i18n } from '@/lib/i18n'

interface LangContext {
  lang: Language
  setLang: (l: Language) => void
  t: (key: string) => string
  dir: 'rtl' | 'ltr'
}

const LangCtx = createContext<LangContext | null>(null)

export function LangProvider({ children, initialLang = 'ar' }: { children: ReactNode; initialLang?: Language }) {
  const [lang, setLangState] = useState<Language>(initialLang)

  const setLang = useCallback((l: Language) => {
    setLangState(l)
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = l
  }, [])

  const t = useCallback((key: string) => i18n[lang]?.[key] ?? key, [lang])

  return (
    <LangCtx.Provider value={{ lang, setLang, t, dir: lang === 'ar' ? 'rtl' : 'ltr' }}>
      {children}
    </LangCtx.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangCtx)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}