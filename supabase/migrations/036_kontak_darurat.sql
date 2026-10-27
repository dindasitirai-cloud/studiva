-- ═══════════════════════════════════════════════════════════════════════════
-- 036 — Kontak darurat keluarga (Profil Anak · Kartu untuk pengasuh)  [idempoten]
-- Berlaku per akun keluarga (dipakai bersama semua anak): maksimal 3 kontak,
-- fasilitas kesehatan terdekat, dan catatan khusus per anak untuk pengasuh.
-- Sebelumnya hanya di localStorage perangkat (rekah_kontak_darurat_<idAkun>).
-- Satu baris per akun; isi disimpan apa adanya (JSON) dari aplikasi.
-- RLS: hanya pemilik akun. Sebelum dijalankan, aplikasi memakai cadangan lokal
-- dan mengunggah otomatis begitu tabel tersedia.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS kontak_darurat_keluarga (
  id_orang_tua    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  isi             JSONB NOT NULL DEFAULT '{}'::jsonb,
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE kontak_darurat_keluarga ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kontak_darurat_keluarga: milik sendiri" ON kontak_darurat_keluarga;
CREATE POLICY "kontak_darurat_keluarga: milik sendiri"
  ON kontak_darurat_keluarga FOR ALL
  USING (id_orang_tua = auth.uid())
  WITH CHECK (id_orang_tua = auth.uid());

-- Verifikasi cepat (opsional): harus mengembalikan 1 baris.
-- SELECT to_regclass('public.kontak_darurat_keluarga') AS tabel_kontak_darurat;
