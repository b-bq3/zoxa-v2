// ===== Zoxa Addons — Addons Page =====

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AddonGrid } from '@/components/addons/addon-grid'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { AddonRow } from '@/types'

export const metadata: Metadata = {
  title: 'الإضافات',
  description: 'تصفح جميع إضافات ماينكرافت',
}

async function getAllAddons(): Promise<AddonRow[]> {
  try {
    const { data } = await supabaseAdmin
      .from('addons')
      .select('id,name,description,version,mc_version,edition,image_url,file_url,file_size,downloads,category,created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    return (data || []) as AddonRow[]
  } catch {
    return []
  }
}

export default async function AddonsPage() {
  const addons = await getAllAddons()

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white/80">الإضافات</h1>
        <p className="text-white/40">تصفح جميع إضافات ماينكرافت</p>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden animate-pulse h-[400px]" />
          ))}
        </div>
      }>
        <AddonGrid initialAddons={addons} />
      </Suspense>
    </div>
  )
}