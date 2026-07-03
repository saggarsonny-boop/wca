-- Road Sponsorship Program — D1 schema
-- Run against wca-subscribers database (ID: f9e924d6-3547-4ba4-ac8d-005e95d36628)
-- Command: wrangler d1 execute wca-subscribers --file=_schema_sponsor.sql
--
-- facilities table below is seeded with 112 real, named BOP facilities
-- (camps, low, medium, high, and administrative: FMC/MDC/MCC/FDC/FTC/MCFP/
-- ADMAX), provided directly by the site owner. Some facilities share a
-- physical address with a sibling unit at the same complex (e.g. FCI
-- Coleman Low / Medium and USP Coleman I/II are all at 846 N.E. 19th Dr,
-- Sumterville, FL — they are separate housing units within one complex).
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
  ('fci-aliceville', 'FCI Aliceville', 'low', '1100 Industrial Rd', 'Aliceville', 'AL', '35442', 'low', 1),
  ('fci-allenwood-low', 'FCI Allenwood Low', 'low', '1 Main Dr', 'Allenwood', 'PA', '17810', 'low', 1),
  ('fci-ashland', 'FCI Ashland', 'low', '601 State Route 716', 'Ashland', 'KY', '41105', 'low', 1),
  ('fci-bastrop', 'FCI Bastrop', 'low', '1341 Highway 95 North', 'Bastrop', 'TX', '78602', 'low', 1),
  ('fci-beaumont-low', 'FCI Beaumont Low', 'low', '5560 Knauth Rd', 'Beaumont', 'TX', '77705', 'low', 1),
  ('fci-big-spring', 'FCI Big Spring', 'low', '1900 Simler Ave', 'Big Spring', 'TX', '79720', 'low', 1),
  ('fci-butner-low', 'FCI Butner Low', 'low', '2000 Old Granville Rd', 'Butner', 'NC', '27509', 'low', 1),
  ('fci-coleman-low', 'FCI Coleman Low', 'low', '846 N.E. 19th Dr', 'Sumterville', 'FL', '33585', 'low', 1),
  ('fci-danbury', 'FCI Danbury', 'low', '33 Pembroke Rd', 'Danbury', 'CT', '06811', 'low', 1),
  ('fci-elkton', 'FCI Elkton', 'low', '8730 Scroggs Rd', 'Lisbon', 'OH', '44432', 'low', 1),
  ('fci-englewood', 'FCI Englewood', 'low', '9595 West Quincy Ave', 'Littleton', 'CO', '80123', 'low', 1),
  ('fci-forrest-city-low', 'FCI Forrest City Low', 'low', '1400 Dale Bumpers Rd', 'Forrest City', 'AR', '72335', 'low', 1),
  ('fci-fort-dix', 'FCI Fort Dix', 'low', '5756 Hartford Rd', 'Fort Dix', 'NJ', '08640', 'low', 1),
  ('fci-herlong', 'FCI Herlong', 'low', '741-925 Federal Way', 'Herlong', 'CA', '96113', 'low', 1),
  ('fci-la-tuna', 'FCI La Tuna', 'low', '8500 Doniphan Dr', 'Anthony', 'TX', '79821', 'low', 1),
  ('fci-loretto', 'FCI Loretto', 'low', '772 St. Elmo Rd', 'Loretto', 'PA', '15940', 'low', 1),
  ('fci-milan', 'FCI Milan', 'low', '4004 East Arkona Rd', 'Milan', 'MI', '48160', 'low', 1),
  ('fci-petersburg-low', 'FCI Petersburg Low', 'low', '1100 River Rd', 'Petersburg', 'VA', '23803', 'low', 1),
  ('fci-ray-brook', 'FCI Ray Brook', 'low', '128 Ray Brook Rd', 'Ray Brook', 'NY', '12977', 'low', 1),
  ('fci-safford', 'FCI Safford', 'low', '1529 West Highway 366', 'Safford', 'AZ', '85546', 'low', 1),
  ('fci-seagoville', 'FCI Seagoville', 'low', '2113 North Hwy 175', 'Seagoville', 'TX', '75159', 'low', 1),
  ('fci-tallahassee', 'FCI Tallahassee', 'low', '501 Capital Circle NE', 'Tallahassee', 'FL', '32301', 'low', 1),
  ('fci-waseca', 'FCI Waseca', 'low', '1000 University Dr SW', 'Waseca', 'MN', '56093', 'low', 1),
  ('fci-allenwood-medium', 'FCI Allenwood Medium', 'medium', '2 Main Dr', 'Allenwood', 'PA', '17810', 'medium', 1),
  ('fci-atlanta', 'FCI Atlanta', 'medium', '601 McDonough Blvd SE', 'Atlanta', 'GA', '30315', 'medium', 1),
  ('fci-beaumont-medium', 'FCI Beaumont Medium', 'medium', '5560 Knauth Rd', 'Beaumont', 'TX', '77705', 'medium', 1),
  ('fci-beckley', 'FCI Beckley', 'medium', '1600 Industrial Park Rd', 'Beaver', 'WV', '25813', 'medium', 1),
  ('fci-bennettsville', 'FCI Bennettsville', 'medium', '1200 Legette Rd', 'Bennettsville', 'SC', '29512', 'medium', 1),
  ('fci-berlin', 'FCI Berlin', 'medium', '116 Corporate Dr', 'Berlin', 'NH', '03570', 'medium', 1),
  ('fci-butner-medium-i', 'FCI Butner Medium I', 'medium', '2200 Old Granville Rd', 'Butner', 'NC', '27509', 'medium', 1),
  ('fci-butner-medium-ii', 'FCI Butner Medium II', 'medium', '2400 Old Granville Rd', 'Butner', 'NC', '27509', 'medium', 1),
  ('fci-coleman-medium', 'FCI Coleman Medium', 'medium', '846 N.E. 19th Dr', 'Sumterville', 'FL', '33585', 'medium', 1),
  ('fci-cumberland', 'FCI Cumberland', 'medium', '14601 Burbridge Rd SE', 'Cumberland', 'MD', '21502', 'medium', 1),
  ('fci-edgefield', 'FCI Edgefield', 'medium', '501 Gary Hill Rd', 'Edgefield', 'SC', '29824', 'medium', 1),
  ('fci-el-reno', 'FCI El Reno', 'medium', '4205 Highway 66 West', 'El Reno', 'OK', '73036', 'medium', 1),
  ('fci-estill', 'FCI Estill', 'medium', '100 Prison Rd', 'Estill', 'SC', '29918', 'medium', 1),
  ('fci-fairton', 'FCI Fairton', 'medium', '655 Fairton-Millville Rd', 'Fairton', 'NJ', '08320', 'medium', 1),
  ('fci-florence', 'FCI Florence', 'medium', '5880 Hwy 67 South', 'Florence', 'CO', '81226', 'medium', 1),
  ('fci-forrest-city-medium', 'FCI Forrest City Medium', 'medium', '1400 Dale Bumpers Rd', 'Forrest City', 'AR', '72335', 'medium', 1),
  ('fci-gilmer', 'FCI Gilmer', 'medium', '201 FCI Lane', 'Glenville', 'WV', '26351', 'medium', 1),
  ('fci-greenville', 'FCI Greenville', 'medium', '100 U.S. Highway 40', 'Greenville', 'IL', '62246', 'medium', 1),
  ('fci-hazelton', 'FCI Hazelton', 'medium', '1640 Sky View Dr', 'Bruceton Mills', 'WV', '26525', 'medium', 1),
  ('fci-jesup', 'FCI Jesup', 'medium', '2680 Highway 301 South', 'Jesup', 'GA', '31599', 'medium', 1),
  ('fci-leavenworth', 'FCI Leavenworth', 'medium', '1300 Metropolitan Ave', 'Leavenworth', 'KS', '66048', 'medium', 1),
  ('fci-lewisburg', 'FCI Lewisburg', 'medium', '2400 Route 15', 'Lewisburg', 'PA', '17837', 'medium', 1),
  ('fci-lompoc-i', 'FCI Lompoc I', 'medium', '3600 Guard Rd', 'Lompoc', 'CA', '93436', 'medium', 1),
  ('fci-lompoc-ii', 'FCI Lompoc II', 'medium', '3600 Guard Rd', 'Lompoc', 'CA', '93436', 'medium', 1),
  ('fci-manchester', 'FCI Manchester', 'medium', '805 Fox Hollow Rd', 'Manchester', 'KY', '40962', 'medium', 1),
  ('fci-marianna', 'FCI Marianna', 'medium', '3625 Pepper Dr', 'Marianna', 'FL', '32446', 'medium', 1),
  ('fci-marion', 'FCI Marion', 'medium', '4500 Prison Rd', 'Marion', 'IL', '62959', 'medium', 1),
  ('fci-mcdowell', 'FCI McDowell', 'medium', '101 Federal Dr', 'Welch', 'WV', '24801', 'medium', 1),
  ('fci-mckean', 'FCI McKean', 'medium', '6975 Route 59', 'Lewis Run', 'PA', '16738', 'medium', 1),
  ('fci-memphis', 'FCI Memphis', 'medium', '1101 John A Denie Rd', 'Memphis', 'TN', '38134', 'medium', 1),
  ('fci-mendota', 'FCI Mendota', 'medium', '33500 West California Ave', 'Mendota', 'CA', '93640', 'medium', 1),
  ('fci-miami', 'FCI Miami', 'medium', '15801 SW 137th Ave', 'Miami', 'FL', '33177', 'medium', 1),
  ('fci-otisville', 'FCI Otisville', 'medium', '26 Mile Rd', 'Otisville', 'NY', '10963', 'medium', 1),
  ('fci-oxford', 'FCI Oxford', 'medium', 'Valley Rd', 'Oxford', 'WI', '53952', 'medium', 1),
  ('fci-pekin', 'FCI Pekin', 'medium', '1200 River Rd', 'Pekin', 'IL', '61554', 'medium', 1),
  ('fci-petersburg-medium', 'FCI Petersburg Medium', 'medium', '1100 River Rd', 'Petersburg', 'VA', '23803', 'medium', 1),
  ('fci-phoenix', 'FCI Phoenix', 'medium', '37900 N 45th Ave', 'Phoenix', 'AZ', '85086', 'medium', 1),
  ('fci-pollock', 'FCI Pollock', 'medium', '1000 Airbase Rd', 'Pollock', 'LA', '71467', 'medium', 1),
  ('fci-sandstone', 'FCI Sandstone', 'medium', '2300 County Rd 29', 'Sandstone', 'MN', '55072', 'medium', 1),
  ('fci-schuylkill', 'FCI Schuylkill', 'medium', 'Interstate 81 & 901 W', 'Minersville', 'PA', '17954', 'medium', 1),
  ('fci-sheridan', 'FCI Sheridan', 'medium', '27072 Ballston Rd', 'Sheridan', 'OR', '97378', 'medium', 1),
  ('fci-talladega', 'FCI Talladega', 'medium', '565 East Renfroe Rd', 'Talladega', 'AL', '35160', 'medium', 1),
  ('fci-texarkana', 'FCI Texarkana', 'medium', '4001 Leopard Dr', 'Texarkana', 'TX', '75501', 'medium', 1),
  ('fci-thomson', 'FCI Thomson', 'medium', '1100 One Thousand Rd', 'Thomson', 'IL', '61285', 'medium', 1),
  ('fci-three-rivers', 'FCI Three Rivers', 'medium', '1400 Highway 72 West', 'Three Rivers', 'TX', '78071', 'medium', 1),
  ('fci-tucson', 'FCI Tucson', 'medium', '9300 South Wilmot Rd', 'Tucson', 'AZ', '85756', 'medium', 1),
  ('fci-victorville-medium-i', 'FCI Victorville Medium I', 'medium', '13777 Air Expressway', 'Victorville', 'CA', '92394', 'medium', 1),
  ('fci-victorville-medium-ii', 'FCI Victorville Medium II', 'medium', '13777 Air Expressway', 'Victorville', 'CA', '92394', 'medium', 1),
  ('fci-williamsburg', 'FCI Williamsburg', 'medium', '830 Navy Way', 'Salters', 'SC', '29590', 'medium', 1),
  ('usp-allenwood', 'USP Allenwood', 'high', '3 Main Dr', 'Allenwood', 'PA', '17810', 'high', 1),
  ('usp-atwater', 'USP Atwater', 'high', '1 Federal Way', 'Atwater', 'CA', '95301', 'high', 1),
  ('usp-beaumont', 'USP Beaumont', 'high', '5560 Knauth Rd', 'Beaumont', 'TX', '77705', 'high', 1),
  ('usp-big-sandy', 'USP Big Sandy', 'high', '1197 State Route 3', 'Inez', 'KY', '41224', 'high', 1),
  ('usp-canaan', 'USP Canaan', 'high', '3052 Waymart Rd', 'Waymart', 'PA', '18472', 'high', 1),
  ('usp-coleman-i', 'USP Coleman I', 'high', '846 N.E. 19th Dr', 'Sumterville', 'FL', '33585', 'high', 1),
  ('usp-coleman-ii', 'USP Coleman II', 'high', '846 N.E. 19th Dr', 'Sumterville', 'FL', '33585', 'high', 1),
  ('usp-florence-high', 'USP Florence High', 'high', '5880 Hwy 67 South', 'Florence', 'CO', '81226', 'high', 1),
  ('usp-hazelton', 'USP Hazelton', 'high', '1640 Sky View Dr', 'Bruceton Mills', 'WV', '26525', 'high', 1),
  ('usp-lee', 'USP Lee', 'high', '351 Lee Paper Rd', 'Jonesville', 'VA', '24263', 'high', 1),
  ('usp-mccreary', 'USP McCreary', 'high', '330 Federal Rd', 'Pine Knot', 'KY', '42635', 'high', 1),
  ('usp-pollock', 'USP Pollock', 'high', '1000 Airbase Rd', 'Pollock', 'LA', '71467', 'high', 1),
  ('usp-terre-haute', 'USP Terre Haute', 'high', '4700 Bureau Rd North', 'Terre Haute', 'IN', '47808', 'high', 1),
  ('usp-tucson', 'USP Tucson', 'high', '9300 South Wilmot Rd', 'Tucson', 'AZ', '85756', 'high', 1),
  ('usp-victorville', 'USP Victorville', 'high', '13777 Air Expressway', 'Victorville', 'CA', '92394', 'high', 1),
  ('usp-florence-admax', 'USP Florence ADMAX', 'administrative', '5880 Hwy 67 South', 'Florence', 'CO', '81226', 'administrative', 1),
  ('fmc-butner', 'FMC Butner', 'administrative', '2600 Old Granville Rd', 'Butner', 'NC', '27509', 'administrative', 1),
  ('fmc-carswell', 'FMC Carswell', 'administrative', 'J Street, Bldg 3000', 'Fort Worth', 'TX', '76127', 'administrative', 1),
  ('fmc-devens', 'FMC Devens', 'administrative', '42 Patton Rd', 'Ayer', 'MA', '01432', 'administrative', 1),
  ('fmc-fort-worth', 'FMC Fort Worth', 'administrative', '3150 Horton Rd', 'Fort Worth', 'TX', '76119', 'administrative', 1),
  ('fmc-lexington', 'FMC Lexington', 'administrative', '3301 Leestown Rd', 'Lexington', 'KY', '40511', 'administrative', 1),
  ('fmc-rochester', 'FMC Rochester', 'administrative', '2110 East Center St', 'Rochester', 'MN', '55904', 'administrative', 1),
  ('mcfp-springfield', 'MCFP Springfield', 'administrative', '1900 W Sunshine St', 'Springfield', 'MO', '65807', 'administrative', 1),
  ('ftc-oklahoma-city', 'FTC Oklahoma City', 'administrative', '7400 S MacArthur Blvd', 'Oklahoma City', 'OK', '73169', 'administrative', 1),
  ('mdc-brooklyn', 'MDC Brooklyn', 'administrative', '80 29th St', 'Brooklyn', 'NY', '11232', 'administrative', 1),
  ('mdc-guaynabo', 'MDC Guaynabo', 'administrative', 'Highway 165, km 4.8', 'Guaynabo', 'PR', '00965', 'administrative', 1),
  ('mdc-los-angeles', 'MDC Los Angeles', 'administrative', '535 N Alameda St', 'Los Angeles', 'CA', '90012', 'administrative', 1),
  ('mcc-chicago', 'MCC Chicago', 'administrative', '71 W Van Buren St', 'Chicago', 'IL', '60605', 'administrative', 1),
  ('mcc-san-diego', 'MCC San Diego', 'administrative', '808 Union St', 'San Diego', 'CA', '92101', 'administrative', 1),
  ('fdc-honolulu', 'FDC Honolulu', 'administrative', '330 Elliot St', 'Honolulu', 'HI', '96819', 'administrative', 1),
  ('fdc-houston', 'FDC Houston', 'administrative', '1200 Texas Ave', 'Houston', 'TX', '77002', 'administrative', 1),
  ('fdc-miami', 'FDC Miami', 'administrative', '33 NE 4th St', 'Miami', 'FL', '33132', 'administrative', 1),
  ('fdc-philadelphia', 'FDC Philadelphia', 'administrative', '700 Arch St', 'Philadelphia', 'PA', '19106', 'administrative', 1),
  ('fdc-seatac', 'FDC SeaTac', 'administrative', '2425 S 200th St', 'Seattle', 'WA', '98198', 'administrative', 1);

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
  (1, 'Single Book', 'Sponsor one paperback book for a prison library', 1500, 1, '{"receipt":true}'),
  (2, 'Small Set', 'Sponsor 5 paperback books for a prison library', 7500, 5, '{"receipt":true,"thank_you_letter":true}'),
  (3, 'Library Set', 'Sponsor 10 paperback books for a prison library', 15000, 10, '{"receipt":true,"thank_you_letter":true,"recognition":true}'),
  (4, 'Full Library', 'Sponsor 25 paperback books for a prison library', 37500, 25, '{"receipt":true,"thank_you_letter":true,"recognition":true,"plaque":true}'),
  (5, 'Single Book (Hardcover)', 'Sponsor one hardcover book for a prison library', 2500, 1, '{"receipt":true}'),
  (6, 'Small Set (Hardcover)', 'Sponsor 5 hardcover books for a prison library', 12500, 5, '{"receipt":true,"thank_you_letter":true}'),
  (7, 'Library Set (Hardcover)', 'Sponsor 10 hardcover books for a prison library', 25000, 10, '{"receipt":true,"thank_you_letter":true,"recognition":true}'),
  (8, 'Full Library (Hardcover)', 'Sponsor 25 hardcover books for a prison library', 62500, 25, '{"receipt":true,"thank_you_letter":true,"recognition":true,"plaque":true}');

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
