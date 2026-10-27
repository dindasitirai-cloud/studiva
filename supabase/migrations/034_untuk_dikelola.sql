-- ═══════════════════════════════════════════════════════════════════════════
-- 034 — Untuk Dikelola (daftar centang Kelola)  [idempoten / aman dijalankan ulang]
-- Sebelumnya hanya tersimpan di localStorage perangkat (rekah_inbox_<idAnak>),
-- sehingga bisa hilang bila data browser dibersihkan atau ganti perangkat.
-- Kini setiap item tersimpan di akun, termasuk KAPAN item ditandai.
-- Item hanya hilang bila dihapus sendiri oleh orang tua.
--
-- id         : id dari aplikasi (contoh bawaan 's1'..'s5', buatan sendiri 'm-…')
-- dihapus_pada: hanya dipakai untuk contoh bawaan yang dihapus, supaya tidak
--               muncul lagi di perangkat lain. Item buatan sendiri dihapus permanen.
-- RLS: lewat anak pemilik (sama dengan jurnal_hari).
-- Sebelum dijalankan, aplikasi tetap bekerja dengan cadangan lokal.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS untuk_dikelola (
  id_anak         UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  id              TEXT NOT NULL,
  judul           TEXT NOT NULL DEFAULT '',
  keterangan      TEXT,
  sumber          TEXT NOT NULL DEFAULT 'manual',
  tenggat         TEXT,
  selesai         BOOLEAN NOT NULL DEFAULT FALSE,
  ditandai_pada   TIMESTAMPTZ,
  dibuat_pada     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dihapus_pada    TIMESTAMPTZ,
  PRIMARY KEY (id_anak, id)
);

CREATE INDEX IF NOT EXISTS idx_untuk_dikelola_anak ON untuk_dikelola (id_anak, dibuat_pada DESC);

ALTER TABLE untuk_dikelola ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "untuk_dikelola: lewat anak pemilik" ON untuk_dikelola;
CREATE POLICY "untuk_dikelola: lewat anak pemilik"
  ON untuk_dikelola FOR ALL
  USING (
    EXISTS (SELECT 1 FROM anak WHERE anak.id = untuk_dikelola.id_anak AND anak.id_orang_tua = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM anak WHERE anak.id = untuk_dikelola.id_anak AND anak.id_orang_tua = auth.uid())
  );

-- Verifikasi cepat (opsional): harus mengembalikan 1 baris.
-- SELECT to_regclass('public.untuk_dikelola') AS tabel_untuk_dikelola;
