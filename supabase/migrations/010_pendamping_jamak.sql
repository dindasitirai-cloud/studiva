-- ============================================================
-- Rekah — Pendamping jamak
-- Migrasi: 010_pendamping_jamak
--
-- Satu anak bisa didampingi lebih dari satu orang: ibu, ayah,
-- nenek, pengasuh. Migrasi 008 hanya menyediakan satu pasang
-- kolom (panggilan_pendamping, peran_pendamping), sehingga
-- hanya satu nama yang bisa disapa.
--
-- Bentuk baru: satu kolom JSONB berisi larik objek
--   [{"panggilan": "Bunda", "peran": "ibu"},
--    {"panggilan": "Ayah",  "peran": "ayah"}]
--
-- Kenapa JSONB, bukan tabel terpisah:
--   Pendamping tidak punya identitas sendiri di sistem. Mereka
--   tidak login, tidak punya data, dan tidak dirujuk tabel lain.
--   Mereka atribut dari anak, bukan entitas. Tabel terpisah akan
--   menambah join di setiap pembacaan profil tanpa manfaat.
--
-- Migrasi ini AMAN dijalankan berulang kali.
-- ============================================================

-- ── Kolom baru ───────────────────────────────────────────────────────────────

ALTER TABLE anak
  ADD COLUMN IF NOT EXISTS pendamping JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ── Pindahkan data lama ──────────────────────────────────────────────────────
-- Hanya baris yang punya panggilan lama DAN pendamping-nya masih kosong,
-- supaya menjalankan ulang migrasi tidak menggandakan isinya.

UPDATE anak
SET pendamping = jsonb_build_array(
      jsonb_build_object(
        'panggilan', btrim(panggilan_pendamping),
        'peran',     COALESCE(peran_pendamping, 'lainnya')
      )
    )
WHERE panggilan_pendamping IS NOT NULL
  AND btrim(panggilan_pendamping) <> ''
  AND pendamping = '[]'::jsonb;

-- ── Batasan bentuk ───────────────────────────────────────────────────────────
-- Postgres tidak punya skema JSON bawaan, jadi bentuknya dijaga lewat CHECK.
-- Yang dijaga: harus larik, maksimal 6 orang, setiap elemen objek dengan
-- panggilan tidak kosong dan peran dari daftar yang sah.

CREATE OR REPLACE FUNCTION pendamping_valid(data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  IF jsonb_typeof(data) <> 'array' THEN
    RETURN FALSE;
  END IF;

  IF jsonb_array_length(data) > 6 THEN
    RETURN FALSE;
  END IF;

  RETURN NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(data) AS elemen
    WHERE jsonb_typeof(elemen) <> 'object'
       OR elemen -> 'panggilan' IS NULL
       OR jsonb_typeof(elemen -> 'panggilan') <> 'string'
       OR length(btrim(elemen ->> 'panggilan')) = 0
       OR length(elemen ->> 'panggilan') > 40
       OR elemen -> 'peran' IS NULL
       OR (elemen ->> 'peran') NOT IN ('ibu', 'ayah', 'nenek-kakek', 'pengasuh', 'lainnya')
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'anak_pendamping_valid'
  ) THEN
    ALTER TABLE anak
      ADD CONSTRAINT anak_pendamping_valid CHECK (pendamping_valid(pendamping));
  END IF;
END $$;

-- ── Kolom lama ───────────────────────────────────────────────────────────────
-- Dipertahankan sementara supaya rilis bisa dibatalkan tanpa kehilangan data.
-- Kode aplikasi sudah TIDAK membacanya lagi.
--
-- Setelah rilis ini stabil di produksi (saran: satu siklus rilis penuh),
-- jalankan pembersihan berikut sebagai migrasi terpisah:
--
--   ALTER TABLE anak
--     DROP CONSTRAINT IF EXISTS anak_peran_pendamping_valid,
--     DROP COLUMN IF EXISTS panggilan_pendamping,
--     DROP COLUMN IF EXISTS peran_pendamping;
--
-- Jangan gabungkan penghapusan itu ke migrasi ini.
