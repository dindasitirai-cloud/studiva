-- 033_aksi_kondisi.sql
-- Phase 28: "Aksi per Kondisi" — teks/aksi yang muncul dari kondisi anak/caregiver/rumah
-- (hasil Phase 26/27) kini bisa diedit admin & ditinjau Fitri, lalu TAYANG lewat Supabase.
-- Logika PEMICU tetap di kode (tag/usia/tahap/jawaban → kunci). Tabel ini hanya menyimpan
-- TEKS untuk 'kunci' yang sudah dikenali kode; baris dengan kunci tak dikenal diabaikan aman.
-- • domain : 'persiapan_rumah' | 'langkah_hari_ini' | 'aman' | 'konfirmasi' | 'panduan_toilet' | 'panduan_layar' | 'panduan_saudara'
-- • kunci  : nilai pemicu yang dikenali kode (mis. tahap 'merangkak'; tag 'tidur'; opsi 'Colokan terbuka')
-- • meta   : atribut tampilan { kategori, esensial, khasIndonesia, labelTombol }
-- Idempoten. Jalankan SETELAH 006 (konten_draf) & setelah 028 (pola terapkan_*).

-- Tambah nilai enum jenis_konten (pola 024/025/026). Idempoten; aman di-rerun.
ALTER TYPE jenis_konten ADD VALUE IF NOT EXISTS 'aksi_kondisi';

CREATE TABLE IF NOT EXISTS aksi_kondisi (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain           TEXT NOT NULL,
  kunci            TEXT NOT NULL,
  judul            TEXT NOT NULL,
  detail           TEXT,
  meta             JSONB NOT NULL DEFAULT '{}'::jsonb,
  urutan           INT  NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'tayang' CHECK (status IN ('tayang','diarsipkan')),
  id_draf_asal     UUID REFERENCES konten_draf(id) ON DELETE SET NULL,
  id_penyetuju     UUID REFERENCES auth.users(id),
  diterbitkan_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dibuat_pada      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS aksi_kondisi_domain_kunci_idx ON aksi_kondisi (domain, kunci);

DROP TRIGGER IF EXISTS aksi_kondisi_touch ON aksi_kondisi;
CREATE TRIGGER aksi_kondisi_touch
  BEFORE UPDATE ON aksi_kondisi
  FOR EACH ROW EXECUTE FUNCTION touch_diperbarui_pada();

ALTER TABLE aksi_kondisi ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "baca aksi kondisi tayang" ON aksi_kondisi;
CREATE POLICY "baca aksi kondisi tayang"
  ON aksi_kondisi FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND status = 'tayang')
    OR peran_staf() IN ('admin','peninjau_klinis')
  );

-- Fungsi inti (tanpa cek peran) — dipakai RPC terapkan & backfill.
-- isi draf (jenis 'aksi_kondisi') = { domain, kunci, judul, detail, meta, urutan }.
CREATE OR REPLACE FUNCTION _terapkan_aksi_kondisi_inti(v_draf konten_draf)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id  UUID;
  v_isi JSONB := v_draf.isi;
BEGIN
  IF COALESCE(v_isi->>'domain','') = '' OR COALESCE(v_isi->>'kunci','') = '' OR COALESCE(v_isi->>'judul','') = '' THEN
    RAISE EXCEPTION 'Isi draf Aksi Kondisi tidak lengkap (domain/kunci/judul kosong).';
  END IF;
  -- Revisi: id_konten_sumber = id baris aksi_kondisi yang sudah ada.
  IF v_draf.id_konten_sumber ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     AND EXISTS (SELECT 1 FROM aksi_kondisi WHERE id = v_draf.id_konten_sumber::UUID) THEN
    UPDATE aksi_kondisi SET
      domain = v_isi->>'domain', kunci = v_isi->>'kunci', judul = v_isi->>'judul',
      detail = NULLIF(v_isi->>'detail',''), meta = COALESCE(v_isi->'meta','{}'::jsonb),
      urutan = COALESCE((v_isi->>'urutan')::INT, 0), status = 'tayang',
      id_draf_asal = v_draf.id, id_penyetuju = v_draf.id_penyetuju, diterbitkan_pada = NOW()
    WHERE id = v_draf.id_konten_sumber::UUID
    RETURNING id INTO v_id;
  ELSE
    INSERT INTO aksi_kondisi (domain, kunci, judul, detail, meta, urutan, status, id_draf_asal, id_penyetuju)
    VALUES (v_isi->>'domain', v_isi->>'kunci', v_isi->>'judul', NULLIF(v_isi->>'detail',''),
            COALESCE(v_isi->'meta','{}'::jsonb), COALESCE((v_isi->>'urutan')::INT, 0), 'tayang', v_draf.id, v_draf.id_penyetuju)
    RETURNING id INTO v_id;
  END IF;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION _terapkan_aksi_kondisi_inti(konten_draf) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION terapkan_aksi_kondisi(p_id_draf UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_draf konten_draf%ROWTYPE;
  v_id   UUID;
BEGIN
  IF NOT (peran_staf() = 'admin' OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat menerapkan Aksi Kondisi.';
  END IF;
  SELECT * INTO v_draf FROM konten_draf
   WHERE id = p_id_draf AND jenis::text = 'aksi_kondisi' AND status IN ('disetujui','tayang');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draf Aksi Kondisi % tidak ditemukan atau belum disetujui peninjau.', p_id_draf;
  END IF;
  v_id := _terapkan_aksi_kondisi_inti(v_draf);
  IF v_draf.status <> 'tayang' THEN
    UPDATE konten_draf SET status = 'tayang' WHERE id = p_id_draf;
    IF auth.uid() IS NOT NULL THEN
      INSERT INTO riwayat_tinjauan (id_draf, id_pelaku, tindakan) VALUES (p_id_draf, auth.uid(), 'tayang');
    END IF;
  END IF;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION atur_status_aksi_kondisi(p_id UUID, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (peran_staf() = 'admin' OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat mengubah status Aksi Kondisi.';
  END IF;
  IF p_status NOT IN ('tayang','diarsipkan') THEN
    RAISE EXCEPTION 'Status % tidak dikenal.', p_status;
  END IF;
  UPDATE aksi_kondisi SET status = p_status WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Baris % tidak ditemukan.', p_id; END IF;
END;
$$;

REVOKE ALL ON FUNCTION terapkan_aksi_kondisi(UUID)        FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION atur_status_aksi_kondisi(UUID,TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION terapkan_aksi_kondisi(UUID)        TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION atur_status_aksi_kondisi(UUID,TEXT) TO authenticated, service_role;
