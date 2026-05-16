CREATE TABLE IF NOT EXISTS pull_sources (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('rss', 'html')),
  source_url TEXT NOT NULL,
  class_identifiers JSONB,
  last_polled_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pull_sources_is_active
ON pull_sources (is_active);

CREATE INDEX IF NOT EXISTS idx_pull_sources_last_polled_at
ON pull_sources (last_polled_at);
