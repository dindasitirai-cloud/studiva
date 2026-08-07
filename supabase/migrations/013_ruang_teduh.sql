-- ============================================================
-- Rekah — Ruang Teduh: catatan harian ibu & checklist persiapan
-- Migrasi: 013_ruang_teduh
--
-- ⚠️  BERISI DATA KESEHATAN. BACA SEBELUM MENYENTUH TABEL INI.
--
-- catatan_harian_ibu memuat suasana hati masa nifas, tanda fisik masa nifas,
-- asupan, dan konsumsi suplemen. Dalam UU 27/2022 ini data pribadi yang
-- bersifat SPESIFIK, bukan data pribadi umum.
--
-- LARANGAN PEMAKAIAN (disalin dari penyimpanan/kontrak.ts, tetap berlaku):
--   Data ini HANYA boleh dipakai untuk menampilkan kembali kepada ibu yang
--   mencatatnya. DILARANG dipakai untuk personalisasi rekomendasi barang,
--   penentuan kapan menampilkan tautan belanja, penargetan, profiling, atau
--   analitik yang bisa ditelusuri ke individu.
--
--   Larangan ini bukan preferensi gaya. Jangan dilonggarkan tanpa keputusan
--   tertulis Raisha.
--
-- Konsekuensi teknis dari larangan itu:
--   - Tidak ada policy SELECT untuk staf/admin. Psikolog dan admin TIDAK bisa
--     membaca tabel ini. Kalau suatu saat perlu, itu keputusan tersendiri yang
--     butuh dasar hukum dan persetujuan eksplisit ibu — bukan sekadar policy baru.
--   - Tidak ada kolom turunan/agregat. Pola dihitung di klien dari baris mentah.
--
-- KUNCI: id_orang_tua, BUKAN id_anak.
--   Sebelum migrasi ini, RuangTeduh.tsx memproksi caregiverId = idAnak dengan
--   tanda TODO. Catatan nifas adalah data IBU; menyimpannya per anak membuat
--   ibu dengan dua anak punya riwayat nifas yang terbelah, dan memaksa migrasi
--   data kesehatan di kemudian hari.
--
-- Migrasi ini AMAN dijalankan berulang kali.
-- ============================================================

-- ── catatan_harian_ibu ───────────────────────────────────────────────────────
-- Satu baris per ibu per tanggal. Mengikuti pola pilihan_harian: yang disimpan
-- diff per tanggal, bukan hasil akhir terakumulasi.
--
-- Hari tanpa catatan TIDAK disimpan sebagai baris kosong — kontraknya
-- mensyaratkan hari kosong benar-benar tidak ada, karena logika Cermin Pola
-- membedakan "tidak mencatat" dari "mencatat cuaca cerah".

CREATE TABLE IF NOT EXISTS catatan_harian_ibu (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_orang_tua  UUID NOT NULL REFERENCES orang_tua(id) ON DELETE CASCADE,
  tanggal       DATE NOT NULL,

  -- Cuaca Hati. NULL = belum diisi hari itu.
  cuaca_hati    TEXT
                  CHECK (cuaca_hati IS NULL OR cuaca_hati IN
                    ('cerah', 'berawan', 'mendung', 'hujan', 'badai')),

  -- Lembar Nifas. Larik id kondisi; larik kosong berarti "diperiksa, tidak ada".
  kondisi_nifas TEXT[] NOT NULL DEFAULT '{}',

  -- Piring Ibu. {kelompokGiziId: jumlahPorsi}
  porsi         JSONB NOT NULL DEFAULT '{}'::jsonb,
  gelas_air     SMALLINT CHECK (gelas_air IS NULL OR gelas_air BETWEEN 0 AND 30),
  -- {idSuplemen: sudahDiminum}
  suplemen      JSONB NOT NULL DEFAULT '{}'::jsonb,

  dibuat_pada     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_orang_tua, tanggal)
);

CREATE INDEX IF NOT EXISTS idx_catatan_harian_ibu_rentang
  ON catatan_harian_ibu (id_orang_tua, tanggal);

COMMENT ON TABLE catatan_harian_ibu IS
  'DATA KESEHATAN (UU 27/2022 pasal data spesifik). Hanya untuk ditampilkan '
  'kembali kepada ibu yang mencatatnya. Dilarang untuk personalisasi, '
  'penargetan, profiling, atau analitik per individu. Lihat kepala migrasi 013.';

-- ── centang_persiapan ────────────────────────────────────────────────────────
-- Checklist "Menyambut Si Kecil": kesiapan keluarga dan barang.
-- BUKAN data kesehatan — hanya daftar centang persiapan kelahiran.
-- Dipisah dari catatan_harian_ibu karena bukan per-tanggal: ia keadaan yang
-- bertahan, bukan catatan hari itu.

CREATE TABLE IF NOT EXISTS centang_persiapan (
  id_orang_tua UUID PRIMARY KEY REFERENCES orang_tua(id) ON DELETE CASCADE,
  -- {idItem: true}. Hanya yang tercentang disimpan; tidak ada = belum dicentang.
  kesiapan     JSONB NOT NULL DEFAULT '{}'::jsonb,
  barang       JSONB NOT NULL DEFAULT '{}'::jsonb,
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Penjagaan bentuk JSONB ───────────────────────────────────────────────────
-- Fungsi dulu, baru CHECK — Postgres menolak subquery langsung di CHECK
-- (galat 0A000). Pola yang sama dipakai pendamping_valid() di migrasi 010 dan
-- centang_valid() di migrasi 012.

CREATE OR REPLACE FUNCTION objek_datar_valid(data JSONB, tipe_nilai TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF jsonb_typeof(data) <> 'object' THEN
    RETURN FALSE;
  END IF;
  RETURN NOT EXISTS (
    SELECT 1 FROM jsonb_each(data) AS pasangan(kunci, isi)
    WHERE jsonb_typeof(pasangan.isi) <> tipe_nilai
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'catatan_harian_ibu_bentuk_jsonb'
      AND conrelid = 'catatan_harian_ibu'::regclass
  ) THEN
    ALTER TABLE catatan_harian_ibu ADD CONSTRAINT catatan_harian_ibu_bentuk_jsonb
      CHECK (
        objek_datar_valid(porsi, 'number')
        AND objek_datar_valid(suplemen, 'boolean')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'centang_persiapan_bentuk_jsonb'
      AND conrelid = 'centang_persiapan'::regclass
  ) THEN
    ALTER TABLE centang_persiapan ADD CONSTRAINT centang_persiapan_bentuk_jsonb
      CHECK (
        objek_datar_valid(kesiapan, 'boolean')
        AND objek_datar_valid(barang, 'boolean')
      );
  END IF;
END $$;

-- ── Trigger diperbarui_pada ──────────────────────────────────────────────────
-- sentuh_diperbarui_pada() dibuat di migrasi 011.

DROP TRIGGER IF EXISTS trg_catatan_harian_ibu_sentuh ON catatan_harian_ibu;
CREATE TRIGGER trg_catatan_harian_ibu_sentuh
  BEFORE UPDATE ON catatan_harian_ibu
  FOR EACH ROW EXECUTE FUNCTION sentuh_diperbarui_pada();

DROP TRIGGER IF EXISTS trg_centang_persiapan_sentuh ON centang_persiapan;
CREATE TRIGGER trg_centang_persiapan_sentuh
  BEFORE UPDATE ON centang_persiapan
  FOR EACH ROW EXECUTE FUNCTION sentuh_diperbarui_pada();

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Kepemilikan langsung, bukan lewat anak: ini data ibu.
-- Perhatikan tidak adanya policy untuk peran staf — lihat catatan di kepala.

ALTER TABLE catatan_harian_ibu ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catatan_harian_ibu: hanya pemilik" ON catatan_harian_ibu;
CREATE POLICY "catatan_harian_ibu: hanya pemilik"
  ON catatan_harian_ibu FOR ALL
  USING (id_orang_tua = auth.uid())
  WITH CHECK (id_orang_tua = auth.uid());

ALTER TABLE centang_persiapan ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "centang_persiapan: hanya pemilik" ON centang_persiapan;
CREATE POLICY "centang_persiapan: hanya pemilik"
  ON centang_persiapan FOR ALL
  USING (id_orang_tua = auth.uid())
  WITH CHECK (id_orang_tua = auth.uid());

-- ── Verifikasi ───────────────────────────────────────────────────────────────
-- Harapan: 2 baris, keduanya rowsecurity = true.
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE tablename IN ('catatan_harian_ibu', 'centang_persiapan');
--
-- Harapan: 2 baris, tidak ada policy lain (khususnya tidak ada untuk staf).
--   SELECT tablename, policyname, cmd FROM pg_policies
--   WHERE tablename IN ('catatan_harian_ibu', 'centang_persiapan');
--
-- Uji fungsi penjaga:
--   SELECT objek_datar_valid('{}'::jsonb, 'number')            AS harus_true,
--          objek_datar_valid('{"sayur":3}', 'number')           AS harus_true,
--          objek_datar_valid('{"sayur":"tiga"}', 'number')      AS harus_false,
--          objek_datar_valid('{"fe":true}', 'boolean')          AS harus_true,
--          objek_datar_valid('[]'::jsonb, 'boolean')            AS harus_false;
