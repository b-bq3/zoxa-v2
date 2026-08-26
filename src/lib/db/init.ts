// ===== Initialize Neon Database Schema =====
import { pool } from './neon'

export async function initializeDatabase() {
  try {
    console.log('Initializing Zoxa database schema...')

    // Create addons table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS addons (
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
      )
    `)
    console.log('✓ addons table created')

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        telegram_id BIGINT UNIQUE NOT NULL,
        username VARCHAR(255),
        addons_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✓ users table created')

    // Create addon_downloads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS addon_downloads (
        id BIGSERIAL PRIMARY KEY,
        addon_id BIGINT NOT NULL REFERENCES addons(id) ON DELETE CASCADE,
        user_id BIGINT REFERENCES users(id),
        ip_address VARCHAR(45),
        user_agent TEXT,
        downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✓ addon_downloads table created')

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_addons_created ON addons(created_at DESC)
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_addons_category ON addons(category)
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_addons_edition ON addons(edition)
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_id)
    `)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_downloads_addon ON addon_downloads(addon_id)
    `)
    console.log('✓ Indexes created')

    console.log('✓ Database schema initialized successfully!')
    return true
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}

// Run if executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
