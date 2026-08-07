-- ============================================================
-- Rekah — Perluasan profil anak
-- Migrasi: 008_profil_anak
--
-- Tujuan: tabel `anak` menjadi SATU-SATUNYA sumber data anak.
-- Sebelum ini profil tersebar di tiga tempat (state dashboard,
-- tabel anak, dan endpoint /rekah/profile) sehingga isian wizard
-- tidak pernah sampai ke halaman Profil Anak.
--
-- Kolom baru semuanya NULLABLE supaya baris lama tetap valid.
--
-- CATATAN PRIVASI:
--   jenis_kelamin hanya dipakai untuk memilih ilustrasi dan sapaan.
--   Tidak dipakai untuk membedakan konten pengasuhan.
--   foto_url menunjuk ke objek di bucket privat "foto-anak"
--   (lihat 009_storage_foto_anak.sql). Bukan data URL.
-- ============================================================

ALTER TABLE anak
  ADD COLUMN IF NOT EXISTS jenis_kelamin        TEXT,
  ADD COLUMN IF NOT EXISTS foto_url             TEXT,
  ADD COLUMN IF NOT EXISTS panggilan_pendamping TEXT,
  ADD COLUMN IF NOT EXISTS peran_pendamping     TEXT,
  ADD COLUMN IF NOT EXISTS diperbarui_pada      TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── Batasan nilai ────────────────────────────────────────────────────────────
-- Dibuat NOT VALID lalu divalidasi, supaya baris lama yang NULL tidak menahan
-- migrasi kalau ada data yang sudah terlanjur aneh.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'anak_jenis_kelamin_valid'
  ) THEN
    ALTER TABLE anak
      ADD CONSTRAINT anak_jenis_kelamin_valid
      CHECK (jenis_kelamin IS NULL OR jenis_kelamin IN ('perempuan', 'laki-laki'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'anak_peran_pendamping_valid'
  ) THEN
    ALTER TABLE anak
      ADD CONSTRAINT anak_peran_pendamping_valid
      CHECK (peran_pendamping IS NULL OR peran_pendamping IN (
        'ibu', 'ayah', 'nenek-kakek', 'pengasuh', 'lainnya'
      ));
  END IF;
END $$;

-- ── Nama anak tidak boleh kosong ─────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'anak_nama_tidak_kosong'
  ) THEN
    ALTER TABLE anak
      ADD CONSTRAINT anak_nama_tidak_kosong
      CHECK (length(btrim(nama_anak)) >= 2);
  END IF;
END $$;

-- ── diperbarui_pada otomatis ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_anak_diperbarui_pada()
RETURNS TRIGGER AS $$
BEGIN
  NEW.diperbarui_pada = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_anak_diperbarui_pada ON anak;
CREATE TRIGGER trg_anak_diperbarui_pada
  BEFORE UPDATE ON anak
  FOR EACH ROW
  EXECUTE FUNCTION set_anak_diperbarui_pada();

-- ── tanggal_lahir tetap imutabel dari sisi pengguna ──────────────────────────
-- Koreksi hanya lewat permohonan_koreksi_tgl_lahir yang ditinjau admin.
-- Trigger ini menolak UPDATE tanggal_lahir oleh pengguna biasa.

CREATE OR REPLACE FUNCTION tolak_ubah_tanggal_lahir()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tanggal_lahir IS DISTINCT FROM OLD.tanggal_lahir
     AND COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin'
  THEN
    RAISE EXCEPTION 'Tanggal lahir hanya bisa diubah lewat permohonan koreksi.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_tolak_ubah_tanggal_lahir ON anak;
CREATE TRIGGER trg_tolak_ubah_tanggal_lahir
  BEFORE UPDATE ON anak
  FOR EACH ROW
  EXECUTE FUNCTION tolak_ubah_tanggal_lahir();

-- ── Indeks untuk layar Pilih Anak ────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_anak_orang_tua_dibuat
  ON anak (id_orang_tua, dibuat_pada);
