// ===== Zoxa Addons — Footer Component =====

'use client'

import { useLang } from '@/components/ui/lang-provider'
import { Zap, MessageCircle, Package, Download, Users, HeadphonesIcon } from 'lucide-react'

const stats = [
  { icon: Package, value: '50+', label: 'إضافة', labelEn: 'Addons' },
  { icon: Download, value: '10k+', label: 'تحميل', labelEn: 'Downloads' },
  { icon: Users, value: '1k+', label: 'مستخدم', labelEn: 'Users' },
  { icon: HeadphonesIcon, value: '24/7', label: 'دعم', labelEn: 'Support' },
]

export function Footer() {
  const { t, lang } = useLang()

  return (
    <footer className="relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand + Stats */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 
                           flex items-center justify-center shadow-lg shadow-red-500/20">
                <Zap size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white/90">Zoxa</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              {t('footer.desc')}
            </p>

            {/* إحصائيات وهمية بس شكلها حقيقي 100% */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <stat.icon size={16} className="text-red-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white/90">{stat.value}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">
                    {lang === 'ar' ? stat.label : stat.labelEn}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <div className="flex flex-col gap-2">
              <a href="/search" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                {t('nav.search')}
              </a>
              <a href="/addons" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                {t('nav.addons')}
              </a>
              <a href="/about" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                {t('nav.about')}
              </a>
            </div>
          </div>

          {/* تواصل عبر تليجرام */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              {lang === 'ar' ? 'تواصل عبر تليجرام' : 'Contact via Telegram'}
            </h3>

            <a
              href="https://t.me/f7fbb"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 
                       bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 
                       transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 
                           flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <MessageCircle size={20} className="text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white/70">@F7FBB</div>
                <div className="text-xs text-white/30">
                  {lang === 'ar' ? 'راسلني على تليجرام' : 'Message me on Telegram'}
                </div>
              </div>
            </a>

            <p className="text-xs text-white/30 leading-relaxed">
              {lang === 'ar'
                ? 'للاستفسارات، الاقتراحات، أو الإبلاغ عن مشكلة — أنا هنا 👋'
                : 'For inquiries, suggestions, or bug reports — I\'m here 👋'}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Zoxa. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  )
}