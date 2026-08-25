// ===== Zoxa Addons — Theme Switcher Button =====

'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useLang } from './lang-provider'

const icons = {
  dark: <Moon size={18} />,
  light: <Sun size={18} />,
  slate: <Monitor size={18} />,
}

const themes = ['dark', 'light', 'slate'] as const

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { t } = useLang()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-9 h-9" />

  const current = theme as (typeof themes)[number]

  return (
    <button
      onClick={() => {
        const idx = themes.indexOf(current)
        setTheme(themes[(idx + 1) % themes.length])
      }}
      className="p-2 rounded-xl border border-white/10 hover:border-white/20 
                 transition-all duration-300 hover:bg-white/5
                 text-white/70 hover:text-white"
      aria-label={t('nav.theme')}
      title={t('nav.theme')}
    >
      {icons[current] || icons.dark}
    </button>
  )
}