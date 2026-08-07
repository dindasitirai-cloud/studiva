-- ============================================================
-- Rekah — Skema Tabel
-- Migrasi: 001_rekah_schema
-- Jalankan lewat Supabase Dashboard → SQL Editor, atau CLI:
--   supabase db push
--
-- CATATAN PRIVASI:
--   Enkripsi at-rest dan in-transit ditangani platform Supabase
--   (Postgres + TLS). Bukan implementasi sendiri.
--
--   Residensi data (region) perlu dikonfirmasi pengacara untuk
--   produk berbayar dengan data anak — lihat BACKEND_SETUP.md.
-- ============================================================

-- ── orang_tua ────────────────────────────────────────────────────────────────
-- Catatan PII: email disimpan agar admin bisa menghubungi.
-- Nomor HP opsional untuk notifikasi.

CREATE TABLE IF NOT EXISTS orang_tua (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  nomor_hp   TEXT,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── anak ─────────────────────────────────────────────────────────────────────
-- tanggal_lahir IMUTABEL dari sisi pengguna.
-- Usia TIDAK disimpan — selalu dihitung di klien dari tanggal_lahir.
-- Koreksi hanya lewat jalur admin (lihat tabel permohonan_koreksi_tgl_lahir).

CREATE TABLE IF NOT EXISTS anak (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_orang_tua  UUID NOT NULL REFERENCES orang_tua(id) ON DELETE CASCADE,
  nama_anak     TEXT NOT NULL,
  tanggal_lahir DATE NOT NULL,
  nama_ibu      TEXT,
  nama_bapak    TEXT,
  dibuat_pada   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── consent ──────────────────────────────────────────────────────────────────
-- Mencatat persetujuan kebijakan privasi saat daftar.
-- Teks kebijakan dan versi ditentukan manusia — lihat BACKEND_SETUP.md.

CREATE TABLE IF NOT EXISTS consent (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_orang_tua    UUID NOT NULL REFERENCES orang_tua(id) ON DELETE CASCADE,
  versi_kebijakan TEXT NOT NULL,
  disetujui_pada  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── nilai_ditanam ─────────────────────────────────────────────────────────────
-- Taman Akar Keluarga: nilai yang dipilih keluarga.
-- id_nilai = NilaiAkar string (misal "Kejujuran").

CREATE TABLE IF NOT EXISTS nilai_ditanam (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak     UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  id_nilai    TEXT NOT NULL,
  ditanam_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_anak, id_nilai)
);

-- ── pilihan_harian ────────────────────────────────────────────────────────────
-- Delta pilihan Irama Hari pengguna terhadap hasil rotasi.
-- diff disimpan sebagai JSONB sesuai interface PilihanHarian.
-- Satu baris per anak per hari.
-- Data historis TIDAK dihapus saat anak naik band usia.

CREATE TABLE IF NOT EXISTS pilihan_harian (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak       UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  tanggal       DATE NOT NULL,
  diff          JSONB NOT NULL DEFAULT '{}',
  dibuat_pada   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_anak, tanggal)
);

-- ── kebun_riwayat ─────────────────────────────────────────────────────────────
-- Riwayat perawatan Kebun Tumbuh per domain.
-- Sumber tingkatRimbun — dihitung di klien dari tanggal_dirawat.
-- Data historis TIDAK dihapus saat anak naik band usia.

CREATE TABLE IF NOT EXISTS kebun_riwayat (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak        UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  id_domain      TEXT NOT NULL,
  tanggal_dirawat DATE NOT NULL,
  dibuat_pada    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── jejak ─────────────────────────────────────────────────────────────────────
-- Placeholder untuk fitur Jejak Anak (prompt terpisah).
-- Tabel dibuat sekarang agar migrasi future bisa FK ke sini.

CREATE TABLE IF NOT EXISTS jejak (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak     UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  tanggal     DATE NOT NULL,
  entri       JSONB NOT NULL DEFAULT '{}',
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── permohonan_koreksi_tgl_lahir ─────────────────────────────────────────────
-- Pengguna mengajukan koreksi; admin yang mengeksekusi perubahan.
-- tanggal_lahir di tabel anak TIDAK berubah sampai admin menyetujui.

CREATE TABLE IF NOT EXISTS permohonan_koreksi_tgl_lahir (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak          UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  tanggal_diminta  DATE NOT NULL,
  alasan           TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'menunggu'
                     CHECK (status IN ('menunggu', 'disetujui', 'ditolak')),
  dibuat_pada      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ditangani_pada   TIMESTAMPTZ
);
