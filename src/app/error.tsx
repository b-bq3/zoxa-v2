// ===== Zoxa Addons — Error Page =====

'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="text-6xl font-bold text-white/20">!</div>
        <h1 className="text-2xl font-semibold text-white/60">حدث خطأ</h1>
        <p className="text-white/40 max-w-md mx-auto">
          حدث خطأ غير متوقع. حاول مرة أخرى.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 
                   border border-red-500/20 text-red-400 hover:bg-red-500/20 
                   transition-all duration-300"
        >
          🔄 حاول مرة أخرى
        </button>
      </div>
    </div>
  )
}