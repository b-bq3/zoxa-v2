// ===== Zoxa Addons — Search Page =====

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SearchBar } from '@/components/addons/search-bar'
import { AddonGrid } from '@/components/addons/addon-grid'
import { supabaseServer } from '@/lib/supabase-server'
import type { AddonRow } from '@/types'

export const metadata: Metadata = {
  title: 'بحث عن اضافة',
  description: 'ابحث عن إضافات ماينكرافت المفضلة لديك',
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

async function getSearchResults(query: string): Promise<AddonRow[]> {
  try {
    const { data } = await supabaseServer
      .from('addons')
      .select('id,name,description,version,mc_version,edition,image_url,file_url,file_size,downloads,category,created_at')
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(24)

    return (data || []) as AddonRow[]
  } catch {
    return []
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const results = q ? await getSearchResults(q) : []

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white/80">بحث عن اضافة</h1>
        <p className="text-white/40">ابحث عن إضافات ماينكرافت المفضلة لديك</p>
      </div>

      <SearchBar initialQuery={q || ''} />

      {q && (
        <div className="space-y-6">
          <p className="text-sm text-white/40 text-center">
            نتائج البحث عن: <span className="text-white/70 font-medium">&quot;{q}&quot;</span>
            {' '}— {results.length} نتيجة
          </p>
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden animate-pulse h-[400px]" />
              ))}
            </div>
          }>
            <AddonGrid initialAddons={results} searchQuery={q} />
          </Suspense>
        </div>
      )}
    </div>
  )
}