// ===== Zoxa Addons — Home Page =====

import { Suspense } from 'react'
import { Zap, Search, Download, Shield } from 'lucide-react'
import { SearchBar } from '@/components/addons/search-bar'
import { AddonGrid } from '@/components/addons/addon-grid'
import { supabaseServer } from '@/lib/supabase-server'
import type { AddonRow } from '@/types'

const features = [
  {
    icon: Search,
    title: 'nav.search',
    desc: 'site.desc',
  },
  {
    icon: Download,
    title: 'addon.download',
    desc: 'footer.desc',
  },
  {
    icon: Shield,
    title: 'nav.home',
    desc: 'about.desc',
  },
]

async function getRecentAddons(): Promise<AddonRow[]> {
  try {
    const { data } = await supabaseServer
      .from('addons')
      .select('id,name,description,version,mc_version,edition,image_url,file_url,file_size,downloads,category,created_at')
      .order('created_at', { ascending: false })
      .limit(6)

    return (data || []) as AddonRow[]
  } catch {
    return []
  }
}

function FeatureCard({ icon: Icon, title, desc }: { icon: typeof Zap; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] 
                    hover:border-white/10 transition-all duration-300 group">
      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 
                    flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
        <Icon size={20} className="text-red-400" />
      </div>
      <h3 className="text-sm font-semibold text-white/70 mb-2">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
    </div>
  )
}

export default async function HomePage() {
  const recentAddons = await getRecentAddons()

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 text-center">
        {/* Glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] 
                        bg-gradient-to-br from-red-500/5 via-red-500/3 to-transparent 
                        rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] 
                        bg-gradient-to-br from-red-500/3 via-transparent to-transparent 
                        rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                       bg-white/[0.03] border border-white/5 mb-8">
            <Zap size={14} className="text-red-400" />
            <span className="text-xs text-white/50">Minecraft Addons</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-br 
                       from-white via-white/80 to-white/40 bg-clip-text text-transparent">
            Zoxa Addons
          </h1>
          
          <p className="text-lg md:text-xl text-white/40 mb-10 max-w-2xl mx-auto leading-relaxed">
            اكتشف أفضل إضافات ماينكرافت في مكان واحد
          </p>

          <SearchBar />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard icon={Search} title="nav.search" desc="site.desc" />
          <FeatureCard icon={Download} title="addon.download" desc="footer.desc" />
          <FeatureCard icon={Shield} title="nav.home" desc="about.desc" />
        </div>
      </section>

      {/* Recent Addons */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-white/80">أحدث الإضافات</h2>
          <a href="/addons" className="text-sm text-red-400 hover:text-red-300 transition-colors">
            عرض الكل →
          </a>
        </div>
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden animate-pulse h-[400px]" />
            ))}
          </div>
        }>
          <AddonGrid initialAddons={recentAddons} />
        </Suspense>
      </section>
    </div>
  )
}