// ===== Zoxa Addons — Loading Page =====

export default function Loading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
        <span className="text-white/40">جاري التحميل...</span>
      </div>
    </div>
  )
}