# ===== Zoxa Neon Setup Guide =====

## Step 1: Get Neon Connection String

Visit Neon console and get your DATABASE_URL from your project.
It should look like:
```
postgresql://neondb_owner:PASSWORD@HOSTNAME/neondb?sslmode=require
```

## Step 2: Create Database Schema

Once the app is deployed to Vercel, call the init endpoint:

```bash
curl -X POST https://zox-a.vercel.app/api/db-init \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET_KEY" \
  -H "Content-Type: application/json"
```

Or if running locally:

```bash
DATABASE_URL="postgresql://..." npm run db:init
```

## Step 3: Update Vercel Environment Variables

Add these to Vercel project settings:

```
DATABASE_URL=postgresql://neondb_owner:PASSWORD@HOSTNAME/neondb?sslmode=require
ADMIN_SECRET_KEY=your-secure-admin-key
NEXT_PUBLIC_SITE_URL=https://zox-a.vercel.app
```

## Step 4: Manual SQL Execution (Alternative)

If API init fails, run this SQL directly in Neon console:

```sql
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
);

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  addons_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addon_downloads (
  id BIGSERIAL PRIMARY KEY,
  addon_id BIGINT NOT NULL REFERENCES addons(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id),
  ip_address VARCHAR(45),
  user_agent TEXT,
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_addons_created ON addons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_addons_category ON addons(category);
CREATE INDEX IF NOT EXISTS idx_addons_edition ON addons(edition);
CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_downloads_addon ON addon_downloads(addon_id);
```

## Telegram Bot Commands

- `/add` — Upload new addon (7 steps)
- `/list` — Show latest addons
- `/search <query>` — Search addons
- `/stats` — Show statistics
- `/help` — Show help

## API Endpoints

- `GET /api/site?a=list` — List all addons
- `GET /api/site?a=search&q=query` — Search addons
- `GET /api/site?a=stats` — Get statistics
- `GET /api/site?a=addon&q=id` — Get addon by ID
- `POST /api/db-init` — Initialize database (requires admin token)

## Troubleshooting

### Bot not uploading addons
- Check DATABASE_URL is set correctly in Vercel
- Call `/api/db-init` to initialize schema
- Check Neon connection logs

### Search/List returning empty
- Make sure addons table is created
- Check if any addons have been uploaded

### Database connection errors
- Verify DATABASE_URL format
- Check Neon project is active
- Ensure SSL mode is enabled (`?sslmode=require`)
