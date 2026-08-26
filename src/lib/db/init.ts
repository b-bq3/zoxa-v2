// ===== Initialize Neon Database Schema =====
import { query } from './neon'

export async function initializeDatabase() {
  try {
    console.log('Initializing Zoxa database schema...')

    await query(`CREATE TABLE IF NOT EXISTS addons (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT NOT NULL,
      edition VARCHAR(50) NOT NULL,
      version VARCHAR(50) NOT NULL,
      category VARCHAR(100) NOT NULL,
      image_url TEXT,
      file_url TEXT,
      file_size BIGINT DEFAULT 0,
      downloads BIGINT DEFAULT 0,
      created_by BIGINT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)
    console.log('✅ addons table created')

    await query(`CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      telegram_id BIGINT UNIQUE NOT NULL,
      username VARCHAR(255),
      addons_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)
    console.log('✅ users table created')

    await query(`CREATE TABLE IF NOT EXISTS addon_downloads (
      id BIGSERIAL PRIMARY KEY,
      addon_id BIGINT NOT NULL REFERENCES addons(id) ON DELETE CASCADE,
      user_id BIGINT REFERENCES users(id),
      ip_address VARCHAR(45),
      user_agent TEXT,
      downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)
    console.log('✅ addon_downloads table created')

    await query('CREATE INDEX IF NOT EXISTS idx_addons_created ON addons(created_at DESC)')
    await query('CREATE INDEX IF NOT EXISTS idx_addons_category ON addons(category)')
    await query('CREATE INDEX IF NOT EXISTS idx_addons_edition ON addons(edition)')
    await query('CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_id)')
    await query('CREATE INDEX IF NOT EXISTS idx_downloads_addon ON addon_downloads(addon_id)')
    console.log('✅ indexes created')

    console.log('🎉 Database initialized successfully!')
    return { success: true }
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message)
    throw error
  }
}
