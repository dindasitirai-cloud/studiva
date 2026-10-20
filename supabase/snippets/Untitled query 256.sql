-- 024_temani_konten.sql
-- Konten Temani dikelola admin lewat pipeline tinjauan (konten_draf → Fitri → terapkan).
-- • temani_journey / temani_journey_hari = katalog yang TAYANG untuk orang tua.
-- • Draf & revisi hidup di konten_draf (jenis 'temani_journey'); penulis ≠ penyetuju
--   tetap ditegakkan oleh constraint + RLS 006.
-- • Tulis ke katalog hanya lewat fungsi SECURITY DEFINER (admin / service_role).
-- Idempoten. Jalankan SETELAH 006 (dan 021–023 bila ada).

-- ── 1. Jenis konten baru ─────────────────────────────────────────────────────
ALTER TYPE jenis_konten ADD VALUE IF NOT EXISTS 'temani_journey';
-- Catatan: nilai enum baru belum boleh dipakai sebagai literal enum dalam transaksi yang
-- sama, jadi semua perbandingan di bawah memakai jenis::text.

-- ── 2. Katalog tayang ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS temani_journey (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  judul            TEXT NOT NULL CHECK (char_length(judul) BETWEEN 1 AND 255),
  deskripsi        TEXT,
  nilai_terkait    TEXT[] NOT NULL DEFAULT '{}',
  usia_min_bulan   INT NOT NULL CHECK (usia_min_bulan BETWEEN 0 AND 72),
  usia_max_bulan   INT NOT NULL CHECK (usia_max_bulan BETWEEN 0 AND 72),
  durasi_hari      INT NOT NULL CHECK (durasi_hari BETWEEN 1 AND 30),
  kebiasaan_utama  TEXT,
  status           TEXT NOT NULL DEFAULT 'tayang' CHECK (status IN ('tayang','diarsipkan')),
  versi            INT NOT NULL DEFAULT 1,
  id_draf_asal     UUID REFERENCES konten_draf(id) ON DELETE SET NULL,
  id_penyetuju     UUID REFERENCES auth.users(id),
  diterbitkan_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dibuat_pada      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT temani_usia_urut CHECK (usia_min_bulan <= usia_max_bulan)
);

CREATE TABLE IF NOT EXISTS temani_journey_hari (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journey_id       UUID NOT NULL REFERENCES temani_journey(id) ON DELETE CASCADE,
  hari             INT NOT NULL CHECK (hari BETWEEN 1 AND 30),
  jenis            TEXT NOT NULL DEFAULT 'perancah' CHECK (jenis IN ('target','perancah')),
  kebiasaan_id     TEXT,
  fokus_hari       TEXT NOT NULL CHECK (char_length(fokus_hari) >= 1),
  script           TEXT,
  kenapa_sederhana TEXT,
  kenapa_evidence  TEXT,
  kenapa_sumber    TEXT,          -- NULL → lapisan sumber tidak ditampilkan
  yang_diamati     TEXT,
  UNIQUE (journey_id, hari),
  CONSTRAINT temani_target_butuh_kb CHECK (jenis <> 'target' OR kebiasaan_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS temani_journey_status_idx ON temani_journey (status);
CREATE INDEX IF NOT EXISTS temani_hari_journey_idx   ON temani_journey_hari (journey_id);

DROP TRIGGER IF EXISTS temani_journey_touch ON temani_journey;
CREATE TRIGGER temani_journey_touch
  BEFORE UPDATE ON temani_journey
  FOR EACH ROW EXECUTE FUNCTION touch_diperbarui_pada();

-- ── 3. RLS katalog: baca saja ────────────────────────────────────────────────
ALTER TABLE temani_journey      ENABLE ROW LEVEL SECURITY;
ALTER TABLE temani_journey_hari ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "baca temani tayang"      ON temani_journey;
DROP POLICY IF EXISTS "baca hari temani tayang" ON temani_journey_hari;

-- Pengguna login melihat yang tayang; staf melihat semua (termasuk diarsipkan).
CREATE POLICY "baca temani tayang"
  ON temani_journey FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND status = 'tayang')
    OR peran_staf() IN ('admin','peninjau_klinis')
  );

CREATE POLICY "baca hari temani tayang"
  ON temani_journey_hari FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM temani_journey j
    WHERE j.id = journey_id
      AND ((auth.uid() IS NOT NULL AND j.status = 'tayang') OR peran_staf() IN ('admin','peninjau_klinis'))
  ));
-- Tidak ada policy INSERT/UPDATE/DELETE → hanya lewat fungsi di bawah.

-- ── 4. Hapus draf Temani (hanya draf milik sendiri yang belum ditinjau/ditolak) ─
DROP POLICY IF EXISTS "admin hapus draf temani milik sendiri" ON konten_draf;
CREATE POLICY "admin hapus draf temani milik sendiri"
  ON konten_draf FOR DELETE
  USING (
    peran_staf() = 'admin'
    AND id_penulis = auth.uid()
    AND jenis::text = 'temani_journey'
    AND status IN ('draf','ditolak')
  );

-- ── 5. Terapkan draf yang disetujui → katalog ────────────────────────────────
CREATE OR REPLACE FUNCTION terapkan_temani(p_id_draf UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_draf    konten_draf%ROWTYPE;
  v_isi     JSONB;
  v_slug    TEXT;
  v_id      UUID;
  v_hari    JSONB;
  v_jumlah  INT;
BEGIN
  IF NOT (peran_staf() = 'admin' OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat menerapkan konten Temani.';
  END IF;

  SELECT * INTO v_draf FROM konten_draf
   WHERE id = p_id_draf AND jenis::text = 'temani_journey' AND status = 'disetujui';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draf Temani % tidak ditemukan atau belum disetujui peninjau.', p_id_draf;
  END IF;

  v_isi    := v_draf.isi;
  v_slug   := v_isi->>'slug';
  v_jumlah := COALESCE(jsonb_array_length(v_isi->'hari'), 0);
  IF v_slug IS NULL OR v_jumlah = 0 THEN
    RAISE EXCEPTION 'Isi draf tidak lengkap (slug/hari kosong).';
  END IF;

  INSERT INTO temani_journey AS t (
    slug, judul, deskripsi, nilai_terkait, usia_min_bulan, usia_max_bulan,
    durasi_hari, kebiasaan_utama, status, versi, id_draf_asal, id_penyetuju, diterbitkan_pada
  ) VALUES (
    v_slug,
    v_isi->>'judul',
    NULLIF(v_isi->>'deskripsi',''),
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(v_isi->'nilai_terkait','[]'::jsonb))),
    (v_isi->>'usia_min_bulan')::INT,
    (v_isi->>'usia_max_bulan')::INT,
    v_jumlah,
    NULLIF(v_isi->>'kebiasaan_utama',''),
    'tayang', 1, v_draf.id, v_draf.id_penyetuju, NOW()
  )
  ON CONFLICT (slug) DO UPDATE SET
    judul            = EXCLUDED.judul,
    deskripsi        = EXCLUDED.deskripsi,
    nilai_terkait    = EXCLUDED.nilai_terkait,
    usia_min_bulan   = EXCLUDED.usia_min_bulan,
    usia_max_bulan   = EXCLUDED.usia_max_bulan,
    durasi_hari      = EXCLUDED.durasi_hari,
    kebiasaan_utama  = EXCLUDED.kebiasaan_utama,
    status           = 'tayang',
    versi            = t.versi + 1,
    id_draf_asal     = EXCLUDED.id_draf_asal,
    id_penyetuju     = EXCLUDED.id_penyetuju,
    diterbitkan_pada = NOW()
  RETURNING id INTO v_id;

  DELETE FROM temani_journey_hari WHERE journey_id = v_id;
  FOR v_hari IN SELECT * FROM jsonb_array_elements(v_isi->'hari') LOOP
    INSERT INTO temani_journey_hari (
      journey_id, hari, jenis, kebiasaan_id, fokus_hari, script,
      kenapa_sederhana, kenapa_evidence, kenapa_sumber, yang_diamati
    ) VALUES (
      v_id,
      (v_hari->>'hari')::INT,
      COALESCE(NULLIF(v_hari->>'jenis',''),'perancah'),
      NULLIF(v_hari->>'kebiasaan_id',''),
      v_hari->>'fokus_hari',
      NULLIF(v_hari->>'script',''),
      NULLIF(v_hari->>'kenapa_sederhana',''),
      NULLIF(v_hari->>'kenapa_evidence',''),
      NULLIF(v_hari->>'kenapa_sumber',''),
      NULLIF(v_hari->>'yang_diamati','')
    );
  END LOOP;

  UPDATE konten_draf SET status = 'tayang' WHERE id = p_id_draf;
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO riwayat_tinjauan (id_draf, id_pelaku, tindakan)
    VALUES (p_id_draf, auth.uid(), 'tayang');
  END IF;

  RETURN v_id;
END;
$$;

-- ── 6. Arsipkan / pulihkan perjalanan yang pernah tayang ─────────────────────
CREATE OR REPLACE FUNCTION atur_status_temani(p_slug TEXT, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (peran_staf() = 'admin' OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat mengarsipkan atau memulihkan perjalanan.';
  END IF;
  IF p_status NOT IN ('tayang','diarsipkan') THEN
    RAISE EXCEPTION 'Status % tidak dikenal.', p_status;
  END IF;
  UPDATE temani_journey SET status = p_status WHERE slug = p_slug;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perjalanan % tidak ditemukan.', p_slug;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION terapkan_temani(UUID)         FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION atur_status_temani(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION terapkan_temani(UUID)         TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION atur_status_temani(TEXT, TEXT) TO authenticated, service_role;
