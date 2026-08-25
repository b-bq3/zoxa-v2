// ===== Get Addon Command =====
import { supabase } from '@/lib/supabase'
import { Logger } from '@/lib/infrastructure/logger'
import type { Addon } from '@/types'

// Command: يقرأ addon واحد (يبقى Command عشان هو محدد بهوية)
export async function getAddonById(
  id: number,
  logger?: Logger
): Promise<Addon | null> {
  const start = performance.now()
  const { data, error } = await supabase
    .from('addons')
    .select('id,name,description,version,mc_version,edition,image_url,file_url,file_size,downloads,rating,category,created_at')
    .eq('id', id)
    .single()

  if (error) {
    logger?.error('getAddonById failed', error.message, { id, durationMs: performance.now() - start })
    return null
  }
  return data as Addon | null
}