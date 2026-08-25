// ===== Zoxa Addons — About Page =====

import type { Metadata } from 'next'
import { Zap, Shield, Globe, Code } from 'lucide-react'

export const metadata: Metadata = {
  title: 'حول',
  description: 'حول منصة Zoxa Addons',
}

const stats = [
  { label: 'إضافة', value: '50+' },
  { label: 'تحميل', value: '10k+' },
  { label: 'مستخدم', value: '1k+' },
  { label: 'دعم', value: '24/7' },
]

const values = [
  {
    icon: Shield,
    title: 'الأمان أولاً',
    desc: 'جميع الإضافات مجربة وآمنة للتحميل',
  },
  {
    icon: Globe,
    title: 'عربي',
    desc: 'منصة عربية ١٠٠٪ لمجتمع ماينكرافت العربي',
  },
  {
    icon: Code,
    title: 'محدث',
    desc: 'نواكب أحدث إصدارات ماينكرافت',
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                     bg-white/[0.03] border border-white/5">
          <Zap size={14} className="text-red-400" />
          <span className="text-xs text-white/50">حول Zoxa</span>
        </div>
        <h1 className="text-4xl font-bold text-white/80">حول Zoxa Addons</h1>
        <p className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
          Zoxa هي منصة عربية لإضافات ماينكرافت. نهدف لتوفير أفضل الإضافات
          في مكان واحد وبأعلى معايير الأمان والجودة.
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
            <div className="text-2xl font-bold text-white/80 mb-1">{stat.value}</div>
            <div className="text-sm text-white/40">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {values.map((v) => (
          <div key={v.title} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] 
                                      hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 
                          flex items-center justify-center mb-4">
              <v.icon size={20} className="text-red-400" />
            </div>
            <h3 className="text-sm font-semibold text-white/70 mb-2">{v.title}</h3>
            <p className="text-sm text-white/40 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </section>

      {/* Credits */}
      <section className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
        <p className="text-white/40 text-sm mb-4">
          حقوق الصور والتصميم
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <a href="https://t.me/f_xxu" className="text-red-400 hover:text-red-300 transition-colors">
            t.me/f_xxu
          </a>
          <span className="text-white/20">|</span>
          <a href="https://t.me/f7fbb" className="text-red-400 hover:text-red-300 transition-colors">
            t.me/f7fbb
          </a>
        </div>
      </section>
    </div>
  )
}