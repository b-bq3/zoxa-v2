// ===== Zoxa Addons — Theme Provider =====

'use client'

import { ThemeProvider as NextThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={['dark', 'light', 'slate']}
    >
      {children}
    </NextThemeProvider>
  )
}