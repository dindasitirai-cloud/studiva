-- ============================================================
-- Membuka gerbang langganan untuk akun uji — HANYA untuk dev/staging.
--
-- Kenapa perlu: SubscriptionGuard mengarahkan ke /pricing bila status bukan
-- 'aktif'. Akun baru berstatus 'belum_pernah', jadi seluruh dashboard Rekah
-- tertutup dan jalur orang tua tidak bisa diuji.
--
-- Kenapa harus lewat SQL Editor: migrasi 004 sengaja TIDAK memberi policy
-- INSERT/UPDATE pada `langganan` untuk role authenticated — hanya service_role
-- (webhook Stripe) yang boleh menulis, supaya klien tidak bisa memalsukan
-- status 'aktif'. Itu rancangan yang benar dan jangan diubah. SQL Editor
-- berjalan sebagai service_role, jadi ia memang jalur yang sah untuk ini.
--
-- ⚠️  JANGAN jalankan ini di database produksi. Ia memberi akses berbayar
--     tanpa pembayaran.
-- ============================================================

-- Sudah terisi untuk akun uji A (ujia@rekah.id). Login ke aplikasi lokal
-- dengan akun itu, bukan akun pribadimu — data uji jadi terpisah dan mudah
-- dibuang. Ganti UUID di bawah kalau mau memakai akun lain.
--
--   Cari UUID akun lain:  SELECT id, email FROM auth.users ORDER BY created_at DESC;

-- 1. Pastikan barisnya ada di orang_tua (langganan punya FK ke sini)
INSERT INTO orang_tua (id, email)
SELECT id, email FROM auth.users
WHERE id = 'e902ed9b-7ee9-4d81-9645-cad319964394'
ON CONFLICT (id) DO NOTHING;

-- 2. Aktifkan langganan setahun
INSERT INTO langganan (id_orang_tua, status, akhir_periode)
VALUES (
  'e902ed9b-7ee9-4d81-9645-cad319964394',   -- akun uji A (ujia@rekah.id)
  'aktif',
  NOW() + INTERVAL '1 year'
)
ON CONFLICT (id_orang_tua) DO UPDATE
  SET status          = 'aktif',
      akhir_periode   = NOW() + INTERVAL '1 year',
      diperbarui_pada = NOW()
RETURNING id_orang_tua, status, akhir_periode,
          has_langganan_aktif(id_orang_tua) AS lolos_gerbang;

-- RETURNING dipakai, bukan SELECT terpisah di bawahnya: statement ini
-- membuktikan keberhasilannya sendiri. Versi sebelumnya memisahkan verifikasi
-- ke query lain, dan kalau kamu hanya menyorot sebagian isi berkas lalu Run,
-- INSERT-nya terlewat tanpa satu pun tanda bahwa ada yang tidak berjalan.
--
-- Harus mengembalikan 1 baris dengan lolos_gerbang = true.
-- Kalau false, periksa akhir_periode > NOW().
--
-- ⚠️  Di SQL Editor, teks yang tersorot membatasi apa yang dijalankan tombol
--     Run. Pastikan tidak ada seleksi aktif, atau sorot tepat satu statement.

-- Setelah ini, REFRESH browser. SubscriptionGuard memeriksa status saat
-- halaman dimuat, jadi perubahan di database tidak terasa tanpa reload.
--
-- Akun uji B (ujib@rekah.id, e909600f-3a76-4738-9cd7-d436390865a4) SENGAJA
-- dibiarkan tanpa langganan — ia hanya dipakai sebagai "orang lain" di uji RLS,
-- tidak pernah login ke aplikasi.

-- ── Mengembalikan ke keadaan semula setelah selesai menguji ──────────────────
--
--   UPDATE langganan SET status = 'belum_pernah', akhir_periode = NULL,
--                        diperbarui_pada = NOW()
--   WHERE id_orang_tua = 'e902ed9b-7ee9-4d81-9645-cad319964394';
--
-- Berguna juga untuk menguji sisi lain gerbang: layar /pricing dan pesan
-- kedaluwarsa hanya muncul kalau status BUKAN 'aktif'.

-- ── CATATAN: jangan pakai jalur staf untuk ini ───────────────────────────────
-- SubscriptionGuard juga melewatkan pengguna dengan app_metadata.role =
-- 'admin' atau 'peninjau_klinis'. Menggodanya untuk dipakai sebagai jalan
-- pintas, TAPI peran staf juga membuka RLS konten (migrasi 006: melihat semua
-- draf, menyetujui konten). Kamu jadi menguji pengalaman yang bukan pengalaman
-- orang tua, dan bug khusus orang tua tidak akan terlihat. Pakai langganan.
