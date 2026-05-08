CREATE TABLE IF NOT EXISTS guilds (
  guild_id TEXT PRIMARY KEY,
  guild_name TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS guild_settings (
  guild_id TEXT PRIMARY KEY,
  default_channel_id TEXT,
  admin_role_id TEXT,
  timezone TEXT DEFAULT 'Europe/London',
  update_interval_minutes INTEGER DEFAULT 60,
  digest_enabled INTEGER DEFAULT 1,
  digest_time TEXT DEFAULT '09:00',
  live_results_enabled INTEGER DEFAULT 0,
  candidates_alerts_enabled INTEGER DEFAULT 1,
  polling_station_alerts_enabled INTEGER DEFAULT 1,
  civic_api_enabled INTEGER DEFAULT 0,
  embed_colour TEXT DEFAULT '#2f80ed',
  FOREIGN KEY (guild_id) REFERENCES guilds(guild_id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  type TEXT NOT NULL,
  postcode TEXT,
  election_id TEXT,
  constituency TEXT,
  council TEXT,
  region TEXT,
  enabled INTEGER DEFAULT 1,
  created_by TEXT,
  created_at TEXT,
  UNIQUE(guild_id, channel_id, type, postcode, election_id, constituency)
);

CREATE TABLE IF NOT EXISTS seen_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  subscription_id INTEGER,
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  first_seen_at TEXT,
  last_seen_at TEXT,
  UNIQUE(guild_id, source, external_id, content_hash)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details_json TEXT,
  created_at TEXT
);
