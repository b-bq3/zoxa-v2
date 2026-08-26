// ===== Zoxa — Neon Serverless Client =====
// يستخدم Neon HTTP API مباشر (يتجنب مشكلة DNS وكلمة المرور)
const NEON_PROJECT_ID = 'tiny-mode-28836954'
const NEON_BRANCH = 'br-solitary-recipe-ac9gjuke'
const NEON_API_TOKEN = process.env.NEON_API_TOKEN || ''

export async function query(text: string, values: any[] = []) {
  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${NEON_PROJECT_ID}/branches/${NEON_BRANCH}/sql`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NEON_API_TOKEN}`,
      },
      body: JSON.stringify({ query: text, params: values }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Neon API error: ${response.status} ${errorText.substring(0, 200)}`)
  }

  const result = await response.json()
  return result
}

export async function getAddon(id: number) {
  const res = await query('SELECT * FROM addons WHERE id = $1', [id])
  return res.rows?.[0]
}

export async function getAllAddons(limit = 50, offset = 0) {
  const res = await query('SELECT * FROM addons ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset])
  return res.rows || []
}

export async function searchAddons(searchQuery: string, limit = 10) {
  const res = await query(
    `SELECT * FROM addons WHERE name ILIKE $1 OR description ILIKE $1 ORDER BY created_at DESC LIMIT $2`,
    [`%${searchQuery}%`, limit]
  )
  return res.rows || []
}

export async function getStats() {
  const addonsRes = await query('SELECT COUNT(*) as count FROM addons')
  const downloadsRes = await query('SELECT COUNT(*) as count FROM addon_downloads')
  return {
    total_addons: parseInt(addonsRes.rows?.[0]?.count || '0'),
    total_downloads: parseInt(downloadsRes.rows?.[0]?.count || '0'),
  }
}

export async function createAddon(data: any) {
  const res = await query(
    `INSERT INTO addons (name, description, edition, version, category, image_url, file_url, file_size, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [data.name, data.description, data.edition, data.version, data.category, data.image_url || null, data.file_url || null, data.file_size || 0, data.created_by || null]
  )
  return res.rows?.[0]
}

export async function recordDownload(addon_id: number, user_id?: number, ip?: string, user_agent?: string) {
  await query(`INSERT INTO addon_downloads (addon_id, user_id, ip_address, user_agent) VALUES ($1, $2, $3, $4)`, [addon_id, user_id || null, ip || null, user_agent || null])
  await query('UPDATE addons SET downloads = downloads + 1 WHERE id = $1', [addon_id])
  return { success: true }
}
