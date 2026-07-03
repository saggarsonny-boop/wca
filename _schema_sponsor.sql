-- Road Sponsorship Program — D1 schema
-- Run against wca-subscribers database (ID: f9e924d6-3547-4ba4-ac8d-005e95d36628)
-- Command: wrangler d1 execute wca-subscribers --file=_schema_sponsor.sql
--
-- facilities table below is seeded with 41 real, named BOP facilities
-- (camps, low, medium, high) provided directly by the site owner. This is
-- a partial list, not the full 122 — no administrative complexes (FCC/FMC/
-- FDC/FTC) are included, since the ones offered shared identical addresses
-- with facilities already listed (e.g. FCC Coleman = USP Coleman's address)
-- and would confuse a donor about which library actually receives books.
-- Add more via the admin panel (/sponsor-admin.html) as they're confirmed,
-- or re-run this file with additional INSERT OR IGNORE rows.

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

INSERT OR IGNORE INTO facilities (id, name, type, address, city, state, zip, security_level, is_active) VALUES
  ('fpc-alderson', 'FPC Alderson', 'camp', 'Glen Ray Rd.', 'Alderson', 'WV', '24910', 'minimum', 1),
  ('fpc-bryan', 'FPC Bryan', 'camp', '1100 Ursuline Ave', 'Bryan', 'TX', '77803', 'minimum', 1),
  ('fpc-duluth', 'FPC Duluth', 'camp', '5302 Army Lake Rd', 'Duluth', 'MN', '55811', 'minimum', 1),
  ('fpc-montgomery', 'FPC Montgomery', 'camp', 'Maxwell Air Force Base', 'Montgomery', 'AL', '36112', 'minimum', 1),
  ('fpc-morgantown', 'FPC Morgantown', 'camp', '446 Green Bag Rd', 'Morgantown', 'WV', '26501', 'minimum', 1),
  ('fpc-yankton', 'FPC Yankton', 'camp', '1016 Douglas Ave', 'Yankton', 'SD', '57078', 'minimum', 1),
  ('fci-allenwood-low', 'FCI Allenwood Low', 'low', '1 Main Dr', 'Allenwood', 'PA', '17810', 'low', 1),
  ('fci-ashland', 'FCI Ashland', 'low', '601 State Route 716', 'Ashland', 'KY', '41105', 'low', 1),
  ('fci-beaumont-low', 'FCI Beaumont Low', 'low', '5560 Knauth Rd', 'Beaumont', 'TX', '77705', 'low', 1),
  ('fci-butner-low', 'FCI Butner Low', 'low', '2000 Old Granvile Rd', 'Butner', 'NC', '27509', 'low', 1),
  ('fci-coleman-low', 'FCI Coleman Low', 'low', '846 N.E. 19th Dr', 'Sumterville', 'FL', '35585', 'low', 1),
  ('fci-elkton', 'FCI Elkton', 'low', '8730 Scroggs Rd', 'Lisbon', 'OH', '44432', 'low', 1),
  ('fci-forrest-city-low', 'FCI Forrest City Low', 'low', '1400 Dale Bumpers Rd', 'Forrest City', 'AR', '72335', 'low', 1),
  ('fci-fort-dix', 'FCI Fort Dix', 'low', '5756 Hartford Rd', 'Fort Dix', 'NJ', '08640', 'low', 1),
  ('fci-seagoville', 'FCI Seagoville', 'low', '2113 North Hwy 175', 'Seagoville', 'TX', '75159', 'low', 1),
  ('fci-terminal-island', 'FCI Terminal Island', 'low', '1299 Seaside Ave', 'San Pedro', 'CA', '90731', 'low', 1),
  ('fci-waseca', 'FCI Waseca', 'low', '1000 University Dr SW', 'Waseca', 'MN', '56093', 'low', 1),
  ('fci-allenwood-medium', 'FCI Allenwood Medium', 'medium', '2 Main Dr', 'Allenwood', 'PA', '17810', 'medium', 1),
  ('fci-beaumont-medium', 'FCI Beaumont Medium', 'medium', '5560 Knauth Rd', 'Beaumont', 'TX', '77705', 'medium', 1),
  ('fci-beckley', 'FCI Beckley', 'medium', '1600 Industrial Park Rd', 'Beaver', 'WV', '25813', 'medium', 1),
  ('fci-bennettsville', 'FCI Bennettsville', 'medium', '1200 Legette Rd', 'Bennettsville', 'SC', '29512', 'medium', 1),
  ('fci-cumberland', 'FCI Cumberland', 'medium', '14601 Burbridge Rd SE', 'Cumberland', 'MD', '21502', 'medium', 1),
  ('fci-edgefield', 'FCI Edgefield', 'medium', '501 Gary Hill Rd', 'Edgefield', 'SC', '29824', 'medium', 1),
  ('fci-el-reno', 'FCI El Reno', 'medium', '4205 Highway 66 West', 'El Reno', 'OK', '73036', 'medium', 1),
  ('fci-florence', 'FCI Florence', 'medium', '5880 Hwy 67 South', 'Florence', 'CO', '81226', 'medium', 1),
  ('fci-greenville', 'FCI Greenville', 'medium', '100 U.S. Highway 40', 'Greenville', 'IL', '62246', 'medium', 1),
  ('fci-hazelton', 'FCI Hazelton', 'medium', '1640 Sky View Dr', 'Bruceton Mills', 'WV', '26525', 'medium', 1),
  ('fci-marianna', 'FCI Marianna', 'medium', '3625 Pepper Dr', 'Marianna', 'FL', '32446', 'medium', 1),
  ('fci-memphis', 'FCI Memphis', 'medium', '1101 John A Denie Rd', 'Memphis', 'TN', '38134', 'medium', 1),
  ('fci-ray-brook', 'FCI Ray Brook', 'medium', '128 Ray Brook Rd', 'Ray Brook', 'NY', '12977', 'medium', 1),
  ('fci-talladega', 'FCI Talladega', 'medium', '565 East Renfroe Rd', 'Talladega', 'AL', '35160', 'medium', 1),
  ('usp-allenwood', 'USP Allenwood', 'high', '3 Main Dr', 'Allenwood', 'PA', '17810', 'high', 1),
  ('usp-atwater', 'USP Atwater', 'high', '1 Federal Way', 'Atwater', 'CA', '95301', 'high', 1),
  ('usp-big-sandy', 'USP Big Sandy', 'high', '1197 State Route 3', 'Inez', 'KY', '41224', 'high', 1),
  ('usp-canaan', 'USP Canaan', 'high', '3052 Waymart Rd', 'Waymart', 'PA', '18472', 'high', 1),
  ('usp-coleman', 'USP Coleman I & II', 'high', '846 N.E. 19th Dr', 'Sumterville', 'FL', '35585', 'high', 1),
  ('usp-florence', 'USP Florence High', 'high', '5880 Hwy 67 South', 'Florence', 'CO', '81226', 'high', 1),
  ('usp-hazelton', 'USP Hazelton', 'high', '1640 Sky View Dr', 'Bruceton Mills', 'WV', '26525', 'high', 1),
  ('usp-lee', 'USP Lee', 'high', '351 Lee Paper Rd', 'Jonesville', 'VA', '24263', 'high', 1),
  ('usp-mccreary', 'USP McCreary', 'high', '330 Federal Rd', 'Pine Knot', 'KY', '42635', 'high', 1),
  ('usp-pollock', 'USP Pollock', 'high', '1000 Airbase Rd', 'Pollock', 'LA', '71467', 'high', 1),
  ('usp-terre-haute', 'USP Terre Haute', 'high', '4700 Bureau Rd North', 'Terre Haute', 'IN', '47808', 'high', 1);

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

CREATE TABLE IF NOT EXISTS facility_requests (
  id              TEXT PRIMARY KEY,
  facility_name   TEXT NOT NULL,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  zip             TEXT,
  security_level  TEXT, -- camp | low | medium | high | administrative | unknown
  requestor_name  TEXT,
  requestor_email TEXT,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'pending', -- pending | approved | denied | duplicate
  verified_at     TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT
);

CREATE INDEX IF NOT EXISTS idx_facility_requests_status ON facility_requests(status);
CREATE INDEX IF NOT EXISTS idx_facility_requests_email ON facility_requests(requestor_email);
