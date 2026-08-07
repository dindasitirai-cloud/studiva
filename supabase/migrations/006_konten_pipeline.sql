-- 006_konten_pipeline.sql
-- Pipeline review konten Rekah: konten_draf, riwayat_tinjauan, sikap.
-- Penulis ≠ penyetuju ditegakkan di level DB (CONSTRAINT + RLS).
-- Jalankan setelah 004_langganan.sql (005_rls_paywall.sql opsional sebelum ini).

-- ── Enum (idempoten) ─────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE status_pipeline AS ENUM ('draf','diajukan','disetujui','ditolak','tayang');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE jenis_konten AS ENUM ('kegiatan_ajak_main','panduan_tumbuh','sikap');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── konten_draf ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS konten_draf (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jenis            jenis_konten NOT NULL,
  id_konten_sumber TEXT,                          -- ID konten asal (Express INT sebagai text, atau UUID)
  judul            TEXT NOT NULL CHECK (char_length(judul) BETWEEN 1 AND 255),
  isi              JSONB NOT NULL DEFAULT '{}',   -- seluruh payload konten
  catatan_penulis  TEXT,
  status           status_pipeline NOT NULL DEFAULT 'draf',
  id_penulis       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_penyetuju     UUID REFERENCES auth.users(id),
  catatan_tinjauan TEXT,
  dibuat_pada      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Penulis tidak menyetujui karyanya sendiri
  CONSTRAINT penulis_bukan_penyetuju
    CHECK (id_penyetuju IS NULL OR id_penyetuju != id_penulis)
);

CREATE INDEX IF NOT EXISTS konten_draf_status_idx  ON konten_draf (status);
CREATE INDEX IF NOT EXISTS konten_draf_jenis_idx   ON konten_draf (jenis);
CREATE INDEX IF NOT EXISTS konten_draf_penulis_idx ON konten_draf (id_penulis);

-- ── riwayat_tinjauan ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS riwayat_tinjauan (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_draf     UUID NOT NULL REFERENCES konten_draf(id) ON DELETE CASCADE,
  id_pelaku   UUID NOT NULL REFERENCES auth.users(id),
  tindakan    TEXT NOT NULL,  -- 'diajukan'|'disetujui'|'ditolak'|'revisi_diminta'|'tayang'
  catatan     TEXT,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS riwayat_tinjauan_draf_idx ON riwayat_tinjauan (id_draf);

-- ── sikap (katalog Kebiasaan Baik yang sudah tayang) ────────────────────────
CREATE TABLE IF NOT EXISTS sikap (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judul           TEXT NOT NULL CHECK (char_length(judul) BETWEEN 1 AND 255),
  deskripsi       TEXT,
  nilai           TEXT[] NOT NULL DEFAULT '{}',
  fase_mulai      INT NOT NULL CHECK (fase_mulai BETWEEN 1 AND 5),
  fase_selesai    INT NOT NULL CHECK (
    fase_selesai BETWEEN 1 AND 5 AND fase_selesai >= fase_mulai
  ),
  id_draf_asal    UUID REFERENCES konten_draf(id),
  dibuat_pada     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Trigger diperbarui_pada ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION touch_diperbarui_pada()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.diperbarui_pada = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS konten_draf_touch ON konten_draf;
CREATE TRIGGER konten_draf_touch
  BEFORE UPDATE ON konten_draf
  FOR EACH ROW EXECUTE FUNCTION touch_diperbarui_pada();

DROP TRIGGER IF EXISTS sikap_touch ON sikap;
CREATE TRIGGER sikap_touch
  BEFORE UPDATE ON sikap
  FOR EACH ROW EXECUTE FUNCTION touch_diperbarui_pada();

-- ── Helper fungsi peran ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION peran_staf()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE(
    (auth.jwt()->'app_metadata'->>'role')::text,
    'parent'
  );
$$;

-- ── RLS — konten_draf ────────────────────────────────────────────────────────
ALTER TABLE konten_draf ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staf bisa lihat semua draf"          ON konten_draf;
DROP POLICY IF EXISTS "admin bisa buat draf"                ON konten_draf;
DROP POLICY IF EXISTS "admin bisa edit draf milik sendiri"  ON konten_draf;
DROP POLICY IF EXISTS "admin bisa ajukan draf"              ON konten_draf;
DROP POLICY IF EXISTS "peninjau bisa tinjau diajukan"       ON konten_draf;

CREATE POLICY "staf bisa lihat semua draf"
  ON konten_draf FOR SELECT
  USING (peran_staf() IN ('admin','peninjau_klinis'));

CREATE POLICY "admin bisa buat draf"
  ON konten_draf FOR INSERT
  WITH CHECK (peran_staf() = 'admin' AND id_penulis = auth.uid());

-- Admin bisa edit konten dan mengajukan (status draf → diajukan)
CREATE POLICY "admin bisa edit atau ajukan draf milik sendiri"
  ON konten_draf FOR UPDATE
  USING (peran_staf() = 'admin' AND id_penulis = auth.uid() AND status IN ('draf','diajukan'));

-- Peninjau bisa ubah status+catatan item yang sudah diajukan
CREATE POLICY "peninjau bisa tinjau diajukan"
  ON konten_draf FOR UPDATE
  USING (peran_staf() = 'peninjau_klinis' AND status = 'diajukan')
  WITH CHECK (id_penyetuju = auth.uid());

-- ── RLS — riwayat_tinjauan ───────────────────────────────────────────────────
ALTER TABLE riwayat_tinjauan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staf bisa lihat riwayat" ON riwayat_tinjauan;
DROP POLICY IF EXISTS "staf bisa tambah riwayat" ON riwayat_tinjauan;

CREATE POLICY "staf bisa lihat riwayat"
  ON riwayat_tinjauan FOR SELECT
  USING (peran_staf() IN ('admin','peninjau_klinis'));

CREATE POLICY "staf bisa tambah riwayat"
  ON riwayat_tinjauan FOR INSERT
  WITH CHECK (
    peran_staf() IN ('admin','peninjau_klinis')
    AND id_pelaku = auth.uid()
  );

-- ── RLS — sikap ──────────────────────────────────────────────────────────────
ALTER TABLE sikap ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "semua bisa baca sikap" ON sikap;

-- Orang tua boleh membaca sikap yang sudah tayang.
-- INSERT/UPDATE/DELETE hanya via service_role (endpoint terapkan-konten).
CREATE POLICY "semua bisa baca sikap"
  ON sikap FOR SELECT
  USING (true);

-- ── Fungsi SECURITY DEFINER: terapkan_sikap ──────────────────────────────────
-- Dipanggil oleh service_role saat Fitri menyetujui sikap baru.
CREATE OR REPLACE FUNCTION terapkan_sikap(p_id_draf UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_draf  konten_draf%ROWTYPE;
  v_id    UUID;
BEGIN
  SELECT * INTO v_draf FROM konten_draf WHERE id = p_id_draf AND status = 'disetujui';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draf % tidak ditemukan atau belum disetujui', p_id_draf;
  END IF;

  INSERT INTO sikap (judul, deskripsi, nilai, fase_mulai, fase_selesai, id_draf_asal)
  VALUES (
    v_draf.isi->>'judul',
    v_draf.isi->>'deskripsi',
    ARRAY(SELECT jsonb_array_elements_text(v_draf.isi->'nilai')),
    (v_draf.isi->>'fase_mulai')::INT,
    (v_draf.isi->>'fase_selesai')::INT,
    p_id_draf
  )
  RETURNING id INTO v_id;

  UPDATE konten_draf SET status = 'tayang' WHERE id = p_id_draf;
  RETURN v_id;
END;
$$;
