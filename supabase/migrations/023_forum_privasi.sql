-- ═══════════════════════════════════════════════════════════════════════════
-- 023 — Forum: pertanyaan privat (Tanya ke Psikolog)  [idempoten]
-- Menambah kolom `privasi` pada forum_thread. 'privat' = hanya penanya + admin
-- (psikolog) yang bisa melihat; 'publik' = tampil di forum seperti biasa.
-- Jalankan SETELAH 021 & 022. Aman diulang.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE forum_thread
  ADD COLUMN IF NOT EXISTS privasi TEXT NOT NULL DEFAULT 'publik'
  CHECK (privasi IN ('publik','privat'));

-- Baca publik: hanya thread publik & tidak disembunyikan.
DROP POLICY IF EXISTS "forum_thread baca publik" ON forum_thread;
CREATE POLICY "forum_thread baca publik" ON forum_thread FOR SELECT TO authenticated
  USING (status <> 'disembunyikan' AND privasi = 'publik');

-- Penanya boleh membaca thread privat miliknya sendiri.
DROP POLICY IF EXISTS "forum_thread baca privat sendiri" ON forum_thread;
CREATE POLICY "forum_thread baca privat sendiri" ON forum_thread FOR SELECT TO authenticated
  USING (privasi = 'privat' AND author_id = auth.uid());

-- Balasan: terlihat bila thread publik & tidak disembunyikan, ATAU thread privat milik sendiri.
DROP POLICY IF EXISTS "forum_balasan baca" ON forum_balasan;
CREATE POLICY "forum_balasan baca" ON forum_balasan FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM forum_thread t
    WHERE t.id = forum_balasan.thread_id
      AND t.status <> 'disembunyikan'
      AND (t.privasi = 'publik' OR t.author_id = auth.uid())
  ));

-- Catatan: policy admin (022) tetap melihat semua thread/balasan (role='admin'),
-- jadi psikolog/admin dapat menjawab pertanyaan privat.
