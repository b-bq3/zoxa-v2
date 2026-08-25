// ===== List Addons Query =====
import { addonRepo } from '@/lib/repository/addon-repository'
import { Logger } from '@/lib/infrastructure/logger'
import type { AddonRow } from '@/types'

export async function listAddons(
  page: number,
  pageSize: number,
  logger?: Logger
): Promise<{ data: AddonRow[]; total: number }> {
  const data = await addonRepo.listAll(50, logger)
  const start = (page - 1) * pageSize
  return { data: data.slice(start, start + pageSize), total: data.length }
}