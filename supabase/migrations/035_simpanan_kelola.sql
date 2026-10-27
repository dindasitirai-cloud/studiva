-- ═══════════════════════════════════════════════════════════════════════════
-- 035 — Simpanan Kelola (rencana mingguan & papan harian)  [idempoten]
-- Sebelumnya Irama Keseharian hanya tersimpan di localStorage perangkat:
--   rekah_rencana_v3_<anak>_<senin>     rencana per hari (pagi/siang/malam/kelola)
--   rekah_hariini_v3_<anak>_<tanggal>   papan hari (kegiatan, to-do, urutan, tanda)
--   rekah_irama_default_<anak>          kegiatan bawaan yang diubah
--   rekah_centanglokal_<anak>_<tanggal> centang kebiasaan di hari selain hari ini
--   rekah_tinjau_<anak>_<senin>         tinjauan minggu (+ rekah_tinjau_nanti_…)
-- Kini setiap kunci juga tersimpan di akun (satu baris per kunci), sehingga tidak
-- hilang saat data browser dibersihkan atau ganti perangkat. Yang terakhir
-- diubah menang. Baris hanya hilang bila datanya dihapus dari aplikasi.
-- RLS: lewat anak pemilik. Sebelum dijalankan, aplikasi tetap memakai cadangan
-- lokal dan mengunggah otomatis begitu tabel tersedia.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS simpanan_kelola (
  id_anak         UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  kunci           TEXT NOT NULL,
  isi             TEXT NOT NULL,
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_anak, kunci)
);

ALTER TABLE simpanan_kelola ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "simpanan_kelola: lewat anak pemilik" ON simpanan_kelola;
CREATE POLICY "simpanan_kelola: lewat anak pemilik"
  ON simpanan_kelola FOR ALL
  USING (
    EXISTS (SELECT 1 FROM anak WHERE anak.id = simpanan_kelola.id_anak AND anak.id_orang_tua = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM anak WHERE anak.id = simpanan_kelola.id_anak AND anak.id_orang_tua = auth.uid())
  );

-- Verifikasi cepat (opsional): harus mengembalikan 1 baris.
-- SELECT to_regclass('public.simpanan_kelola') AS tabel_simpanan_kelola;
