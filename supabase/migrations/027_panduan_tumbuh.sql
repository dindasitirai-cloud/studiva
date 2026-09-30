-- 027_panduan_tumbuh.sql
-- Wawasan Tumbuh (Panduan Tumbuh Kembang) tayang lewat Supabase, bukan lagi lewat backend Express.
-- Masalah sebelumnya: "Terapkan" menulis ke SQLite backend Express (localhost), sehingga kartu yang
-- sudah berstatus tayang tidak pernah sampai ke halaman Wawasan Tumbuh di website online.
-- • panduan_tumbuh = katalog kartu yang TAYANG (satu baris = satu kartu, isi lengkap di kolom isi).
-- • Tulis hanya lewat terapkan_panduan (admin / service_role) setelah draf disetujui peninjau.
-- • Backfill: draf panduan_tumbuh yang sudah berstatus 'tayang' langsung dimasukkan ke katalog.
-- Idempoten. Jalankan SETELAH 006.

CREATE TABLE IF NOT EXISTS panduan_tumbuh (
  slug             TEXT PRIMARY KEY CHECK (char_length(slug) BETWEEN 1 AND 120),
  age_key          TEXT NOT NULL,
  domain           TEXT NOT NULL,
  title            TEXT NOT NULL,
  isi              JSONB NOT NULL,
  status           TEXT NOT NULL DEFAULT 'tayang' CHECK (status IN ('tayang','diarsipkan')),
  versi            INT NOT NULL DEFAULT 1,
  id_draf_asal     UUID REFERENCES konten_draf(id) ON DELETE SET NULL,
  id_penyetuju     UUID REFERENCES auth.users(id),
  diterbitkan_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dibuat_pada      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS panduan_tumbuh_status_idx ON panduan_tumbuh (status, age_key);

DROP TRIGGER IF EXISTS panduan_tumbuh_touch ON panduan_tumbuh;
CREATE TRIGGER panduan_tumbuh_touch
  BEFORE UPDATE ON panduan_tumbuh
  FOR EACH ROW EXECUTE FUNCTION touch_diperbarui_pada();

ALTER TABLE panduan_tumbuh ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "baca panduan tayang" ON panduan_tumbuh;
CREATE POLICY "baca panduan tayang"
  ON panduan_tumbuh FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND status = 'tayang')
    OR peran_staf() IN ('admin','peninjau_klinis')
  );

-- ─── Backfill draf yang sudah tayang (versi terbaru per slug) ────────────────
INSERT INTO panduan_tumbuh (slug, age_key, domain, title, isi, status, versi, id_draf_asal, id_penyetuju, diterbitkan_pada)
SELECT DISTINCT ON (d.isi->>'slug')
  d.isi->>'slug', d.isi->>'age_key', d.isi->>'domain', COALESCE(d.isi->>'title', d.judul), d.isi,
  'tayang', 1, d.id, d.id_penyetuju, d.diperbarui_pada
FROM konten_draf d
WHERE d.jenis::text = 'panduan_tumbuh' AND d.status = 'tayang'
  AND COALESCE(d.isi->>'slug','') <> '' AND COALESCE(d.isi->>'age_key','') <> '' AND COALESCE(d.isi->>'domain','') <> ''
ORDER BY d.isi->>'slug', d.diperbarui_pada DESC
ON CONFLICT (slug) DO NOTHING;

-- ─── Terapkan draf yang sudah disetujui ──────────────────────────────────────
CREATE OR REPLACE FUNCTION terapkan_panduan(p_id_draf UUID)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_draf konten_draf%ROWTYPE;
  v_isi  JSONB;
BEGIN
  IF NOT (peran_staf() = 'admin' OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat menerapkan Wawasan Tumbuh.';
  END IF;

  SELECT * INTO v_draf FROM konten_draf
   WHERE id = p_id_draf AND jenis::text = 'panduan_tumbuh' AND status IN ('disetujui','tayang');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draf Wawasan Tumbuh % tidak ditemukan atau belum disetujui peninjau.', p_id_draf;
  END IF;
  v_isi := v_draf.isi;
  IF COALESCE(v_isi->>'slug','') = '' OR COALESCE(v_isi->>'age_key','') = '' OR COALESCE(v_isi->>'domain','') = '' THEN
    RAISE EXCEPTION 'Isi draf tidak lengkap (slug/usia/domain kosong).';
  END IF;

  INSERT INTO panduan_tumbuh AS p (slug, age_key, domain, title, isi, status, versi, id_draf_asal, id_penyetuju, diterbitkan_pada)
  VALUES (v_isi->>'slug', v_isi->>'age_key', v_isi->>'domain', COALESCE(v_isi->>'title', v_draf.judul), v_isi,
          'tayang', 1, v_draf.id, v_draf.id_penyetuju, NOW())
  ON CONFLICT (slug) DO UPDATE SET
    age_key          = EXCLUDED.age_key,
    domain           = EXCLUDED.domain,
    title            = EXCLUDED.title,
    isi              = EXCLUDED.isi,
    status           = 'tayang',
    versi            = p.versi + 1,
    id_draf_asal     = EXCLUDED.id_draf_asal,
    id_penyetuju     = EXCLUDED.id_penyetuju,
    diterbitkan_pada = NOW();

  IF v_draf.status <> 'tayang' THEN
    UPDATE konten_draf SET status = 'tayang' WHERE id = p_id_draf;
    IF auth.uid() IS NOT NULL THEN
      INSERT INTO riwayat_tinjauan (id_draf, id_pelaku, tindakan) VALUES (p_id_draf, auth.uid(), 'tayang');
    END IF;
  END IF;
  RETURN v_isi->>'slug';
END;
$$;

CREATE OR REPLACE FUNCTION atur_status_panduan(p_slug TEXT, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (peran_staf() = 'admin' OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat mengarsipkan atau memulihkan kartu Wawasan Tumbuh.';
  END IF;
  IF p_status NOT IN ('tayang','diarsipkan') THEN
    RAISE EXCEPTION 'Status % tidak dikenal.', p_status;
  END IF;
  UPDATE panduan_tumbuh SET status = p_status WHERE slug = p_slug;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kartu % tidak ditemukan.', p_slug;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION terapkan_panduan(UUID)          FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION atur_status_panduan(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION terapkan_panduan(UUID)          TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION atur_status_panduan(TEXT, TEXT) TO authenticated, service_role;
