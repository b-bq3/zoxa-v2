// ===== Zoxa Addons — Zod Validation Schemas =====

import { z } from 'zod'

export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query too long')
    .transform((s) => s.trim()),
})

export const paginationSchema = z.object({
  page: z
    .string()
    .nullable()
    .optional()
    .transform((v) => {
      if (!v) return 1
      const n = Number(v)
      return isNaN(n) || n < 1 ? 1 : n
    }),
  pageSize: z
    .string()
    .nullable()
    .optional()
    .transform((v) => {
      if (!v) return 12
      const n = Number(v)
      return isNaN(n) || n < 1 ? 12 : Math.min(n, 50)
    }),
})

export const addonQuerySchema = z.object({
  category: z.string().nullable().optional(),
  sort: z.enum(['latest', 'popular', 'downloads']).nullable().optional().default('latest'),
}).merge(paginationSchema)

export const downloadSchema = z.object({
  url: z.string().url('Invalid download URL'),
})

export type SearchQuery = z.infer<typeof searchQuerySchema>
export type Pagination = z.infer<typeof paginationSchema>
export type AddonQuery = z.infer<typeof addonQuerySchema>