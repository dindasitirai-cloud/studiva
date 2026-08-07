-- ============================================================
-- Rekah — Ruang Teduh: koreksi kunci dari orang tua ke anak
-- Migrasi: 014_ruang_teduh_per_anak
--
-- ⚠️  MASIH DATA KESEHATAN. Seluruh larangan pemakaian di kepala migrasi 013
-- tetap berlaku tanpa perubahan.
--
-- KENAPA ADA MIGRASI INI
--
-- Migrasi 013 me-key catatan_harian_ibu dan centang_persiapan ke id_orang_tua,
-- dengan alasan "catatan nifas milik ibu, bukan milik anak". Alasan itu salah.
--
-- Nifas adalah peristiwa per-KELAHIRAN, bukan keadaan per-ibu. Ibu yang
-- melahirkan dua kali punya dua masa nifas yang berbeda, dengan tanggal mulai,
-- hitungan 42 hari, dan masa menyusui masing-masing. Menggabungkannya ke satu
-- baris per ibu membuat data satu anak muncul di layar anak lain.
--
-- Tiga dari empat layar Ruang Teduh jelas terikat satu kelahiran:
--   - Lembar Nifas   : menghitung 42 hari sejak melahirkan
--   - Piring Ibu     : asupan selama menyusui bayi tertentu
--   - Menyambut Si Kecil : checklist persiapan kelahiran — mustahil benar bila
--     persiapan bayi kedua sudah tercentang karena bayi pertama
--
-- Cakupan aplikasinya pun sudah per-anak sejak awal: RuangTeduh.tsx hanya
-- tampil untuk anak 0–12 bulan, dan tanggalMelahirkan diturunkan dari tanggal
-- lahir anak aktif. Kunci per orang tua tidak pernah cocok dengan cakupan itu.
--
-- KEHILANGAN DATA YANG DISENGAJA
--
-- Baris lama DIBUANG, tidak dipetakan. Memetakan id_orang_tua ke salah satu
-- anaknya berarti menebak kelahiran mana yang dimaksud sebuah catatan nifas —
-- pada data kesehatan, tebakan lebih buruk daripada kosong. Tabel ini baru
-- dibuat pada hari yang sama dan hanya berisi data uji.
--
-- Kalau kamu menjalankan ini di database yang sudah berisi catatan nyata,
-- BERHENTI dan ekspor dulu isinya.
--
-- Migrasi ini AMAN dijalankan berulang kali.
-- ============================================================

-- ── Ganti tabel, bukan ubah kolom ────────────────────────────────────────────
-- ALTER COLUMN dari id_orang_tua ke id_anak butuh pemetaan baris yang tidak
-- bisa dilakukan dengan benar (lihat catatan di atas), jadi tabelnya dibuat
-- ulang. DROP membawa serta index, constraint, trigger, dan policy-nya.

DROP TABLE IF EXISTS catatan_harian_ibu;
DROP TABLE IF EXISTS centang_persiapan;

-- ── catatan_harian_ibu ───────────────────────────────────────────────────────
-- Satu baris per anak per tanggal. Kepemilikan lewat anak, seperti seluruh
-- tabel Rekah lainnya.

CREATE TABLE catatan_harian_ibu (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak       UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  tanggal       DATE NOT NULL,

  cuaca_hati    TEXT
                  CHECK (cuaca_hati IS NULL OR cuaca_hati IN
                    ('cerah', 'berawan', 'mendung', 'hujan', 'badai')),
  kondisi_nifas TEXT[] NOT NULL DEFAULT '{}',
  porsi         JSONB NOT NULL DEFAULT '{}'::jsonb,
  gelas_air     SMALLINT CHECK (gelas_air IS NULL OR gelas_air BETWEEN 0 AND 30),
  suplemen      JSONB NOT NULL DEFAULT '{}'::jsonb,

  dibuat_pada     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_anak, tanggal),
  CONSTRAINT catatan_harian_ibu_bentuk_jsonb CHECK (
    objek_datar_valid(porsi, 'number') AND objek_datar_valid(suplemen, 'boolean')
  )
);

CREATE INDEX idx_catatan_harian_ibu_rentang
  ON catatan_harian_ibu (id_anak, tanggal);

COMMENT ON TABLE catatan_harian_ibu IS
  'DATA KESEHATAN (UU 27/2022, data pribadi spesifik). Hanya untuk ditampilkan '
  'kembali kepada ibu yang mencatatnya. Dilarang untuk personalisasi, '
  'penargetan, profiling, atau analitik per individu. Lihat kepala migrasi 013. '
  'Di-key per anak karena nifas adalah peristiwa per-kelahiran — lihat 014.';

-- ── centang_persiapan ────────────────────────────────────────────────────────
-- BUKAN data kesehatan. Checklist persiapan kelahiran, per anak.

CREATE TABLE centang_persiapan (
  id_anak      UUID PRIMARY KEY REFERENCES anak(id) ON DELETE CASCADE,
  kesiapan     JSONB NOT NULL DEFAULT '{}'::jsonb,
  barang       JSONB NOT NULL DEFAULT '{}'::jsonb,
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT centang_persiapan_bentuk_jsonb CHECK (
    objek_datar_valid(kesiapan, 'boolean') AND objek_datar_valid(barang, 'boolean')
  )
);

-- ── Trigger ──────────────────────────────────────────────────────────────────

CREATE TRIGGER trg_catatan_harian_ibu_sentuh
  BEFORE UPDATE ON catatan_harian_ibu
  FOR EACH ROW EXECUTE FUNCTION sentuh_diperbarui_pada();

CREATE TRIGGER trg_centang_persiapan_sentuh
  BEFORE UPDATE ON centang_persiapan
  FOR EACH ROW EXECUTE FUNCTION sentuh_diperbarui_pada();

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Pola sama dengan tabel Rekah lainnya: kepemilikan lewat anak.
-- Tetap TIDAK ADA policy untuk peran staf — lihat kepala migrasi 013.

ALTER TABLE catatan_harian_ibu ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catatan_harian_ibu: lewat anak pemilik"
  ON catatan_harian_ibu FOR ALL
  USING (
    EXISTS (SELECT 1 FROM anak
            WHERE anak.id = catatan_harian_ibu.id_anak
              AND anak.id_orang_tua = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM anak
            WHERE anak.id = catatan_harian_ibu.id_anak
              AND anak.id_orang_tua = auth.uid())
  );

ALTER TABLE centang_persiapan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "centang_persiapan: lewat anak pemilik"
  ON centang_persiapan FOR ALL
  USING (
    EXISTS (SELECT 1 FROM anak
            WHERE anak.id = centang_persiapan.id_anak
              AND anak.id_orang_tua = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM anak
            WHERE anak.id = centang_persiapan.id_anak
              AND anak.id_orang_tua = auth.uid())
  );

-- ── Verifikasi ───────────────────────────────────────────────────────────────
-- Harapan: kolom id_anak ada, kolom id_orang_tua TIDAK ada.
--   SELECT table_name, column_name FROM information_schema.columns
--   WHERE table_name IN ('catatan_harian_ibu', 'centang_persiapan')
--     AND column_name IN ('id_anak', 'id_orang_tua')
--   ORDER BY table_name;
--
-- Harapan: 2 baris, rowsecurity = true, dan hanya 1 policy per tabel.
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE tablename IN ('catatan_harian_ibu', 'centang_persiapan');
--   SELECT tablename, policyname FROM pg_policies
--   WHERE tablename IN ('catatan_harian_ibu', 'centang_persiapan');
