CREATE TABLE IF NOT EXISTS cms (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('wordpress')),
  base_url TEXT NOT NULL,
  username TEXT NOT NULL,
  credentials_ref TEXT NOT NULL,
  last_published_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_cms_is_active
ON cms (is_active);

CREATE INDEX IF NOT EXISTS idx_cms_last_published_at
ON cms (last_published_at);
