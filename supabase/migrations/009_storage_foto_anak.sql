-- =============================================================================
-- 009_storage_foto_anak.sql
-- RLS policies untuk Supabase Storage bucket "foto-anak".
--
-- Jalankan di Supabase SQL Editor SETELAH membuat bucket PRIVAT bernama
-- "foto-anak" via Dashboard → Storage → New bucket (public = OFF).
--
-- PENTING: bucket ini PRIVAT, berbeda dengan "wawasan-ilustrasi".
-- Isinya foto anak. Akses baca hanya lewat signed URL berumur pendek.
--
-- Konvensi path: <id_orang_tua>/<id_anak>.<ext>
-- Folder pertama = auth.uid(), itu yang dipakai policy untuk isolasi.
-- =============================================================================

-- Orang tua boleh unggah hanya ke foldernya sendiri
CREATE POLICY "ortu_upload_foto_anak"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'foto-anak'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Orang tua boleh mengganti fotonya sendiri
CREATE POLICY "ortu_ganti_foto_anak"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'foto-anak'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'foto-anak'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Orang tua boleh membaca fotonya sendiri (dasar untuk signed URL)
CREATE POLICY "ortu_baca_foto_anak"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'foto-anak'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Orang tua boleh menghapus fotonya sendiri
CREATE POLICY "ortu_hapus_foto_anak"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'foto-anak'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admin boleh membaca semua (dukungan permohonan koreksi)
CREATE POLICY "admin_baca_foto_anak"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'foto-anak'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
