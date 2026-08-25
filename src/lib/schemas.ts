// ===== Zoxa — Schemas =====
import { z } from 'zod'

export const searchQuerySchema = z.object({ q: z.string().min(1).max(100).transform(s => s.trim()) })

export const paginationSchema = z.object({
  page: z.string().nullable().optional().transform(v => { const n = Number(v); return isNaN(n) || n < 1 ? 1 : n }),
  pageSize: z.string().nullable().optional().transform(v => { const n = Number(v); return isNaN(n) || n < 1 ? 12 : Math.min(n, 50) }),
})

export const addonQuerySchema = z.object({
  category: z.string().nullable().optional(),
  sort: z.enum(['latest', 'popular', 'downloads']).nullable().optional().default('latest'),
}).merge(paginationSchema)

export const downloadSchema = z.object({ url: z.string().url() })

export const addonCreateSchema = z.object({
  nm: z.string().min(1).max(100),           // name
  ds: z.string().min(1).max(2000),          // description
  v: z.string().min(1).max(20),             // version
  mv: z.string().min(1).max(20),            // mc_version
  ed: z.enum(['bedrock', 'java', 'both']).default('bedrock'),  // edition
  ct: z.string().nullable().optional(),     // category
  im: z.string().nullable().optional(),     // image_url
  fl: z.string().nullable().optional(),     // file_url
  fs: z.number().nullable().optional(),     // file_size
  tk: z.string().min(1).max(200),           // upload token (secret)
})

export type SearchQuery = z.infer<typeof searchQuerySchema>
export type Pagination = z.infer<typeof paginationSchema>
export type AddonQuery = z.infer<typeof addonQuerySchema>
export type AddonCreate = z.infer<typeof addonCreateSchema>