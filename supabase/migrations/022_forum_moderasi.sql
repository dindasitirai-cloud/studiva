-- ═══════════════════════════════════════════════════════════════════════════
-- 022 — Forum: moderasi admin + tanda "dilaporkan"  [idempoten]
-- Admin dikenali dari JWT app_metadata.role = 'admin' (lihat AuthContext.peranStaf).
-- Admin boleh: baca semua (termasuk disembunyikan), ubah status/pin, hapus apa pun,
-- posting pengumuman (is_announcement=true) & balasan "Tim Studiva" (is_support=true).
-- Saat ada laporan masuk, thread otomatis ditandai 'dilaporkan' (trigger).
-- Aman dijalankan ulang. Jalankan SETELAH 021.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── forum_thread (admin) ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "forum_thread admin baca semua" ON forum_thread;
CREATE POLICY "forum_thread admin baca semua" ON forum_thread FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "forum_thread admin ubah" ON forum_thread;
CREATE POLICY "forum_thread admin ubah" ON forum_thread FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "forum_thread admin hapus" ON forum_thread;
CREATE POLICY "forum_thread admin hapus" ON forum_thread FOR DELETE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "forum_thread admin tulis" ON forum_thread;
CREATE POLICY "forum_thread admin tulis" ON forum_thread FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── forum_balasan (admin) ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "forum_balasan admin baca semua" ON forum_balasan;
CREATE POLICY "forum_balasan admin baca semua" ON forum_balasan FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "forum_balasan admin tulis" ON forum_balasan;
CREATE POLICY "forum_balasan admin tulis" ON forum_balasan FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "forum_balasan admin hapus" ON forum_balasan;
CREATE POLICY "forum_balasan admin hapus" ON forum_balasan FOR DELETE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── forum_laporan (admin baca semua untuk tinjauan) ───────────────────────
DROP POLICY IF EXISTS "forum_laporan admin baca" ON forum_laporan;
CREATE POLICY "forum_laporan admin baca" ON forum_laporan FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── Trigger: laporan masuk → tandai thread 'dilaporkan' (bila masih 'aktif') ──
CREATE OR REPLACE FUNCTION tandai_thread_dilaporkan() RETURNS TRIGGER
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.thread_id IS NOT NULL THEN
    UPDATE forum_thread SET status = 'dilaporkan' WHERE id = NEW.thread_id AND status = 'aktif';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_forum_laporan_tandai ON forum_laporan;
CREATE TRIGGER trg_forum_laporan_tandai AFTER INSERT ON forum_laporan
  FOR EACH ROW EXECUTE FUNCTION tandai_thread_dilaporkan();
