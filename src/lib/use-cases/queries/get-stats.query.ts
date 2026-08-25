// ===== Get Stats Query =====
import { addonRepo } from '@/lib/repository/addon-repository'
import { Logger } from '@/lib/infrastructure/logger'

export async function getStats(logger?: Logger): Promise<{ addonsCount: number; totalDownloads: number }> {
  return addonRepo.getStats(logger)
}