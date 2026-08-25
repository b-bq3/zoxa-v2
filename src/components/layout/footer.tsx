// ===== Zoxa — Footer =====
'use client'
import { useLang } from '@/components/ui/lang-provider'
import { Zap, MessageCircle, Package, Download, Users, HeadphonesIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface St {
  a: number; d: number; u: number
}

const s7: St = { a: 0, d: 0, u: 0 }

export function Footer() {
  const { t, lang } = useLang()
  const [s, gS] = useState<St>(s7)

  useEffect(() => {
    fetch('/api/site?a=stats').then(r => r.json()).then(d => {
      gS({ a: d.addonsCount || 0, d: d.totalDownloads || 0, u: 0 })
    }).catch(() => {})
  }, [])

  const st = [
    { i: Package, v: `${s.a}+`, l: 'إضافة', lE: 'Addons' },
    { i: Download, v: `${s.d.toLocaleString()}+`, l: 'تحميل', lE: 'Downloads' },
    { i: Users, v: `${s.u > 0 ? s.u.toLocaleString() : '1k'}+`, l: 'مستخدم', lE: 'Users' },
    { i: HeadphonesIcon, v: '24/7', l: 'دعم', lE: 'Support' },
  ]

  return (
    <footer className="relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Zap size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white/90">Zoxa</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">{t('footer.desc')}</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {st.map((s) => (
                <div key={s.l} className="text-center p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <s.i size={16} className="text-red-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white/90">{s.v}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{lang === 'ar' ? s.l : s.lE}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h3>
            <div className="flex flex-col gap-2">
              <a href="/search" className="text-sm text-white/40 hover:text-white/70 transition-colors">{t('nav.search')}</a>
              <a href="/addons" className="text-sm text-white/40 hover:text-white/70 transition-colors">{t('nav.addons')}</a>
              <a href="/about" className="text-sm text-white/40 hover:text-white/70 transition-colors">{t('nav.about')}</a>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">{lang === 'ar' ? 'تواصل عبر تليجرام' : 'Contact via Telegram'}</h3>
            <a href="https://t.me/f7fbb" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <MessageCircle size={20} className="text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white/70">@F7FBB</div>
                <div className="text-xs text-white/30">{lang === 'ar' ? 'راسلني على تليجرام' : 'Message me on Telegram'}</div>
              </div>
            </a>
            <p className="text-xs text-white/30 leading-relaxed">
              {lang === 'ar' ? 'للاستفسارات، الاقتراحات، أو الإبلاغ عن مشكلة — أنا هنا 👋' : 'For inquiries, suggestions, or bug reports — I\'m here 👋'}
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} Zoxa. {t('footer.rights')}.</p>
        </div>
      </div>
    </footer>
  )
}