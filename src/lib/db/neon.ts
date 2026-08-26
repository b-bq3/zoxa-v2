// ===== Zoxa — Neon Database Client =====
// يستخدم pg Pool مباشر (بما أن DATABASE_URL صحيحة الآن)
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 8000,
  connectionTimeoutMillis: 8000,
})

export async function query(text: string, values: any[] = []) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, values)
    return result
  } finally {
    client.release()
  }
}

export async function getAddon(id: number) {
  const res = await query('SELECT * FROM addons WHERE id = $1', [id])
  return res.rows?.[0]
}

export async function getAllAddons(limit = 50, offset = 0) {
  const res = await query('SELECT * FROM addons ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset])
  return res.rows || []
}

export async function searchAddons(q: string, limit = 10) {
  const res = await query('SELECT * FROM addons WHERE name ILIKE $1 OR description ILIKE $1 ORDER BY created_at DESC LIMIT $2', [`%${q}%`, limit])
  return res.rows || []
}

export async function getStats() {
  const a = await query('SELECT COUNT(*) as c FROM addons')
  const d = await query('SELECT COUNT(*) as c FROM addon_downloads')
  return { total_addons: parseInt(a.rows?.[0]?.c || '0'), total_downloads: parseInt(d.rows?.[0]?.c || '0') }
}

export async function createAddon(data: any) {
  const res = await query(
    `INSERT INTO addons (name, description, edition, version, category, image_url, file_url, file_size, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [data.name, data.description, data.edition, data.version, data.category, data.image_url || null, data.file_url || null, data.file_size || 0, data.created_by || null]
  )
  return res.rows?.[0]
}

export async function recordDownload(addon_id: number, user_id?: number, ip?: string, user_agent?: string) {
  await query('INSERT INTO addon_downloads (addon_id,user_id,ip_address,user_agent) VALUES ($1,$2,$3,$4)', [addon_id, user_id || null, ip || null, user_agent || null])
  await query('UPDATE addons SET downloads = downloads + 1 WHERE id = $1', [addon_id])
  return { success: true }
}