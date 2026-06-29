-- WCA Case Organiser — D1 schema
-- Run against wca-subscribers database (ID: f9e924d6-3547-4ba4-ac8d-005e95d36628)
-- Command: wrangler d1 execute wca-subscribers --file=_schema_organiser.sql

CREATE TABLE IF NOT EXISTS organiser_users (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  email               TEXT NOT NULL UNIQUE,
  password_hash       TEXT NOT NULL,
  password_salt       TEXT NOT NULL,
  subscription_status TEXT NOT NULL DEFAULT 'trial',  -- trial | active | past_due | cancelled | lifetime
  trial_ends_at       TEXT,
  stripe_customer_id  TEXT,
  created_at          TEXT NOT NULL,
  updated_at          TEXT
);

CREATE INDEX IF NOT EXISTS idx_organiser_users_email ON organiser_users(email);
CREATE INDEX IF NOT EXISTS idx_organiser_users_stripe ON organiser_users(stripe_customer_id);

CREATE TABLE IF NOT EXISTS organiser_case_files (
  user_id     INTEGER PRIMARY KEY REFERENCES organiser_users(id) ON DELETE CASCADE,
  data_enc    TEXT NOT NULL,  -- AES-GCM encrypted JSON blob
  updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS organiser_dates (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES organiser_users(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  date_val    TEXT NOT NULL,  -- ISO 8601 date: YYYY-MM-DD
  note        TEXT,
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_organiser_dates_user ON organiser_dates(user_id, date_val);

CREATE TABLE IF NOT EXISTS organiser_documents (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES organiser_users(id) ON DELETE CASCADE,
  filename    TEXT NOT NULL,
  size_bytes  INTEGER NOT NULL,
  r2_key      TEXT NOT NULL UNIQUE,
  uploaded_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_organiser_docs_user ON organiser_documents(user_id);

CREATE TABLE IF NOT EXISTS organiser_ai_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES organiser_users(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_organiser_ai_log_user ON organiser_ai_log(user_id, created_at);
