-- Studiva Website SQLite schema

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'teacher', 'admin')),
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  learning_style TEXT,
  parent_id INTEGER NOT NULL,
  enrollment_status TEXT NOT NULL DEFAULT 'not_enrolled' CHECK (enrollment_status IN ('enrolled_tier1', 'not_enrolled')),
  tier1_start_date DATE,
  school_class TEXT,
  assigned_teacher_id INTEGER,
  emergency_contact TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Join table: which teachers are assigned to which children
CREATE TABLE IF NOT EXISTS teacher_children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL,
  child_id INTEGER NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  UNIQUE (teacher_id, child_id)
);

CREATE TABLE IF NOT EXISTS daily_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  photos TEXT,
  category TEXT NOT NULL CHECK (category IN ('academics', 'behavior', 'therapy', 'social')),
  date DATE NOT NULL,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Parent-submitted insights about their child at home
CREATE TABLE IF NOT EXISTS parent_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL,
  parent_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('tier1', 'tier2')),
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'quarterly', 'yearly')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'manual')),
  stripe_subscription_id TEXT,
  amount_paid DECIMAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  subscription_id INTEGER NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('IDR', 'USD')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_id TEXT,
  payment_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS consultations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  child_id INTEGER NOT NULL,
  consultation_type TEXT NOT NULL CHECK (consultation_type IN ('online', 'offline')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'canceled')),
  consultation_date DATE,
  consultation_time TIME,
  notes TEXT,
  outcome_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);

-- Tier 2 parent requesting to enroll their child into the physical Tier 1 school.
-- Distinct from a Tier 1 self-serve signup: this goes through admin review/approval
-- rather than straight to Stripe checkout, since it involves school capacity/teacher
-- assignment rather than just payment.
CREATE TABLE IF NOT EXISTS enrollment_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  child_id INTEGER NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS discussions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'tier1', 'tier2', 'topic', 'fitri')),
  subcategory TEXT,
  is_anonymous INTEGER NOT NULL DEFAULT 0,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  is_solved INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discussion_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_anonymous INTEGER NOT NULL DEFAULT 0,
  is_marked_helpful INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS community_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  discussion_count INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discussion_tags (
  discussion_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (discussion_id, tag_id),
  FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES community_tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS community_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('discussion', 'comment')),
  reporter_id INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'rude', 'off-topic', 'inappropriate')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  reviewed_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS community_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  bio TEXT,
  is_champion INTEGER NOT NULL DEFAULT 0,
  is_expert INTEGER NOT NULL DEFAULT 0,
  expert_badge TEXT,
  discussions_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  likes_received INTEGER NOT NULL DEFAULT 0,
  joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Public-facing staff/expert profile (title, credentials, contact info) shown on
-- About/Consultation/Footer. Distinct from community_profiles, which is the
-- per-user forum identity (bio there is a short community-facing blurb, not
-- a professional bio). One row per admin user who has a public profile.
CREATE TABLE IF NOT EXISTS admin_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  credentials TEXT,
  bio TEXT,
  expertise_areas TEXT,
  phone TEXT,
  whatsapp_link TEXT,
  location TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Sensory', 'Social', 'Behavior', 'Academic', 'Therapy')),
  format TEXT NOT NULL CHECK (format IN ('article', 'video', 'checklist', 'template')),
  author TEXT NOT NULL,
  published_date DATE NOT NULL
);
