-- 030_bantu_usia.sql
-- Situasi Bantu diberi rentang usia anak (bulan, inklusif) agar orang tua hanya melihat
-- situasi yang sesuai usia anaknya. Situasi lama otomatis berlaku untuk semua usia (0–71).
-- terapkan_bantu didefinisikan ulang agar ikut menyimpan rentang usia dari isi draf.
-- Idempoten. Jalankan SETELAH 025.

ALTER TABLE bantu_situasi ADD COLUMN IF NOT EXISTS usia_min_bulan INT NOT NULL DEFAULT 0;
ALTER TABLE bantu_situasi ADD COLUMN IF NOT EXISTS usia_max_bulan INT NOT NULL DEFAULT 71;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bantu_situasi_usia_cek') THEN
    ALTER TABLE bantu_situasi ADD CONSTRAINT bantu_situasi_usia_cek
      CHECK (usia_min_bulan BETWEEN 0 AND 71 AND usia_max_bulan BETWEEN 0 AND 71 AND usia_min_bulan <= usia_max_bulan);
  END IF;
END $$;

-- Rentang usia untuk situasi bawaan yang mungkin sudah tayang.
UPDATE bantu_situasi SET usia_min_bulan = 12 WHERE slug IN ('tantrum', 'konflik_saudara') AND usia_min_bulan = 0 AND usia_max_bulan = 71;
UPDATE bantu_situasi SET usia_min_bulan = 9  WHERE slug = 'memukul'          AND usia_min_bulan = 0 AND usia_max_bulan = 71;
UPDATE bantu_situasi SET usia_min_bulan = 6  WHERE slug = 'tidak_mau_makan'  AND usia_min_bulan = 0 AND usia_max_bulan = 71;

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
    slug, label, ringkas, kategori, sensitif_keselamatan, urutan, usia_min_bulan, usia_max_bulan, clarify, validasi, langkah,
    yang_diamati, kenapa_sederhana, kenapa_sumber, status, versi, id_draf_asal, id_penyetuju, diterbitkan_pada
  ) VALUES (
    v_isi->>'slug',
    v_isi->>'label',
    NULLIF(v_isi->>'ringkas',''),
    v_isi->>'kategori',
    COALESCE((v_isi->>'sensitif_keselamatan')::BOOLEAN, FALSE),
    COALESCE((v_isi->>'urutan')::INT, 100),
    LEAST(GREATEST(COALESCE(NULLIF(v_isi->>'usia_min_bulan','')::INT, 0), 0), 71),
    LEAST(GREATEST(COALESCE(NULLIF(v_isi->>'usia_max_bulan','')::INT, 71), 0), 71),
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
    usia_min_bulan       = EXCLUDED.usia_min_bulan,
    usia_max_bulan       = EXCLUDED.usia_max_bulan,
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
