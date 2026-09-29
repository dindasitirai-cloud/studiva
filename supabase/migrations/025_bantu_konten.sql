-- 025_bantu_konten.sql
-- Konten situasi Bantu dikelola admin lewat pipeline tinjauan (konten_draf → Fitri → terapkan),
-- pola yang sama dengan Temani (024).
-- • bantu_situasi = katalog yang TAYANG untuk orang tua (satu baris = satu situasi lengkap).
-- • Draf/revisi di konten_draf jenis 'bantu_situasi'; penulis ≠ penyetuju tetap dari 006.
-- • Tulis ke katalog hanya lewat fungsi SECURITY DEFINER (admin / service_role).
-- • Pemindai kata keselamatan & daftar rujukan TETAP di kode (bantuSeed.ts) — sengaja
--   tidak bisa diubah dari admin agar pengaman tidak melemah tanpa tinjauan.
-- Idempoten. Jalankan SETELAH 006 dan 024.

ALTER TYPE jenis_konten ADD VALUE IF NOT EXISTS 'bantu_situasi';

CREATE TABLE IF NOT EXISTS bantu_situasi (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug                 TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+([_-][a-z0-9]+)*$'),
  label                TEXT NOT NULL CHECK (char_length(label) BETWEEN 1 AND 120),
  ringkas              TEXT,
  kategori             TEXT NOT NULL CHECK (kategori IN ('perilaku_anak','relasional','caregiver','meta')),
  sensitif_keselamatan BOOLEAN NOT NULL DEFAULT FALSE,
  urutan               INT NOT NULL DEFAULT 100,
  -- [{ "pertanyaan": text, "opsi": [text], "opsi_keselamatan": [text] }]
  clarify              JSONB NOT NULL DEFAULT '[]',
  validasi             TEXT NOT NULL,
  langkah              TEXT[] NOT NULL CHECK (cardinality(langkah) BETWEEN 1 AND 8),
  yang_diamati         TEXT,
  kenapa_sederhana     TEXT,
  kenapa_sumber        TEXT,          -- NULL → lapisan sumber tidak ditampilkan
  status               TEXT NOT NULL DEFAULT 'tayang' CHECK (status IN ('tayang','diarsipkan')),
  versi                INT NOT NULL DEFAULT 1,
  id_draf_asal         UUID REFERENCES konten_draf(id) ON DELETE SET NULL,
  id_penyetuju         UUID REFERENCES auth.users(id),
  diterbitkan_pada     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dibuat_pada          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bantu_situasi_status_idx ON bantu_situasi (status);

DROP TRIGGER IF EXISTS bantu_situasi_touch ON bantu_situasi;
CREATE TRIGGER bantu_situasi_touch
  BEFORE UPDATE ON bantu_situasi
  FOR EACH ROW EXECUTE FUNCTION touch_diperbarui_pada();

ALTER TABLE bantu_situasi ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "baca bantu tayang" ON bantu_situasi;
CREATE POLICY "baca bantu tayang"
  ON bantu_situasi FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND status = 'tayang')
    OR peran_staf() IN ('admin','peninjau_klinis')
  );

-- Hapus draf Bantu milik sendiri yang belum diajukan / ditolak.
DROP POLICY IF EXISTS "admin hapus draf bantu milik sendiri" ON konten_draf;
CREATE POLICY "admin hapus draf bantu milik sendiri"
  ON konten_draf FOR DELETE
  USING (
    peran_staf() = 'admin'
    AND id_penulis = auth.uid()
    AND jenis::text = 'bantu_situasi'
    AND status IN ('draf','ditolak')
  );

CREATE OR REPLACE FUNCTION terapkan_bantu(p_id_draf UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_draf konten_draf%ROWTYPE;
  v_isi  JSONB;
  v_id   UUID;
BEGIN
  IF NOT (peran_staf() = 'admin' OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat menerapkan konten Bantu.';
  END IF;

  SELECT * INTO v_draf FROM konten_draf
   WHERE id = p_id_draf AND jenis::text = 'bantu_situasi' AND status = 'disetujui';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draf Bantu % tidak ditemukan atau belum disetujui peninjau.', p_id_draf;
  END IF;
  v_isi := v_draf.isi;
  IF v_isi->>'slug' IS NULL OR COALESCE(jsonb_array_length(v_isi->'langkah'), 0) = 0 THEN
    RAISE EXCEPTION 'Isi draf tidak lengkap (slug/langkah kosong).';
  END IF;

  INSERT INTO bantu_situasi AS b (
    slug, label, ringkas, kategori, sensitif_keselamatan, urutan, clarify, validasi, langkah,
    yang_diamati, kenapa_sederhana, kenapa_sumber, status, versi, id_draf_asal, id_penyetuju, diterbitkan_pada
  ) VALUES (
    v_isi->>'slug',
    v_isi->>'label',
    NULLIF(v_isi->>'ringkas',''),
    v_isi->>'kategori',
    COALESCE((v_isi->>'sensitif_keselamatan')::BOOLEAN, FALSE),
    COALESCE((v_isi->>'urutan')::INT, 100),
    COALESCE(v_isi->'clarify', '[]'::jsonb),
    v_isi->>'validasi',
    ARRAY(SELECT jsonb_array_elements_text(v_isi->'langkah')),
    NULLIF(v_isi->>'yang_diamati',''),
    NULLIF(v_isi->>'kenapa_sederhana',''),
    NULLIF(v_isi->>'kenapa_sumber',''),
    'tayang', 1, v_draf.id, v_draf.id_penyetuju, NOW()
  )
  ON CONFLICT (slug) DO UPDATE SET
    label                = EXCLUDED.label,
    ringkas              = EXCLUDED.ringkas,
    kategori             = EXCLUDED.kategori,
    sensitif_keselamatan = EXCLUDED.sensitif_keselamatan,
    urutan               = EXCLUDED.urutan,
    clarify              = EXCLUDED.clarify,
    validasi             = EXCLUDED.validasi,
    langkah              = EXCLUDED.langkah,
    yang_diamati         = EXCLUDED.yang_diamati,
    kenapa_sederhana     = EXCLUDED.kenapa_sederhana,
    kenapa_sumber        = EXCLUDED.kenapa_sumber,
    status               = 'tayang',
    versi                = b.versi + 1,
    id_draf_asal         = EXCLUDED.id_draf_asal,
    id_penyetuju         = EXCLUDED.id_penyetuju,
    diterbitkan_pada     = NOW()
  RETURNING id INTO v_id;

  UPDATE konten_draf SET status = 'tayang' WHERE id = p_id_draf;
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO riwayat_tinjauan (id_draf, id_pelaku, tindakan) VALUES (p_id_draf, auth.uid(), 'tayang');
  END IF;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION atur_status_bantu(p_slug TEXT, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (peran_staf() = 'admin' OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat mengarsipkan atau memulihkan situasi Bantu.';
  END IF;
  IF p_status NOT IN ('tayang','diarsipkan') THEN
    RAISE EXCEPTION 'Status % tidak dikenal.', p_status;
  END IF;
  UPDATE bantu_situasi SET status = p_status WHERE slug = p_slug;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Situasi % tidak ditemukan.', p_slug;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION terapkan_bantu(UUID)          FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION atur_status_bantu(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION terapkan_bantu(UUID)          TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION atur_status_bantu(TEXT, TEXT) TO authenticated, service_role;
