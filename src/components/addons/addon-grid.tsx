// ===== Zoxa Addons — Addon Grid Component =====

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '@/components/ui/lang-provider'
import { AddonCard } from './addon-card'
import type { AddonRow } from '@/types'

interface AddonGridProps {
  initialAddons?: AddonRow[]
  searchQuery?: string
}

export function AddonGrid({ initialAddons = [], searchQuery }: AddonGridProps) {
  const { t, lang } = useLang()
  const [addons, setAddons] = useState<AddonRow[]>(initialAddons)
  const [loading, setLoading] = useState(!initialAddons.length)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (searchQuery === undefined && initialAddons.length > 0) return

    const fetchAddons = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (searchQuery) {
          params.set('a', 'search')
          params.set('q', searchQuery)
        } else {
          params.set('a', 'list')
        }

        const res = await fetch(`/api/site?${params}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setAddons(data.data || [])
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
          setError(t('error.connection'))
        } else if (msg.includes('429') || msg.includes('Too Many Requests')) {
          setError(lang === 'ar' ? '⚠️ الطلبات كثيرة — انتظر قليلاً وحاول مرة أخرى' : '⚠️ Too many requests — wait a moment and try again')
        } else if (msg.includes('500') || msg.includes('503')) {
          setError(lang === 'ar' ? '🔴 السيرفر يعاني من مشكلة مؤقتة — حاول مرة أخرى لاحقًا' : '🔴 Server is experiencing a temporary issue — try again later')
        } else {
          setError(`${t('error.server')} (${msg})`)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAddons()
  }, [searchQuery, initialAddons.length, t])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden animate-pulse">
            <div className="h-48 bg-white/[0.03]" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-2/3 rounded bg-white/[0.05]" />
              <div className="h-3 w-full rounded bg-white/[0.03]" />
              <div className="h-3 w-4/5 rounded bg-white/[0.03]" />
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-md bg-white/[0.05]" />
                <div className="h-5 w-20 rounded-md bg-white/[0.05]" />
              </div>
              <div className="h-9 w-24 rounded-xl bg-white/[0.05]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-white/60 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl border border-red-500/20 text-red-400
                   hover:bg-red-500/10 transition-all duration-300 text-sm"
        >
          {t('error.retry')}
        </button>
      </div>
    )
  }

  if (addons.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-white/40 text-lg">{t('search.noResults')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {addons.map((addon, i) => (
          <AddonCard key={addon.id} addon={addon} index={i} />
        ))}
      </AnimatePresence>
    </div>
  )
}