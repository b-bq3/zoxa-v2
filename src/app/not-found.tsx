// ===== Zoxa Addons — Not Found Page =====

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الصفحة غير موجودة',
}

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="text-6xl font-bold text-white/20">404</div>
        <h1 className="text-2xl font-semibold text-white/60">الصفحة غير موجودة</h1>
        <p className="text-white/40 max-w-md mx-auto">
          الصفحة اللي تبحث عنها مش موجودة أو تم نقلها.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 
                   border border-red-500/20 text-red-400 hover:bg-red-500/20 
                   transition-all duration-300"
        >
          ← الرجوع للرئيسية
        </Link>
      </div>
    </div>
  )
}