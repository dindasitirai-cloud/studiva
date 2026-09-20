-- ═══════════════════════════════════════════════════════════════════════════
-- 021 — Forum komunitas (Bantu · tanya-jawab antar orang tua)  [idempoten]
-- Forum PUBLIK untuk pengguna terautentikasi: pertanyaan + balasan + laporan.
-- Moderasi (sembunyikan / pin / balasan "Tim Studiva" / pengumuman / hapus milik
-- orang lain) dilakukan ADMIN via service_role yang bypass RLS — konsisten dgn
-- pola admin_helpers (003). Aman dijalankan ulang.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS forum_thread (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id          UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  author_nama        TEXT NOT NULL DEFAULT 'Orang tua',
  judul              TEXT NOT NULL,
  isi                TEXT NOT NULL,
  is_support_request BOOLEAN NOT NULL DEFAULT false,
  is_announcement    BOOLEAN NOT NULL DEFAULT false,
  status             TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif','dilaporkan','disembunyikan')),
  pinned             BOOLEAN NOT NULL DEFAULT false,
  dibuat_pada        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_forum_thread_urut ON forum_thread (pinned DESC, dibuat_pada DESC);

CREATE TABLE IF NOT EXISTS forum_balasan (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id    UUID NOT NULL REFERENCES forum_thread(id) ON DELETE CASCADE,
  author_id    UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  author_nama  TEXT NOT NULL DEFAULT 'Orang tua',
  isi          TEXT NOT NULL,
  is_support   BOOLEAN NOT NULL DEFAULT false,
  dibuat_pada  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_forum_balasan_thread ON forum_balasan (thread_id, dibuat_pada);

CREATE TABLE IF NOT EXISTS forum_laporan (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id    UUID REFERENCES forum_thread(id) ON DELETE CASCADE,
  balasan_id   UUID REFERENCES forum_balasan(id) ON DELETE CASCADE,
  pelapor_id   UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  alasan       TEXT,
  dibuat_pada  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE forum_thread  ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_balasan ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_laporan ENABLE ROW LEVEL SECURITY;

-- ── forum_thread ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "forum_thread baca publik" ON forum_thread;
CREATE POLICY "forum_thread baca publik" ON forum_thread FOR SELECT TO authenticated
  USING (status <> 'disembunyikan');

DROP POLICY IF EXISTS "forum_thread tulis milik sendiri" ON forum_thread;
CREATE POLICY "forum_thread tulis milik sendiri" ON forum_thread FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND is_announcement = false);

DROP POLICY IF EXISTS "forum_thread ubah milik sendiri" ON forum_thread;
CREATE POLICY "forum_thread ubah milik sendiri" ON forum_thread FOR UPDATE TO authenticated
  USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "forum_thread hapus milik sendiri" ON forum_thread;
CREATE POLICY "forum_thread hapus milik sendiri" ON forum_thread FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- ── forum_balasan ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "forum_balasan baca" ON forum_balasan;
CREATE POLICY "forum_balasan baca" ON forum_balasan FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM forum_thread t WHERE t.id = forum_balasan.thread_id AND t.status <> 'disembunyikan'));

DROP POLICY IF EXISTS "forum_balasan tulis milik sendiri" ON forum_balasan;
CREATE POLICY "forum_balasan tulis milik sendiri" ON forum_balasan FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND is_support = false);

DROP POLICY IF EXISTS "forum_balasan hapus milik sendiri" ON forum_balasan;
CREATE POLICY "forum_balasan hapus milik sendiri" ON forum_balasan FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- ── forum_laporan ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "forum_laporan tulis" ON forum_laporan;
CREATE POLICY "forum_laporan tulis" ON forum_laporan FOR INSERT TO authenticated
  WITH CHECK (pelapor_id = auth.uid());

DROP POLICY IF EXISTS "forum_laporan baca sendiri" ON forum_laporan;
CREATE POLICY "forum_laporan baca sendiri" ON forum_laporan FOR SELECT TO authenticated
  USING (pelapor_id = auth.uid());

-- Moderasi admin: sembunyikan/pin/hapus milik orang lain, balasan is_support=true,
-- pengumuman is_announcement=true → lewat service_role (bypass RLS), belum ada RPC.
-- Verifikasi cepat (opsional):
-- SELECT to_regclass('public.forum_thread'), to_regclass('public.forum_balasan'), to_regclass('public.forum_laporan');
