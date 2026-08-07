-- ============================================================
-- Rekah — Row Level Security (RLS)
-- Migrasi: 002_rls_policies
--
-- Prinsip: setiap orang tua hanya bisa membaca dan mengubah
-- barisnya sendiri. Akses lintas orang tua diblokir database.
--
-- Pengujian wajib sebelum rilis:
--   1. Login sebagai Orang Tua A → coba SELECT dari tabel anak
--      dengan id_orang_tua milik Orang Tua B → harus 0 baris.
--   2. Script uji ada di supabase/tests/rls_test.sql
-- ============================================================

-- ── orang_tua ────────────────────────────────────────────────────────────────
ALTER TABLE orang_tua ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orang_tua: akses diri sendiri"
  ON orang_tua FOR ALL
  USING (id = auth.uid());

-- ── anak ─────────────────────────────────────────────────────────────────────
ALTER TABLE anak ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anak: pemilik lewat orang_tua"
  ON anak FOR ALL
  USING (id_orang_tua = auth.uid());

-- ── consent ──────────────────────────────────────────────────────────────────
ALTER TABLE consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consent: pemilik"
  ON consent FOR ALL
  USING (id_orang_tua = auth.uid());

-- ── nilai_ditanam ─────────────────────────────────────────────────────────────
ALTER TABLE nilai_ditanam ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nilai_ditanam: lewat anak pemilik"
  ON nilai_ditanam FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM anak
      WHERE anak.id = nilai_ditanam.id_anak
        AND anak.id_orang_tua = auth.uid()
    )
  );

-- ── pilihan_harian ────────────────────────────────────────────────────────────
ALTER TABLE pilihan_harian ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pilihan_harian: lewat anak pemilik"
  ON pilihan_harian FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM anak
      WHERE anak.id = pilihan_harian.id_anak
        AND anak.id_orang_tua = auth.uid()
    )
  );

-- ── kebun_riwayat ─────────────────────────────────────────────────────────────
ALTER TABLE kebun_riwayat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kebun_riwayat: lewat anak pemilik"
  ON kebun_riwayat FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM anak
      WHERE anak.id = kebun_riwayat.id_anak
        AND anak.id_orang_tua = auth.uid()
    )
  );

-- ── jejak ─────────────────────────────────────────────────────────────────────
ALTER TABLE jejak ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jejak: lewat anak pemilik"
  ON jejak FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM anak
      WHERE anak.id = jejak.id_anak
        AND anak.id_orang_tua = auth.uid()
    )
  );

-- ── permohonan_koreksi_tgl_lahir ─────────────────────────────────────────────
ALTER TABLE permohonan_koreksi_tgl_lahir ENABLE ROW LEVEL SECURITY;

-- Pengguna bisa INSERT dan SELECT permohonannya sendiri (via anak)
CREATE POLICY "permohonan: pengguna lewat anak pemilik"
  ON permohonan_koreksi_tgl_lahir FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM anak
      WHERE anak.id = permohonan_koreksi_tgl_lahir.id_anak
        AND anak.id_orang_tua = auth.uid()
    )
  );
