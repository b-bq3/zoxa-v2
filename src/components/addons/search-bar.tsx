// ===== Zoxa Addons — Search Bar Component =====

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useLang } from '@/components/ui/lang-provider'

export function SearchBar({ initialQuery = '' }: { initialQuery?: string }) {
  const { t, lang } = useLang()
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    }
  }, [query, router])

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-lg mx-auto group">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10 
                    opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-xl" />
      <div className="relative flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          className="flex-1 px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/10
                   text-white/90 placeholder:text-white/30 text-sm
                   focus:outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/20
                   transition-all duration-300"
        />
        <button
          type="submit"
          className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20
                   text-red-400 hover:bg-red-500/20 hover:border-red-500/40
                   transition-all duration-300"
        >
          <Search size={18} />
        </button>
      </div>
    </form>
  )
}