// ===== Zoxa Addons — Core Types =====

export interface Addon {
  id: number
  name: string
  description: string | null
  version: string | null
  mc_version: string | null
  edition: string | null
  image_url: string | null
  file_url: string | null
  file_size: number | null
  downloads: number | null
  rating: number | null
  category: string | null
  created_at: string
}

// Database Addon (raw from Supabase, no rating)
export interface AddonRow {
  id: number
  name: string
  description: string | null
  version: string | null
  mc_version: string | null
  edition: string | null
  image_url: string | null
  file_url: string | null
  file_size: number | null
  downloads: number | null
  category: string | null
  created_at: string
}

export interface AddonCardProps {
  addon: Addon
  lang: 'ar' | 'en'
}

export interface SearchResult {
  data: Addon[]
  total?: number
  page?: number
}

export type Theme = 'dark' | 'light' | 'slate'

export type Language = 'ar' | 'en'

export interface I18nDict {
  [key: string]: string
}

export interface NavLink {
  href: string
  label: string
  icon: string
}

export interface ApiResponse<T> {
  data: T[]
  error?: string
  total?: number
  page?: number
  pageSize?: number
}