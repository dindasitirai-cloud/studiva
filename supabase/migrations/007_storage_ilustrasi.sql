-- =============================================================================
-- 007_storage_ilustrasi.sql
-- RLS policies untuk Supabase Storage bucket "wawasan-ilustrasi".
-- Jalankan di Supabase SQL Editor SETELAH membuat bucket public bernama
-- "wawasan-ilustrasi" via Dashboard → Storage → New bucket.
-- =============================================================================

-- Staf Rekah (admin + peninjau_klinis) boleh upload
CREATE POLICY "staf_rekah_upload_ilustrasi"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'wawasan-ilustrasi'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'peninjau_klinis')
);

-- Semua orang boleh baca (bucket public)
CREATE POLICY "public_baca_ilustrasi"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'wawasan-ilustrasi');

-- Staf Rekah boleh hapus file yang mereka unggah
CREATE POLICY "staf_rekah_hapus_ilustrasi"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'wawasan-ilustrasi'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'peninjau_klinis')
);
