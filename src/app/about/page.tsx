// ===== Zoxa — About Page (Hs2y hqyqy) =====
import type { Metadata } from 'next'
import { Zap, Shield, Globe, Code } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

export const metadata: Metadata = {
  title: 'حول',
  description: 'حول منصة Zoxa Addons',
}

const v = [
  { i: Shield, t: 'الأمان أولاً', d: 'جميع الإضافات مجربة وآمنة للتحميل' },
  { i: Globe, t: 'عربي', d: 'منصة عربية ١٠٠٪ لمجتمع ماينكرافت العربي' },
  { i: Code, t: 'محدث', d: 'نواكب أحدث إصدارات ماينكرافت' },
]

async function gS() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
    const { data } = await sb.rpc('get_stats')
    const s = Array.isArray(data) ? data[0] : data
    return { a: s?.addons_count ?? 0, d: s?.total_downloads ?? 0 }
  } catch { return { a: 0, d: 0 } }
}

export default async function AboutPage() {
  const { a, d } = await gS()
  const st = [
    { l: 'إضافة', v: `${a}+` },
    { l: 'تحميل', v: `${d.toLocaleString()}+` },
    { l: 'مستخدم', v: `${a > 0 ? Math.max(1, Math.round(a * 0.3)).toLocaleString() : '1k'}+` },
    { l: 'دعم', v: '24/7' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
      <section className="text-center space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5">
          <Zap size={14} className="text-red-400" />
          <span className="text-xs text-white/50">حول Zoxa</span>
        </div>
        <h1 className="text-4xl font-bold text-white/80">حول Zoxa Addons</h1>
        <p className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
          Zoxa هي منصة عربية لإضافات ماينكرافت. نهدف لتوفير أفضل الإضافات
          في مكان واحد وبأعلى معايير الأمان والجودة.
        </p>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {st.map((s) => (
          <div key={s.l} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
            <div className="text-2xl font-bold text-white/80 mb-1">{s.v}</div>
            <div className="text-sm text-white/40">{s.l}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {v.map((x) => (
          <div key={x.t} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <x.i size={20} className="text-red-400" />
            </div>
            <h3 className="text-sm font-semibold text-white/70 mb-2">{x.t}</h3>
            <p className="text-sm text-white/40 leading-relaxed">{x.d}</p>
          </div>
        ))}
      </section>

      <section className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
        <p className="text-white/40 text-sm mb-4">تواصل عبر تليجرام</p>
        <div className="flex justify-center gap-4 text-sm">
          <a href="https://t.me/f7fbb" className="text-red-400 hover:text-red-300 transition-colors">@F7FBB</a>
          <span className="text-white/20">|</span>
          <a href="https://t.me/f_xxu" className="text-red-400 hover:text-red-300 transition-colors">t.me/f_xxu</a>
        </div>
      </section>
    </div>
  )
}