-- ============================================================
-- Rekah — Musim, Langkah, Refleksi, Jurnal, Rencana Pekan
-- Migrasi: 011_rekah_musim_jurnal
--
-- Memindahkan enam tabel SQLite di backend Express ke Postgres:
--   rekah_profiles        → dipecah: anak.* + rekah_musim
--   rekah_seasons         → rekah_musim (digabung, lihat catatan)
--   rekah_completions     → rekah_langkah_selesai
--   rekah_reflections     → rekah_refleksi
--   rekah_journal_entries → rekah_jurnal
--   rekah_week_plans      → rekah_rencana_pekan
--
-- PERUBAHAN KUNCI: semua di-key ke id_anak, bukan user_id.
--   database/schema.sql baris 520 menandai ini sebagai utang:
--   "TODO: multi-anak pasca-MVP — tambah child_id FK".
--   Rekah mendukung banyak anak, jadi model per-user akan membuat
--   dua anak berbagi satu profil, satu jurnal, satu set langkah.
--   Migrasi ini menutup utang itu, bukan memindahkannya.
--
-- TIDAK ADA MIGRASI DATA. Tabel SQLite tidak pernah terisi di
-- produksi (backend Express belum pernah dideploy), jadi ini
-- pembuatan tabel bersih, bukan pemindahan baris.
--
-- Migrasi ini AMAN dijalankan berulang kali.
-- ============================================================

-- ── Kolom tambahan di anak ───────────────────────────────────────────────────
-- Sisa RekahProfile.anak yang belum punya rumah. namaPanggilan → nama_anak,
-- tanggalLahir → tanggal_lahir, dan caregiver → pendamping (010) sudah ada.

ALTER TABLE anak
  ADD COLUMN IF NOT EXISTS temperamen      TEXT,
  ADD COLUMN IF NOT EXISTS tantangan_utama TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'anak_temperamen_valid'
      AND conrelid = 'anak'::regclass
  ) THEN
    ALTER TABLE anak ADD CONSTRAINT anak_temperamen_valid
      CHECK (temperamen IS NULL OR temperamen IN ('tenang', 'aktif', 'sensitif', 'campuran'));
  END IF;
END $$;

COMMENT ON COLUMN anak.temperamen IS
  'RekahProfile.anak.temperamen. Deskriptif, bukan diagnosis.';
COMMENT ON COLUMN anak.tantangan_utama IS
  'RekahProfile.anak.tantanganUtama. Teks bebas dari orang tua.';

-- CATATAN: ProfilCaregiver.energiSaatIni ('penuh'|'cukup'|'menipis') sengaja
-- TIDAK dipersistensi. Itu keadaan "sekarang", bukan atribut. Menyimpannya
-- berarti menampilkan energi minggu lalu sebagai energi hari ini. Biarkan di
-- state klien dan tanyakan ulang saat dibutuhkan.

-- ── rekah_musim ──────────────────────────────────────────────────────────────
-- Menggabungkan rekah_profiles(current_week, musim_ke) DAN rekah_seasons.
--
-- Kenapa digabung: di Express keduanya terpisah, sehingga PUT /rekah/profile
-- harus mendeteksi perubahan nilaiFokus lalu menyalin baris ke rekah_seasons
-- secara manual. Logika rapuh yang gampang menghasilkan musim hantu.
-- Di sini satu musim = satu baris sepanjang hidupnya. Musim berjalan adalah
-- baris dengan selesai IS NULL. Menutup musim = mengisi selesai, lalu
-- menyisipkan baris baru. Tidak ada penyalinan.

CREATE TABLE IF NOT EXISTS rekah_musim (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak        UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  musim_ke       INTEGER NOT NULL CHECK (musim_ke >= 1),
  minggu_ke      INTEGER NOT NULL DEFAULT 1 CHECK (minggu_ke BETWEEN 1 AND 52),
  nilai_fokus    TEXT[] NOT NULL CHECK (cardinality(nilai_fokus) BETWEEN 1 AND 3),
  mulai          DATE NOT NULL DEFAULT CURRENT_DATE,
  selesai        DATE,
  total_langkah  INTEGER NOT NULL DEFAULT 0 CHECK (total_langkah >= 0),
  refleksi_musim JSONB,
  dibuat_pada    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_anak, musim_ke),
  CHECK (selesai IS NULL OR selesai >= mulai)
);

-- Satu anak hanya boleh punya satu musim berjalan.
CREATE UNIQUE INDEX IF NOT EXISTS rekah_musim_satu_berjalan
  ON rekah_musim (id_anak) WHERE selesai IS NULL;

CREATE INDEX IF NOT EXISTS idx_rekah_musim_anak
  ON rekah_musim (id_anak, musim_ke DESC);

COMMENT ON TABLE rekah_musim IS
  'Musim Rekah per anak. Baris dengan selesai IS NULL = musim berjalan.';
COMMENT ON COLUMN rekah_musim.nilai_fokus IS
  'Larik NilaiId. Express memaksa tepat 2; brand guide menyebut 3 akar jangkar. '
  'CHECK dilonggarkan ke 1-3 supaya keputusan itu tidak terkunci di skema.';

-- ── rekah_langkah_selesai ────────────────────────────────────────────────────
-- Dari rekah_completions. UNIQUE mengikuti aslinya: satu modul boleh diulang
-- di pekan atau musim lain, tapi tidak dua kali di pekan yang sama.

CREATE TABLE IF NOT EXISTS rekah_langkah_selesai (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak      UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  id_modul     TEXT NOT NULL,
  musim_ke     INTEGER NOT NULL CHECK (musim_ke >= 1),
  minggu_ke    INTEGER NOT NULL CHECK (minggu_ke BETWEEN 1 AND 52),
  selesai_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_anak, id_modul, minggu_ke, musim_ke)
);

CREATE INDEX IF NOT EXISTS idx_rekah_langkah_anak
  ON rekah_langkah_selesai (id_anak, musim_ke, minggu_ke);

-- ── rekah_refleksi ───────────────────────────────────────────────────────────
-- Dari rekah_reflections (CeritaHariIni). CHECK dipertahankan persis.

CREATE TABLE IF NOT EXISTS rekah_refleksi (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak          UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  id_modul         TEXT NOT NULL,
  tanggal          DATE NOT NULL,
  respon_anak      TEXT NOT NULL
                     CHECK (respon_anak IN ('seru', 'menantang', 'belum-tertarik')),
  mood_pendamping  TEXT
                     CHECK (mood_pendamping IS NULL OR mood_pendamping IN ('lega', 'biasa', 'lelah')),
  catatan          TEXT,
  nilai_utama      TEXT,
  simpan_ke_jurnal BOOLEAN NOT NULL DEFAULT FALSE,
  musim_ke         INTEGER NOT NULL CHECK (musim_ke >= 1),
  dibuat_pada      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_anak, id_modul, tanggal)
);

CREATE INDEX IF NOT EXISTS idx_rekah_refleksi_anak
  ON rekah_refleksi (id_anak, musim_ke, dibuat_pada);

COMMENT ON TABLE rekah_refleksi IS
  'CeritaHariIni per anak. UNIQUE (id_anak, id_modul, tanggal) menggantikan '
  'INSERT OR IGNORE berbasis id buatan klien di Express — idempotensi kini '
  'dijamin database, bukan format id. Klien tidak perlu lagi membuat id sendiri.';
COMMENT ON COLUMN rekah_refleksi.mood_pendamping IS
  'Dulu mood_caregiver. Diganti agar konsisten dengan kolom pendamping di anak.';

-- ── rekah_jurnal ─────────────────────────────────────────────────────────────
-- Dari rekah_journal_entries. Tabel baru, bukan jejak: jejak menyimpan entri
-- sebagai JSONB tanpa jaminan bentuk, sehingga judul/tag tidak bisa di-index
-- atau divalidasi.

CREATE TABLE IF NOT EXISTS rekah_jurnal (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak     UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  judul       TEXT NOT NULL CHECK (length(btrim(judul)) >= 1),
  catatan     TEXT NOT NULL CHECK (length(btrim(catatan)) >= 1),
  tanggal     DATE NOT NULL DEFAULT CURRENT_DATE,
  id_nilai    TEXT,
  tag         TEXT NOT NULL DEFAULT 'manual'
                CHECK (tag IN ('refleksi', 'penutup-musim', 'manual')),
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rekah_jurnal_anak
  ON rekah_jurnal (id_anak, dibuat_pada DESC);

-- ── rekah_rencana_pekan ──────────────────────────────────────────────────────
-- Dari rekah_week_plans. module_ids yang dulu TEXT berisi JSON array kini
-- TEXT[] asli, jadi batas 7 langkah dijaga database, bukan handler Express.

CREATE TABLE IF NOT EXISTS rekah_rencana_pekan (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak         UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  musim_ke        INTEGER NOT NULL DEFAULT 1 CHECK (musim_ke >= 1),
  minggu_ke       INTEGER NOT NULL DEFAULT 1 CHECK (minggu_ke BETWEEN 1 AND 52),
  id_modul        TEXT[] NOT NULL DEFAULT '{}' CHECK (cardinality(id_modul) <= 7),
  dibuat_pada     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_anak, musim_ke, minggu_ke)
);

-- ── Trigger diperbarui_pada ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sentuh_diperbarui_pada()
RETURNS TRIGGER AS $$
BEGIN
  NEW.diperbarui_pada = NOW();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rekah_musim_sentuh ON rekah_musim;
CREATE TRIGGER trg_rekah_musim_sentuh
  BEFORE UPDATE ON rekah_musim
  FOR EACH ROW EXECUTE FUNCTION sentuh_diperbarui_pada();

DROP TRIGGER IF EXISTS trg_rekah_rencana_pekan_sentuh ON rekah_rencana_pekan;
CREATE TRIGGER trg_rekah_rencana_pekan_sentuh
  BEFORE UPDATE ON rekah_rencana_pekan
  FOR EACH ROW EXECUTE FUNCTION sentuh_diperbarui_pada();

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Pola sama persis dengan 002_rls_policies.sql: kepemilikan lewat anak.
--
-- WITH CHECK ditulis eksplisit di sini semata untuk keterbacaan. Postgres
-- sudah memakai ulang ekspresi USING sebagai WITH CHECK bila WITH CHECK tidak
-- ditulis, jadi policy di 002 yang hanya punya USING TIDAK bocor pada INSERT —
-- perilakunya identik. Menuliskannya hanya membuat maksudnya terbaca tanpa
-- perlu mengingat aturan bawaan itu.

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'rekah_musim',
    'rekah_langkah_selesai',
    'rekah_refleksi',
    'rekah_jurnal',
    'rekah_rencana_pekan'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || ': lewat anak pemilik', t);
    EXECUTE format($f$
      CREATE POLICY %I ON %I FOR ALL
        USING (
          EXISTS (SELECT 1 FROM anak
                  WHERE anak.id = %I.id_anak AND anak.id_orang_tua = auth.uid())
        )
        WITH CHECK (
          EXISTS (SELECT 1 FROM anak
                  WHERE anak.id = %I.id_anak AND anak.id_orang_tua = auth.uid())
        )
    $f$, t || ': lewat anak pemilik', t, t, t);
  END LOOP;
END $$;

-- ── Verifikasi cepat ─────────────────────────────────────────────────────────
-- Jalankan setelah migrasi; kelima baris harus rowsecurity = true.
--
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE tablename LIKE 'rekah\_%' ORDER BY tablename;
--
-- Uji RLS sungguhan (dua akun) ada di supabase/tests/rls_test.sql —
-- tambahkan kelima tabel ini ke sana sebelum rilis.
