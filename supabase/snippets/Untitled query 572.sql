-- Rekah — seed identitas uji A ke Supabase LOKAL (disposable). JANGAN dijalankan ke produksi.
-- Prasyarat: user auth 'a@uji.test' sudah dibuat via Studio (Auto Confirm ON).
-- Perintah: supabase db query --file seed-parent-A.sql

-- 1) profil orang_tua (id = auth.users.id → memenuhi orang_tua.id = auth.uid())
INSERT INTO orang_tua (id, email)
  SELECT id, email FROM auth.users WHERE email = 'a@uji.test'
  ON CONFLICT (id) DO NOTHING;

-- 2) langganan AKTIF (melewati gerbang pembayaran: status='aktif' DAN akhir_periode > now)
INSERT INTO langganan (id_orang_tua, status, akhir_periode)
  SELECT id, 'aktif', now() + interval '365 days' FROM auth.users WHERE email = 'a@uji.test'
  ON CONFLICT (id_orang_tua) DO UPDATE SET status = 'aktif', akhir_periode = now() + interval '365 days';

-- 3) satu anak (usia balita → punya konten journey). Ubah tanggal bila mau usia lain.
INSERT INTO anak (id_orang_tua, nama_anak, tanggal_lahir)
  SELECT id, 'Anak A1', DATE '2024-06-15' FROM auth.users WHERE email = 'a@uji.test';

-- verifikasi
SELECT ot.email, l.status AS langganan, a.nama_anak, a.tanggal_lahir
  FROM orang_tua ot
  LEFT JOIN langganan l ON l.id_orang_tua = ot.id
  LEFT JOIN anak a ON a.id_orang_tua = ot.id
  WHERE ot.email = 'a@uji.test';