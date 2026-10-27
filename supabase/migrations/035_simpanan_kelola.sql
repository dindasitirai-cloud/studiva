-- ═══════════════════════════════════════════════════════════════════════════
-- 035 — Simpanan Kelola, Temani & Bantu per anak  [idempoten]
-- Sebelumnya data Kelola, Temani, dan Bantu hanya tersimpan di localStorage
-- perangkat, antara lain:
--   rekah_rencana_v3_<anak>_<senin>     rencana per hari (pagi/siang/malam/kelola)
--   rekah_hariini_v3_<anak>_<tanggal>   papan hari (kegiatan, to-do, urutan, tanda)
--   rekah_irama_default_, rekah_centanglokal_, rekah_tinjau_, rekah_fokus_minggu_,
--   rekah_refleksi_                     Irama Keseharian lainnya
--   rekah_kehidupan_, rekah_peta_, rekah_peristiwa_, rekah_imunisasi_, rekah_nifas_,
--   rekah_piring_, rekah_cara_mengasuh_ Kehidupan Keluarga
--   rekah_temani_<anak>                 perjalanan Temani & progresnya
--   rekah_bantu_tersimpan_<anak>        panduan Bantu yang disimpan
-- Daftar lengkapnya ada di apps/digital/src/lib/simpananKelola.ts (AWALAN).
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
