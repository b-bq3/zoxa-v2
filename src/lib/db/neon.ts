// ===== Zoxa — Neon PostgreSQL Client =====
import { Pool } from 'pg'

const neonConnectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

if (!neonConnectionString) {
  console.error('❌ DATABASE_URL or NEON_DATABASE_URL not set')
  throw new Error('DATABASE_URL or NEON_DATABASE_URL not set')
}

console.log('🔗 Connecting to Neon with DATABASE_URL starting with:', neonConnectionString.substring(0, 50) + '...')

export const pool = new Pool({
  connectionString: neonConnectionString,
  ssl: {
    rejectUnauthorized: false
  },
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

// ===== Addon Operations =====

export async function getAddon(id: number) {
  const res = await pool.query('SELECT * FROM addons WHERE id = $1', [id])
  return res.rows[0]
}

export async function getAddonByName(name: string) {
  const res = await pool.query('SELECT * FROM addons WHERE name = $1', [name])
  return res.rows[0]
}

export async function getAllAddons(limit = 50, offset = 0) {
  const res = await pool.query(
    'SELECT * FROM addons ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  )
  return res.rows
}

export async function searchAddons(query: string, limit = 10) {
  const res = await pool.query(
    `SELECT * FROM addons 
     WHERE name ILIKE $1 OR description ILIKE $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [`%${query}%`, limit]
  )
  return res.rows
}

export async function getAddonsByCategory(category: string, limit = 20) {
  const res = await pool.query(
    'SELECT * FROM addons WHERE category = $1 ORDER BY created_at DESC LIMIT $2',
    [category, limit]
  )
  return res.rows
}

export async function createAddon(data: {
  name: string
  description: string
  edition: string
  version: string
  category: string
  image_url?: string
  file_url?: string
  file_size?: number
  created_by: number
}) {
  const res = await pool.query(
    `INSERT INTO addons (name, description, edition, version, category, image_url, file_url, file_size, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.name,
      data.description,
      data.edition,
      data.version,
      data.category,
      data.image_url || null,
      data.file_url || null,
      data.file_size || 0,
      data.created_by,
    ]
  )
  return res.rows[0]
}

export async function getStats() {
  const addonsRes = await pool.query('SELECT COUNT(*) FROM addons')
  const downloadsRes = await pool.query('SELECT SUM(downloads) FROM addons')
  
  return {
    addonsCount: parseInt(addonsRes.rows[0].count) || 0,
    totalDownloads: parseInt(downloadsRes.rows[0].sum) || 0,
  }
}

export async function incrementDownloads(addonId: number) {
  await pool.query(
    'UPDATE addons SET downloads = downloads + 1 WHERE id = $1',
    [addonId]
  )
}

export async function recordDownload(
  addonId: number,
  ipAddress?: string,
  userAgent?: string
) {
  await pool.query(
    `INSERT INTO addon_downloads (addon_id, ip_address, user_agent)
     VALUES ($1, $2, $3)`,
    [addonId, ipAddress || null, userAgent || null]
  )
  await incrementDownloads(addonId)
}
