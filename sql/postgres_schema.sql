-- Community Financial Empowerment Platform (Mecheda, Purba Medinipur, West Bengal)
-- Production PostgreSQL / Supabase Migration Blueprint with Row Level Security (RLS)
-- Note: Strictly avoids collecting sensitive Aadhaar numbers, UPI PINs, OTPs, or banking credentials.

CREATE TYPE verification_status AS ENUM (
  'Pending Verification',
  'Verified',
  'Needs Review',
  'Expired',
  'Rejected'
);

CREATE TYPE admin_role_type AS ENUM (
  'user',
  'content_reviewer',
  'content_admin',
  'super_admin'
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role admin_role_type NOT NULL DEFAULT 'user',
  town TEXT DEFAULT 'Mecheda, Purba Medinipur',
  preferred_language TEXT NOT NULL DEFAULT 'bn',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  employer_name TEXT NOT NULL,
  description_bn TEXT NOT NULL,
  description_en TEXT NOT NULL,
  salary_min INTEGER DEFAULT 0,
  salary_max INTEGER DEFAULT 0,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  qualification TEXT NOT NULL,
  experience TEXT,
  working_hours TEXT,
  application_instructions TEXT,
  contact_info TEXT,
  application_url TEXT,
  deadline TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  source_name TEXT NOT NULL,
  source_url TEXT,
  verification_status verification_status NOT NULL DEFAULT 'Pending Verification',
  date_verified DATE,
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
  reviewer TEXT,
  expiry_date DATE,
  views_count INTEGER NOT NULL DEFAULT 0,
  referrals_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_jobs_status_cat ON jobs (verification_status, category);
CREATE INDEX idx_jobs_location ON jobs (location);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  provider TEXT NOT NULL,
  category TEXT NOT NULL,
  description_en TEXT NOT NULL,
  duration TEXT,
  fees TEXT,
  is_free BOOLEAN NOT NULL DEFAULT TRUE,
  eligibility TEXT,
  mode TEXT NOT NULL DEFAULT 'Online',
  location TEXT,
  application_url TEXT NOT NULL,
  certification TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  verification_status verification_status NOT NULL DEFAULT 'Pending Verification',
  date_verified DATE,
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
  reviewer TEXT,
  expiry_date DATE
);

CREATE INDEX idx_courses_status_free ON courses (verification_status, is_free, category);

CREATE TABLE IF NOT EXISTS schemes (
  id TEXT PRIMARY KEY,
  official_name_bn TEXT NOT NULL,
  official_name_en TEXT NOT NULL,
  department_en TEXT NOT NULL,
  scope TEXT NOT NULL,
  category TEXT NOT NULL,
  description_en TEXT NOT NULL,
  benefits_en TEXT NOT NULL,
  eligibility_en TEXT NOT NULL,
  required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  application_process_en TEXT NOT NULL,
  official_website TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  verification_status verification_status NOT NULL DEFAULT 'Pending Verification',
  date_verified DATE,
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
  reviewer TEXT,
  expiry_date DATE
);

CREATE INDEX idx_schemes_scope_cat ON schemes (verification_status, scope, category);

CREATE TABLE IF NOT EXISTS business_profiles (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  description_en TEXT NOT NULL,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  contact_info TEXT,
  operating_hours TEXT,
  website_or_social TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  verification_status verification_status NOT NULL DEFAULT 'Pending Verification',
  submitted_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  date_verified DATE,
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
  reviewer TEXT
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, item_type, item_id)
);

CREATE TABLE IF NOT EXISTS savings_goals (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL,
  saved_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  monthly_contribution NUMERIC(12,2) NOT NULL DEFAULT 0,
  target_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_reports (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  report_type TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open',
  reviewed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback_submissions (
  id TEXT PRIMARY KEY,
  submission_type TEXT NOT NULL,
  name TEXT NOT NULL,
  contact TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT NOT NULL,
  body_bn TEXT NOT NULL,
  body_en TEXT NOT NULL,
  category TEXT NOT NULL,
  location_scope TEXT DEFAULT 'Mecheda, Purba Medinipur',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  published_at DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS content_verification_logs (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  previous_status verification_status NOT NULL,
  new_status verification_status NOT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_role admin_role_type NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) Examples for Public Read / Owner Write / Admin Moderate
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads verified jobs" ON jobs
  FOR SELECT USING (verification_status = 'Verified');

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own savings goals" ON savings_goals
  FOR ALL USING (auth.uid() = user_id);
