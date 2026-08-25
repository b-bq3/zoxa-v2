-- ===== Zoxa — SQL Indexes + Functions =====
CREATE INDEX IF NOT EXISTS idx_addons_category_created_desc ON addons (category, created_at DESC) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_addons_downloads_rank ON addons (downloads DESC NULLS LAST, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_addons_cursor ON addons (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_addons_name_search ON addons (name) INCLUDE (id, version, mc_version, downloads, category, created_at, image_url);

CREATE OR REPLACE FUNCTION get_recent_addons(limit_count INT)
RETURNS TABLE (id INT, name TEXT, version TEXT, mc_version TEXT, downloads INT, category TEXT, created_at TIMESTAMPTZ, image_url TEXT, description TEXT, file_url TEXT, file_size INT, edition TEXT)
LANGUAGE sql STABLE AS $$
  SELECT id, name, version, mc_version, downloads, category, created_at, image_url, description, file_url, file_size, edition
  FROM addons ORDER BY created_at DESC LIMIT limit_count;
$$;

CREATE OR REPLACE FUNCTION get_all_addons(limit_count INT)
RETURNS TABLE (same as above) LANGUAGE sql STABLE AS $$
  SELECT id, name, version, mc_version, downloads, category, created_at, image_url, description, file_url, file_size, edition
  FROM addons ORDER BY created_at DESC LIMIT limit_count;
$$;

CREATE OR REPLACE FUNCTION search_addons(search_query TEXT, max_results INT)
RETURNS TABLE (same as above) LANGUAGE sql STABLE AS $$
  SELECT id, name, version, mc_version, downloads, category, created_at, image_url, description, file_url, file_size, edition
  FROM addons WHERE name ILIKE '%' || search_query || '%'
  ORDER BY downloads DESC NULLS LAST LIMIT max_results;
$$;

CREATE OR REPLACE FUNCTION get_stats()
RETURNS TABLE (addons_count BIGINT, total_downloads BIGINT) LANGUAGE sql STABLE AS $$
  SELECT COUNT(*)::BIGINT, COALESCE(SUM(downloads), 0)::BIGINT FROM addons;
$$;

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL, reason TEXT NOT NULL, old_data JSONB, new_data JSONB,
  ip_address INET, correlation_id UUID
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT WITH CHECK (true);