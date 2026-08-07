-- ============================================================
-- Rekah — Centang Kebiasaan Baik
-- Migrasi: 012_centang_kebiasaan
--
-- Sebelum ini, centang Kebiasaan Baik di Irama Hari hanya hidup di
-- useState IramaHariPage (baris 33) dengan `// TODO: simpan ke backend`
-- di baris 59. Hilang setiap refresh atau pindah halaman.
--
-- KENAPA KOLOM BARU, BUKAN DI DALAM `diff`:
--   PilihanHarianContext menyimpan dengan MENIMPA seluruh kolom diff
--   (lihat simpanPilihanHarian). Kalau centang jadi salah satu kunci di
--   dalam diff, setiap interaksi lain di Irama Hari akan menyapunya —
--   kehilangan data yang tidak menimbulkan galat apa pun.
--   Kolom terpisah membuat kedua penulis tidak pernah bertabrakan.
--
-- BENTUK: Record<idNilai, idButir[]> untuk TANGGAL BARIS INI saja.
--   Tipe CentangKebiasaan di klien adalah Record<tanggal, Record<nilai, butir[]>>;
--   dimensi tanggal diberikan oleh kolom `tanggal` di tabel ini, jadi tidak
--   perlu diulang di dalam JSON.
--
-- Migrasi ini AMAN dijalankan berulang kali.
-- ============================================================

ALTER TABLE pilihan_harian
  ADD COLUMN IF NOT EXISTS centang JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN pilihan_harian.centang IS
  'Centang Kebiasaan Baik untuk tanggal baris ini: {idNilai: [idButir, ...]}. '
  'Terpisah dari kolom diff karena keduanya ditulis oleh alur yang berbeda.';

-- ── Penjagaan bentuk ─────────────────────────────────────────────────────────
-- Postgres TIDAK mengizinkan subquery di dalam CHECK (galat 0A000). Karena
-- pemeriksaannya harus menelusuri setiap kunci, ia dibungkus fungsi IMMUTABLE
-- lebih dulu — pola yang sama dipakai pendamping_valid() di migrasi 010.

CREATE OR REPLACE FUNCTION centang_valid(data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  IF jsonb_typeof(data) <> 'object' THEN
    RETURN FALSE;
  END IF;

  -- Setiap nilai harus larik string.
  RETURN NOT EXISTS (
    SELECT 1
    FROM jsonb_each(data) AS pasangan(kunci, isi)
    WHERE jsonb_typeof(pasangan.isi) <> 'array'
       OR EXISTS (
            SELECT 1
            FROM jsonb_array_elements(pasangan.isi) AS butir
            WHERE jsonb_typeof(butir) <> 'string'
          )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pilihan_harian_centang_bentuk'
      AND conrelid = 'pilihan_harian'::regclass
  ) THEN
    ALTER TABLE pilihan_harian ADD CONSTRAINT pilihan_harian_centang_bentuk
      CHECK (centang_valid(centang));
  END IF;
END $$;

-- RLS: tidak ada yang perlu ditambah. Policy "pilihan_harian: lewat anak
-- pemilik" di 002_rls_policies.sql berlaku pada seluruh baris, termasuk
-- kolom baru ini.

-- ── Verifikasi ───────────────────────────────────────────────────────────────
-- Harapan: 1 baris, jsonb, default '{}'::jsonb.
--
--   SELECT column_name, data_type, column_default
--   FROM information_schema.columns
--   WHERE table_name = 'pilihan_harian' AND column_name = 'centang';
--
-- Harapan: 1 baris, definisinya memuat centang_valid(centang).
--
--   SELECT conname, pg_get_constraintdef(oid)
--   FROM pg_constraint
--   WHERE conname = 'pilihan_harian_centang_bentuk';
--
-- Uji fungsi penjaganya tanpa menyentuh data (semua harus sesuai komentar):
--
--   SELECT centang_valid('{}'::jsonb)                      AS harus_true,
--          centang_valid('{"Kejujuran":["b1","b2"]}')       AS harus_true,
--          centang_valid('{"Kejujuran":"bukan-larik"}')     AS harus_false,
--          centang_valid('{"Kejujuran":[1,2]}')             AS harus_false,
--          centang_valid('[]'::jsonb)                       AS harus_false;
