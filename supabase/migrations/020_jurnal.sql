-- ═══════════════════════════════════════════════════════════════════════════
-- 020 — Jurnal perjalanan (Temani)
-- Buku harian per anak per tanggal: tulisan pengguna (cerita) + daftar path foto.
-- Log otomatis TIDAK disimpan di sini — diturunkan on-the-fly dari data yang ada
-- (pilihan_harian.selesai/kustom, centang, refleksi_kegiatan). Additive.
--
-- Foto disimpan di Supabase Storage bucket PRIVAT "jurnal-foto".
-- Buat bucket dulu via Dashboard → Storage → New bucket (public = OFF),
-- lalu jalankan seluruh file ini di SQL Editor.
-- Konvensi path foto: <auth.uid()>/<id_anak>/<tanggal>/<acak>.<ext>
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS jurnal_hari (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak        UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  tanggal        DATE NOT NULL,
  cerita         TEXT NOT NULL DEFAULT '',
  foto           JSONB NOT NULL DEFAULT '[]'::jsonb,
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_anak, tanggal)
);

CREATE INDEX IF NOT EXISTS idx_jurnal_hari_anak ON jurnal_hari (id_anak, tanggal);

ALTER TABLE jurnal_hari ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jurnal_hari: lewat anak pemilik"
  ON jurnal_hari FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM anak
      WHERE anak.id = jurnal_hari.id_anak
        AND anak.id_orang_tua = auth.uid()
    )
  );

-- ── Storage policies untuk bucket "jurnal-foto" (folder pertama = auth.uid()) ──
CREATE POLICY "ortu_upload_foto_jurnal"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'jurnal-foto' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "ortu_baca_foto_jurnal"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'jurnal-foto' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "ortu_hapus_foto_jurnal"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'jurnal-foto' AND (storage.foldername(name))[1] = auth.uid()::text);
