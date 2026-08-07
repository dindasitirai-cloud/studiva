-- ============================================================
-- ⚠️  UJI 3 DAN 4 DI BAWAH TIDAK MENGUJI APA PUN. JANGAN DIPERCAYA.
--
-- Keduanya menyaring lewat subquery `SELECT id FROM anak WHERE id_orang_tua = B`.
-- Subquery itu sendiri tunduk pada RLS, jadi saat login sebagai A ia selalu
-- mengembalikan 0 baris — dan `id_anak IN (himpunan kosong)` selalu 0 baris
-- apa pun keadaan RLS pada tabel yang diuji. Uji 3 dan 4 akan LULUS bahkan
-- bila RLS di nilai_ditanam dan pilihan_harian dimatikan sepenuhnya.
--
-- Uji 1 dan 2 sah (menyaring langsung pada kolom tabelnya sendiri).
--
-- Pola yang benar, plus uji tulis/update/delete yang belum ada di sini, ada di
-- rls_test_musim.sql. Perbaiki uji 3 dan 4 dengan pola itu (UUID anak langsung,
-- bukan lewat subquery) sebelum rilis.
-- ============================================================

-- ============================================================
-- Pengujian RLS — jalankan di Supabase SQL Editor
-- sebagai pengguna dengan role 'authenticated'.
--
-- Cara uji manual:
--   1. Daftarkan dua akun: orang_tua_a@test.com & orang_tua_b@test.com
--   2. Tambahkan profil anak untuk masing-masing
--   3. Jalankan query di bawah sambil login sebagai orang_tua_a
--   4. Semua query harus mengembalikan 0 baris
-- ============================================================

-- Ganti UUID ini dengan UUID orang tua B yang sebenarnya
DO $$
DECLARE
  id_orang_tua_b UUID := '00000000-0000-0000-0000-000000000000'; -- GANTI
BEGIN
  -- Test 1: Tidak bisa baca data orang tua lain
  ASSERT (
    SELECT COUNT(*) FROM orang_tua WHERE id = id_orang_tua_b
  ) = 0,
  'GAGAL: bisa membaca data orang_tua milik orang lain';

  -- Test 2: Tidak bisa baca anak orang tua lain
  ASSERT (
    SELECT COUNT(*) FROM anak WHERE id_orang_tua = id_orang_tua_b
  ) = 0,
  'GAGAL: bisa membaca anak milik orang tua lain';

  -- Test 3: Tidak bisa baca nilai_ditanam anak orang tua lain
  ASSERT (
    SELECT COUNT(*) FROM nilai_ditanam
    WHERE id_anak IN (SELECT id FROM anak WHERE id_orang_tua = id_orang_tua_b)
  ) = 0,
  'GAGAL: bisa membaca nilai_ditanam milik orang tua lain';

  -- Test 4: Tidak bisa baca pilihan_harian anak orang tua lain
  ASSERT (
    SELECT COUNT(*) FROM pilihan_harian
    WHERE id_anak IN (SELECT id FROM anak WHERE id_orang_tua = id_orang_tua_b)
  ) = 0,
  'GAGAL: bisa membaca pilihan_harian milik orang tua lain';

  RAISE NOTICE 'Semua uji RLS lulus.';
END $$;
