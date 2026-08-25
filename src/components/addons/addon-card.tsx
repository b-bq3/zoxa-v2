// ===== Zoxa Addons — Addon Card Component =====

'use client'

import { motion } from 'framer-motion'
import { Download, Package, HardDrive, Star } from 'lucide-react'
import { useLang } from '@/components/ui/lang-provider'
import type { AddonRow } from '@/types'

interface AddonCardProps {
  addon: AddonRow
  index: number
}

export function AddonCard({ addon, index }: AddonCardProps) {
  const { t, lang } = useLang()

  const formatSize = (bytes: number | null) => {
    if (!bytes) return ''
    const mb = bytes / 1024 / 1024
    return `${mb.toFixed(2)} ${t('addon.size')}`
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDownloadUrl = (url: string | null) => {
    if (!url) return '#'
    if (url.startsWith('http')) return url
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/${url}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative rounded-2xl border border-white/5 bg-white/[0.02] 
                 overflow-hidden transition-all duration-500
                 hover:border-white/10 hover:bg-white/[0.04]
                 hover:shadow-2xl hover:shadow-red-500/5"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-white/[0.02] to-white/[0.05]">
        {addon.image_url ? (
          <img
            src={addon.image_url}
            alt={addon.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500
                     group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={40} className="text-white/20" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Category badge */}
        {addon.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-medium
                       bg-black/40 backdrop-blur-md border border-white/10 text-white/60 uppercase tracking-wider">
            {addon.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-white/90 group-hover:text-white transition-colors line-clamp-1">
          {addon.name}
        </h3>

        {/* Description */}
        {addon.description && (
          <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
            {addon.description}
          </p>
        )}

        {/* Meta tags */}
        <div className="flex flex-wrap gap-1.5">
          {addon.version && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium
                         bg-white/[0.03] border border-white/5 text-white/40">
              {t('addon.version')} {addon.version}
            </span>
          )}
          {addon.mc_version && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium
                         bg-white/[0.03] border border-white/5 text-white/40">
              {t('addon.mcVersion')} {addon.mc_version}
            </span>
          )}
          {addon.edition && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium
                         bg-white/[0.03] border border-white/5 text-white/40">
              {addon.edition}
            </span>
          )}
          {addon.file_size && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium
                         bg-white/[0.03] border border-white/5 text-white/40">
              <HardDrive size={10} className="inline mr-1" />
              {formatSize(addon.file_size)}
            </span>
          )}
        </div>

        {/* Download button */}
        <div className="flex items-center justify-between pt-1">
          {addon.downloads && (
            <span className="text-xs text-white/30 flex items-center gap-1">
              <Download size={10} />
              {addon.downloads.toLocaleString()}
            </span>
          )}
          <a
            href={getDownloadUrl(addon.file_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                     text-sm font-medium text-red-400 border border-red-500/20
                     hover:bg-red-500/10 hover:border-red-500/40
                     transition-all duration-300"
          >
            <Download size={14} />
            {t('addon.download')}
          </a>
        </div>
      </div>
    </motion.div>
  )
}