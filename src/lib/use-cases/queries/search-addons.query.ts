// ===== Search Addons Query =====
import { addonRepo } from '@/lib/repository/addon-repository'
import { Logger } from '@/lib/infrastructure/logger'
import type { AddonRow } from '@/types'

export async function searchAddons(
  query: string,
  maxResults = 24,
  logger?: Logger
): Promise<AddonRow[]> {
  return addonRepo.search(query, maxResults, logger)
}