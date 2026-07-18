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

CREATE TABLE IF NOT EXISTS knowledge_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  age_key TEXT NOT NULL,
  domain TEXT NOT NULL,
  title TEXT NOT NULL,
  photo_src TEXT,
  photo_alt TEXT,
  photo_credit TEXT,
  read_minutes INTEGER DEFAULT 2,
  is_medical INTEGER NOT NULL DEFAULT 0,
  terjadi TEXT NOT NULL DEFAULT '',
  penting TEXT NOT NULL DEFAULT '',
  lakukan TEXT NOT NULL DEFAULT '[]',
  perhatian TEXT NOT NULL DEFAULT '',
  sci_title TEXT,
  sci_read_minutes INTEGER,
  sci_paragraphs TEXT NOT NULL DEFAULT '[]',
  sources TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','IN_REVIEW','APPROVED','PUBLISHED')),
  reviewer_notes TEXT,
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at DATETIME,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS card_reads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, card_id)
);
CREATE INDEX IF NOT EXISTS idx_card_reads_user ON card_reads(user_id);

-- ── Learning Strategies content (admin-managed) ───────────────────────────────

CREATE TABLE IF NOT EXISTS ls_activities (
  id       INTEGER PRIMARY KEY,
  status   TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  data     TEXT NOT NULL DEFAULT '{}',   -- full Activity JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ls_plans (
  id       INTEGER PRIMARY KEY,
  status   TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  data     TEXT NOT NULL DEFAULT '{}',   -- full WeeklyPlan JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ls_tools (
  id       INTEGER PRIMARY KEY,
  status   TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  data     TEXT NOT NULL DEFAULT '{}',   -- full EduTool JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ls_downloads (
  id       INTEGER PRIMARY KEY,
  status   TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  data     TEXT NOT NULL DEFAULT '{}',   -- full Downloadable JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Knowledge Cards managed content (admin-editable, JSON blob) ───────────────

CREATE TABLE IF NOT EXISTS kc_managed (
  id     TEXT PRIMARY KEY,   -- string slug like "0-3m-fm"
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  data   TEXT NOT NULL DEFAULT '{}',  -- full KnowledgeCard JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CMS Content Tables — Fase 1 (seeded from static files)
-- Schema created in full now so Fase 2-4 only adds endpoints, never DDL.
-- ═══════════════════════════════════════════════════════════════════════════

-- Domain configuration (7 domains: FM, KG, BH, SE, KS, PS, DK)
CREATE TABLE IF NOT EXISTS cms_domains (
  code                TEXT PRIMARY KEY,   -- 'FM', 'KG', 'BH', 'SE', 'KS', 'PS', 'DK'
  label               TEXT NOT NULL,
  short_label         TEXT NOT NULL,
  bg                  TEXT NOT NULL,      -- hex background swatch
  fg                  TEXT NOT NULL,      -- hex foreground colour
  strict_freshness    INTEGER NOT NULL DEFAULT 0,  -- 1 = tighter review window (KS, DK)
  sensitive_disclaimer TEXT,
  attention_label     TEXT,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Canonical reference/source registry
CREATE TABLE IF NOT EXISTS cms_sources (
  id         TEXT PRIMARY KEY,   -- 'harvard-brain', 'cdc-act-early', etc.
  label      TEXT NOT NULL,
  url        TEXT,
  type       TEXT NOT NULL CHECK (type IN ('institusi','pedoman','karya-klasik','riset')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Figure metadata only — SVG stays in React component library
-- TODO(fase-4): migrate svg_source when figure editor is built
CREATE TABLE IF NOT EXISTS cms_figures (
  id          TEXT PRIMARY KEY,   -- 'serve-return', 'motor-sequence', etc.
  name        TEXT NOT NULL,      -- human-readable name
  aria_label  TEXT NOT NULL,      -- accessibility label
  svg_source  TEXT,               -- TODO(fase-4): NULL until editor migration
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reusable content modules (referenced by multiple cards)
CREATE TABLE IF NOT EXISTS cms_modules (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  domain_hints    TEXT NOT NULL DEFAULT '[]',   -- JSON array of DomainCode strings
  figure_id       TEXT REFERENCES cms_figures(id),
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','review','approved','published')),
  last_reviewed_at TEXT,   -- 'YYYY-MM'
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Module text sections; key is unique within a module
CREATE TABLE IF NOT EXISTS cms_module_sections (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id TEXT NOT NULL REFERENCES cms_modules(id) ON DELETE CASCADE,
  key       TEXT NOT NULL,
  judul     TEXT NOT NULL,
  isi       TEXT NOT NULL,   -- may contain [ref:sourceId] tokens
  sort      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (module_id, key)
);

-- Module numeric/text stats; key is unique within a module
CREATE TABLE IF NOT EXISTS cms_module_stats (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id TEXT NOT NULL REFERENCES cms_modules(id) ON DELETE CASCADE,
  key       TEXT NOT NULL,
  value     TEXT NOT NULL,
  label     TEXT NOT NULL,
  source_id TEXT REFERENCES cms_sources(id),
  sort      INTEGER NOT NULL DEFAULT 0,
  UNIQUE (module_id, key)
);

-- Many-to-many: which sources a module cites
CREATE TABLE IF NOT EXISTS cms_module_sources (
  module_id TEXT NOT NULL REFERENCES cms_modules(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES cms_sources(id) ON DELETE CASCADE,
  PRIMARY KEY (module_id, source_id)
);

-- Knowledge cards (CMS-managed, separate from legacy knowledge_cards table)
CREATE TABLE IF NOT EXISTS cms_cards (
  id                  TEXT PRIMARY KEY,   -- 'RL-0-3m-FM', etc.
  age_key             TEXT NOT NULL,
  domain              TEXT NOT NULL REFERENCES cms_domains(code),
  title               TEXT NOT NULL,
  read_minutes        INTEGER NOT NULL DEFAULT 2,
  is_medical          INTEGER NOT NULL DEFAULT 0,   -- 0/1 boolean
  -- summary: NULL = 'segera-hadir'; JSON = {terjadi,penting,lakukan,perhatian}
  summary             TEXT,
  -- figure metadata embedded on the card (resolved from figure_id at read time)
  figure_id           TEXT REFERENCES cms_figures(id),
  figure_caption      TEXT,
  figure_after_index  INTEGER,
  -- scientific header
  sci_title           TEXT NOT NULL,
  sci_read_minutes    INTEGER,
  reviewed_by_name    TEXT,
  reviewed_by_date    TEXT,   -- 'YYYY-MM'
  admin_status        TEXT NOT NULL DEFAULT 'published'
                        CHECK (admin_status IN ('draft','published')),
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cms_cards_age_domain ON cms_cards(age_key, domain);

-- Card scientific sections (ordered by sort)
-- type='module': references a module section (with optional overrides)
-- type='own':    inline text, not from a module
CREATE TABLE IF NOT EXISTS cms_card_sections (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id        TEXT NOT NULL REFERENCES cms_cards(id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN ('module','own')),
  sort           INTEGER NOT NULL DEFAULT 0,
  -- type='module'
  module_id      TEXT REFERENCES cms_modules(id),
  section_key    TEXT,
  judul_override TEXT,
  isi_override   TEXT,
  -- type='own'
  judul          TEXT,
  isi            TEXT,
  UNIQUE (card_id, sort)
);

-- Card scientific stats (ordered by sort)
-- type='module': references a module stat
-- type='own':    inline stat with explicit sourceId
-- type='legacy': plain ScientificStat with optional numeric ref (no sourceId)
CREATE TABLE IF NOT EXISTS cms_card_stats (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id   TEXT NOT NULL REFERENCES cms_cards(id) ON DELETE CASCADE,
  type      TEXT NOT NULL CHECK (type IN ('module','own','legacy')),
  sort      INTEGER NOT NULL DEFAULT 0,
  -- type='module'
  module_id TEXT REFERENCES cms_modules(id),
  stat_key  TEXT,
  -- type='own' and 'legacy'
  value     TEXT,
  label     TEXT,
  source_id TEXT REFERENCES cms_sources(id),
  ref       INTEGER,   -- legacy [n] citation number
  UNIQUE (card_id, sort)
);

-- Cover image per card (1:1)
CREATE TABLE IF NOT EXISTS cms_covers (
  card_id  TEXT PRIMARY KEY REFERENCES cms_cards(id) ON DELETE CASCADE,
  src      TEXT NOT NULL,
  alt      TEXT NOT NULL,
  credit   TEXT
);

-- ── CMS Workflow Tables (schema created now, populated Fase 2–3) ────────────

-- TODO(fase-2): source inspection log — filled when periodic check workflow built
CREATE TABLE IF NOT EXISTS cms_source_check_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id  TEXT NOT NULL REFERENCES cms_sources(id) ON DELETE CASCADE,
  checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  result     TEXT NOT NULL CHECK (result IN ('no-change','changed')),
  note       TEXT,
  url        TEXT,
  checked_by INTEGER REFERENCES users(id)
);

-- TODO(fase-2/3): content flags — filled when flag/review workflow built
CREATE TABLE IF NOT EXISTS cms_flags (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type TEXT NOT NULL CHECK (target_type IN ('card','module','source')),
  target_id   TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('source-change','forum-report','manual')),
  reason      TEXT NOT NULL,
  source_id   TEXT REFERENCES cms_sources(id),
  note        TEXT,
  url         TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  resolved_by INTEGER REFERENCES users(id)
);

-- TODO(fase-3): version snapshots — filled when version history built
CREATE TABLE IF NOT EXISTS cms_versions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type TEXT NOT NULL CHECK (target_type IN ('card','module','source')),
  target_id   TEXT NOT NULL,
  version     INTEGER NOT NULL DEFAULT 1,
  snapshot    TEXT NOT NULL,   -- full JSON snapshot of the content at this version
  changed_by  INTEGER REFERENCES users(id),
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TODO(fase-2/3): review audit log — filled when review workflow built
CREATE TABLE IF NOT EXISTS cms_review_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type TEXT NOT NULL CHECK (target_type IN ('card','module')),
  target_id   TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('approved','marked-valid','flagged','updated')),
  reviewer    INTEGER REFERENCES users(id),
  note        TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Rekah Digital — Tabel Persistensi (Build 5)
-- Semua tabel ber-kolom user_id → scoped per akun (MVP: 1 profil per user).
-- TODO: multi-anak pasca-MVP — tambah child_id FK.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Profil Rekah (1 baris per user)
CREATE TABLE IF NOT EXISTS rekah_profiles (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL UNIQUE,
  profile_json TEXT NOT NULL,
  current_week INTEGER NOT NULL DEFAULT 1,
  musim_ke     INTEGER NOT NULL DEFAULT 1,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Langkah selesai per pekan
CREATE TABLE IF NOT EXISTS rekah_completions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL,
  module_id    TEXT NOT NULL,
  selesai_pada DATETIME NOT NULL,
  minggu_ke    INTEGER NOT NULL,
  musim_ke     INTEGER NOT NULL DEFAULT 1,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, module_id, minggu_ke, musim_ke),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_rekah_completions_user ON rekah_completions(user_id, musim_ke, minggu_ke);

-- 3. Refleksi per langkah (CeritaHariIni)
CREATE TABLE IF NOT EXISTS rekah_reflections (
  id               TEXT PRIMARY KEY,
  user_id          INTEGER NOT NULL,
  module_id        TEXT NOT NULL,
  tanggal          TEXT NOT NULL,
  respon_anak      TEXT NOT NULL CHECK (respon_anak IN ('seru','menantang','belum-tertarik')),
  mood_caregiver   TEXT CHECK (mood_caregiver IN ('lega','biasa','lelah')),
  catatan          TEXT,
  nilai_utama      TEXT,
  simpan_ke_jurnal INTEGER NOT NULL DEFAULT 0,
  musim_ke         INTEGER NOT NULL DEFAULT 1,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_rekah_reflections_user ON rekah_reflections(user_id, musim_ke);

-- 4. Arsip musim selesai
CREATE TABLE IF NOT EXISTS rekah_seasons (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL,
  musim_ke       INTEGER NOT NULL,
  nilai_fokus    TEXT NOT NULL,
  mulai          TEXT NOT NULL,
  selesai        TEXT NOT NULL,
  total_langkah  INTEGER NOT NULL DEFAULT 0,
  refleksi_musim TEXT,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Jurnal privat per user
CREATE TABLE IF NOT EXISTS rekah_journal_entries (
  id         TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  judul      TEXT NOT NULL,
  catatan    TEXT NOT NULL,
  tanggal    TEXT NOT NULL,
  nilai_id   TEXT,
  tag        TEXT CHECK (tag IN ('refleksi','penutup-musim','manual')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_rekah_journal_user ON rekah_journal_entries(user_id);

-- 6. Rencana pekan yang dimodifikasi user (Ganti/Tambah langkah)
CREATE TABLE IF NOT EXISTS rekah_week_plans (
  id          TEXT PRIMARY KEY,
  user_id     INTEGER NOT NULL,
  musim_ke    INTEGER NOT NULL DEFAULT 1,
  minggu_ke   INTEGER NOT NULL DEFAULT 1,
  module_ids  TEXT NOT NULL, -- JSON array of moduleId strings, ordered
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, musim_ke, minggu_ke),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_rekah_week_plans_user ON rekah_week_plans(user_id, musim_ke, minggu_ke);
