-- 028_ajak_main_sikap.sql
-- Ajak Main & Sikap per Fase (Bekal) tayang lewat Supabase, bukan lagi lewat backend Express.
-- Masalah sebelumnya: "Terapkan" untuk dua jenis ini memanggil backend Express yang hanya berjalan
-- di lokal, sehingga di website online konten yang sudah disetujui tidak pernah sampai ke orang tua.
-- (Untuk Ajak Main, backend lama bahkan hanya mengubah status tanpa menyimpan isi kegiatan baru.)
-- • ajak_main_kegiatan = katalog kegiatan Ajak Main yang TAYANG (isi = objek Activity lengkap).
--   id_kegiatan mengikuti id kegiatan yang direvisi; kegiatan baru mendapat id mulai 100001.
-- • terapkan_sikap diperbarui: boleh dipanggil admin langsung (sebelumnya hanya service_role),
--   dan revisi (id_konten_sumber = id sikap) memperbarui baris yang sama.
-- • Backfill: draf yang sudah berstatus 'tayang' dimasukkan ke katalog.
-- Idempoten. Jalankan SETELAH 006.

-- ─── Ajak Main ───────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS ajak_main_kegiatan_id_seq START 100001;

CREATE TABLE IF NOT EXISTS ajak_main_kegiatan (
  id_kegiatan      INT PRIMARY KEY,
  judul            TEXT NOT NULL,
  age_id           TEXT NOT NULL,
  isi              JSONB NOT NULL,
  status           TEXT NOT NULL DEFAULT 'tayang' CHECK (status IN ('tayang','diarsipkan')),
  versi            INT NOT NULL DEFAULT 1,
  id_draf_asal     UUID REFERENCES konten_draf(id) ON DELETE SET NULL,
  id_penyetuju     UUID REFERENCES auth.users(id),
  diterbitkan_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dibuat_pada      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS ajak_main_kegiatan_touch ON ajak_main_kegiatan;
CREATE TRIGGER ajak_main_kegiatan_touch
  BEFORE UPDATE ON ajak_main_kegiatan
  FOR EACH ROW EXECUTE FUNCTION touch_diperbarui_pada();

ALTER TABLE ajak_main_kegiatan ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "baca ajak main tayang" ON ajak_main_kegiatan;
CREATE POLICY "baca ajak main tayang"
  ON ajak_main_kegiatan FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND status = 'tayang')
    OR peran_staf() IN ('admin','peninjau_klinis')
  );

-- Fungsi inti (tanpa cek peran) — dipakai RPC & backfill.
CREATE OR REPLACE FUNCTION _terapkan_ajak_main_inti(v_draf konten_draf)
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id  INT;
  v_isi JSONB := v_draf.isi;
BEGIN
  IF COALESCE(v_isi->>'judul','') = '' OR COALESCE(v_isi->>'ageId','') = '' THEN
    RAISE EXCEPTION 'Isi draf Ajak Main tidak lengkap (judul/usia kosong).';
  END IF;
  IF COALESCE(v_draf.id_konten_sumber,'') ~ '^[0-9]+$' THEN
    v_id := v_draf.id_konten_sumber::INT;
  ELSE
    v_id := nextval('ajak_main_kegiatan_id_seq');
  END IF;
  v_isi := jsonb_set(v_isi - 'status' - 'catatanReviewer', '{id}', to_jsonb(v_id));

  INSERT INTO ajak_main_kegiatan AS k (id_kegiatan, judul, age_id, isi, status, versi, id_draf_asal, id_penyetuju, diterbitkan_pada)
  VALUES (v_id, v_isi->>'judul', v_isi->>'ageId', v_isi, 'tayang', 1, v_draf.id, v_draf.id_penyetuju, NOW())
  ON CONFLICT (id_kegiatan) DO UPDATE SET
    judul = EXCLUDED.judul, age_id = EXCLUDED.age_id, isi = EXCLUDED.isi, status = 'tayang',
    versi = k.versi + 1, id_draf_asal = EXCLUDED.id_draf_asal, id_penyetuju = EXCLUDED.id_penyetuju,
    diterbitkan_pada = NOW();
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION _terapkan_ajak_main_inti(konten_draf) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION terapkan_ajak_main(p_id_draf UUID)
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_draf konten_draf%ROWTYPE;
  v_id   INT;
BEGIN
  IF NOT (peran_staf() = 'admin' OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat menerapkan Ajak Main.';
  END IF;
  SELECT * INTO v_draf FROM konten_draf
   WHERE id = p_id_draf AND jenis::text = 'kegiatan_ajak_main' AND status IN ('disetujui','tayang');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draf Ajak Main % tidak ditemukan atau belum disetujui peninjau.', p_id_draf;
  END IF;
  v_id := _terapkan_ajak_main_inti(v_draf);
  IF v_draf.status <> 'tayang' THEN
    UPDATE konten_draf SET status = 'tayang' WHERE id = p_id_draf;
    IF auth.uid() IS NOT NULL THEN
      INSERT INTO riwayat_tinjauan (id_draf, id_pelaku, tindakan) VALUES (p_id_draf, auth.uid(), 'tayang');
    END IF;
  END IF;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION atur_status_ajak_main(p_id INT, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (peran_staf() = 'admin' OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat mengarsipkan atau memulihkan kegiatan Ajak Main.';
  END IF;
  IF p_status NOT IN ('tayang','diarsipkan') THEN
    RAISE EXCEPTION 'Status % tidak dikenal.', p_status;
  END IF;
  UPDATE ajak_main_kegiatan SET status = p_status WHERE id_kegiatan = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kegiatan % tidak ditemukan.', p_id;
  END IF;
END;
$$;

-- Backfill draf Ajak Main yang sudah tayang (urut lama → baru agar versi terakhir menang).
DO $$
DECLARE r konten_draf%ROWTYPE;
BEGIN
  FOR r IN SELECT * FROM konten_draf
            WHERE jenis::text = 'kegiatan_ajak_main' AND status = 'tayang'
              AND COALESCE(isi->>'judul','') <> '' AND COALESCE(isi->>'ageId','') <> ''
              AND NOT EXISTS (SELECT 1 FROM ajak_main_kegiatan k WHERE k.id_draf_asal = konten_draf.id)
            ORDER BY diperbarui_pada
  LOOP
    PERFORM _terapkan_ajak_main_inti(r);
  END LOOP;
END $$;

-- ─── Sikap per Fase ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION terapkan_sikap(p_id_draf UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_draf konten_draf%ROWTYPE;
  v_id   UUID;
BEGIN
  IF NOT (peran_staf() = 'admin' OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat menerapkan Sikap per Fase.';
  END IF;
  SELECT * INTO v_draf FROM konten_draf
   WHERE id = p_id_draf AND jenis::text = 'sikap' AND status = 'disetujui';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draf % tidak ditemukan atau belum disetujui', p_id_draf;
  END IF;

  IF v_draf.id_konten_sumber IS NOT NULL
     AND v_draf.id_konten_sumber ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     AND EXISTS (SELECT 1 FROM sikap WHERE id = v_draf.id_konten_sumber::UUID) THEN
    UPDATE sikap SET
      judul = v_draf.isi->>'judul', deskripsi = v_draf.isi->>'deskripsi',
      nilai = ARRAY(SELECT jsonb_array_elements_text(v_draf.isi->'nilai')),
      fase_mulai = (v_draf.isi->>'fase_mulai')::INT, fase_selesai = (v_draf.isi->>'fase_selesai')::INT,
      id_draf_asal = p_id_draf
    WHERE id = v_draf.id_konten_sumber::UUID
    RETURNING id INTO v_id;
  ELSE
    INSERT INTO sikap (judul, deskripsi, nilai, fase_mulai, fase_selesai, id_draf_asal)
    VALUES (
      v_draf.isi->>'judul', v_draf.isi->>'deskripsi',
      ARRAY(SELECT jsonb_array_elements_text(v_draf.isi->'nilai')),
      (v_draf.isi->>'fase_mulai')::INT, (v_draf.isi->>'fase_selesai')::INT, p_id_draf
    )
    RETURNING id INTO v_id;
  END IF;

  UPDATE konten_draf SET status = 'tayang' WHERE id = p_id_draf;
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO riwayat_tinjauan (id_draf, id_pelaku, tindakan) VALUES (p_id_draf, auth.uid(), 'tayang');
  END IF;
  RETURN v_id;
END;
$$;

-- Backfill: draf sikap yang sudah tayang tapi belum punya baris di tabel sikap.
INSERT INTO sikap (judul, deskripsi, nilai, fase_mulai, fase_selesai, id_draf_asal)
SELECT d.isi->>'judul', d.isi->>'deskripsi', ARRAY(SELECT jsonb_array_elements_text(d.isi->'nilai')),
       (d.isi->>'fase_mulai')::INT, (d.isi->>'fase_selesai')::INT, d.id
FROM konten_draf d
WHERE d.jenis::text = 'sikap' AND d.status = 'tayang'
  AND COALESCE(d.isi->>'judul','') <> ''
  AND NOT EXISTS (SELECT 1 FROM sikap s WHERE s.id_draf_asal = d.id);

REVOKE ALL ON FUNCTION terapkan_ajak_main(UUID)          FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION atur_status_ajak_main(INT, TEXT)  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION terapkan_sikap(UUID)              FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION terapkan_ajak_main(UUID)          TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION atur_status_ajak_main(INT, TEXT)  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION terapkan_sikap(UUID)              TO authenticated, service_role;
