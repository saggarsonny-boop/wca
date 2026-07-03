-- Road Sponsorship Program — D1 schema
-- Run against wca-subscribers database (ID: f9e924d6-3547-4ba4-ac8d-005e95d36628)
-- Command: wrangler d1 execute wca-subscribers --file=_schema_sponsor.sql
--
-- IMPORTANT: the `facilities` table is intentionally left empty by this
-- schema. There is no verified source of the 122 federal BOP facility
-- addresses in this repo. Seed it separately once a real, checked list
-- (e.g. from bop.gov/locations/institutions) is available. Do not launch
-- the /sponsor page publicly until that data exists — a donor's payment
-- should never be tied to a fabricated or unverified facility address.

CREATE TABLE IF NOT EXISTS facilities (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL,  -- camp | low | medium | high | administrative
  address       TEXT,
  city          TEXT,
  state         TEXT,
  zip           TEXT,
  phone         TEXT,
  region        TEXT,
  population    INTEGER,
  security_level TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_facilities_active ON facilities(is_active);
CREATE INDEX IF NOT EXISTS idx_facilities_state ON facilities(state);

CREATE TABLE IF NOT EXISTS sponsorship_tiers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  description   TEXT,
  amount_cents  INTEGER NOT NULL,
  book_count    INTEGER NOT NULL,
  features      TEXT,  -- JSON stored as text
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO sponsorship_tiers (id, name, description, amount_cents, book_count, features)
VALUES
  (1, 'Single Book', 'Sponsor one book for a prison library', 1500, 1, '{"receipt":true}'),
  (2, 'Small Set', 'Sponsor 5 books for a prison library', 7500, 5, '{"receipt":true,"thank_you_letter":true}'),
  (3, 'Library Set', 'Sponsor 10 books for a prison library', 15000, 10, '{"receipt":true,"thank_you_letter":true,"recognition":true}'),
  (4, 'Full Library', 'Sponsor 25 books for a prison library', 37500, 25, '{"receipt":true,"thank_you_letter":true,"recognition":true,"plaque":true}');

CREATE TABLE IF NOT EXISTS sponsorships (
  id                       TEXT PRIMARY KEY,
  facility_id              TEXT NOT NULL REFERENCES facilities(id),
  tier_id                  INTEGER REFERENCES sponsorship_tiers(id),
  sponsor_name             TEXT NOT NULL,
  sponsor_email            TEXT NOT NULL,
  sponsor_phone            TEXT,
  amount_cents             INTEGER NOT NULL,
  book_count               INTEGER NOT NULL DEFAULT 1,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id  TEXT,
  stripe_customer_id       TEXT,
  status                   TEXT NOT NULL DEFAULT 'pending', -- pending | paid | fulfilled | cancelled
  message                  TEXT,
  is_anonymous             INTEGER NOT NULL DEFAULT 0,
  created_at               TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at               TEXT,
  fulfilled_at             TEXT
);

CREATE INDEX IF NOT EXISTS idx_sponsorships_facility ON sponsorships(facility_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_status ON sponsorships(status);
CREATE INDEX IF NOT EXISTS idx_sponsorships_email ON sponsorships(sponsor_email);
CREATE INDEX IF NOT EXISTS idx_sponsorships_session ON sponsorships(stripe_checkout_session_id);
