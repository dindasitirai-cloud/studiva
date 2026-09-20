-- ═══════════════════════════════════════════════════════════════════════════
-- 020 — Jurnal perjalanan (Temani)  [idempoten / aman dijalankan ulang]
-- Buku harian per anak per tanggal: tulisan pengguna (cerita) + daftar path foto.
-- Log otomatis TIDAK disimpan di sini — diturunkan on-the-fly dari data yang ada.
--
-- Foto di Supabase Storage bucket PRIVAT "jurnal-foto".
-- Buat bucket dulu (Dashboard → Storage → New bucket, public = OFF),
-- lalu jalankan SELURUH file ini di SQL Editor. Boleh dijalankan berulang.
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

DROP POLICY IF EXISTS "jurnal_hari: lewat anak pemilik" ON jurnal_hari;
CREATE POLICY "jurnal_hari: lewat anak pemilik"
  ON jurnal_hari FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM anak
      WHERE anak.id = jurnal_hari.id_anak
        AND anak.id_orang_tua = auth.uid()
    )
  );

-- Bucket privat (idempoten) — berlaku untuk DB lokal maupun cloud, jadi tak
-- perlu membuat bucket manual di dashboard.
INSERT INTO storage.buckets (id, name, public)
VALUES ('jurnal-foto', 'jurnal-foto', false)
ON CONFLICT (id) DO NOTHING;

-- ── Storage policies untuk bucket "jurnal-foto" (folder pertama = auth.uid()) ──
DROP POLICY IF EXISTS "ortu_upload_foto_jurnal" ON storage.objects;
CREATE POLICY "ortu_upload_foto_jurnal"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'jurnal-foto' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "ortu_baca_foto_jurnal" ON storage.objects;
CREATE POLICY "ortu_baca_foto_jurnal"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'jurnal-foto' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "ortu_hapus_foto_jurnal" ON storage.objects;
CREATE POLICY "ortu_hapus_foto_jurnal"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'jurnal-foto' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Verifikasi cepat (opsional): harus mengembalikan 1 baris.
-- SELECT to_regclass('public.jurnal_hari') AS tabel_jurnal_hari;
