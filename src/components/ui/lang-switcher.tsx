// ===== Zoxa Addons — Language Switcher Button =====

'use client'

import { useLang } from './lang-provider'
import { Languages } from 'lucide-react'

export function LangSwitcher() {
  const { lang, setLang, t } = useLang()

  return (
    <button
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      className="p-2 rounded-xl border border-white/10 hover:border-white/20 
                 transition-all duration-300 hover:bg-white/5
                 text-white/70 hover:text-white"
      aria-label={t('nav.lang')}
      title={t('nav.lang')}
    >
      <Languages size={18} />
    </button>
  )
}