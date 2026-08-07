-- ============================================================
-- Uji RLS tabel migrasi 011 — SIAPKAN DATA + UJI, satu berkas.
--
-- ── Yang perlu kamu lakukan sebelum menjalankan ──────────────────────────────
--
--   1. Buat dua pengguna di Dashboard → Authentication → Users → Add user:
--        A → ujia@rekah.id
--        B → ujib@rekah.id
--      Password bebas. Tidak perlu login ke aplikasi.
--
--   2. Jalankan BAGIAN 0 sampai 3 berurutan di SQL Editor.
--      Tidak ada yang perlu diganti lagi — kedua email sudah terisi di berkas
--      ini, dan semua UUID diturunkan dari email lewat join ke auth.users.
--
--   Kalau nanti memakai email uji lain, Find & Replace dua kali:
--     ujia@rekah.id → email A baru,  ujib@rekah.id → email B baru.
--
-- ── Kenapa tidak "login sebagai A" ───────────────────────────────────────────
--
-- SQL Editor berjalan sebagai service_role, yang MELEWATI RLS sepenuhnya.
-- Menjalankan uji apa adanya di sini akan melaporkan "bocor" pada semua tabel,
-- bukan karena RLS rusak. BAGIAN 3 menyamar jadi A lewat set_config supaya
-- yang diuji benar-benar RLS.
--
-- ── Kenapa uji ini tidak memakai pola rls_test.sql ───────────────────────────
--
-- Uji 3 dan 4 di rls_test.sql menyaring lewat subquery:
--     WHERE id_anak IN (SELECT id FROM anak WHERE id_orang_tua = <B>)
-- Subquery itu sendiri tunduk RLS, jadi saat menyamar sebagai A ia selalu
-- kosong, dan `id_anak IN (kosong)` selalu 0 baris — apa pun keadaan RLS pada
-- tabel yang diuji. Uji itu lulus bahkan bila RLS dimatikan. Di sini UUID anak
-- B dipakai LANGSUNG, jadi penyaringan yang diuji benar-benar penyaringan RLS.
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- BAGIAN 0 — Pastikan kedua akun ada
-- Harapan: 2 baris. Kalau kurang, akunnya belum dibuat / email salah ketik.
-- ════════════════════════════════════════════════════════════

SELECT id, email, created_at
FROM auth.users
WHERE email IN ('ujia@rekah.id', 'ujib@rekah.id')
ORDER BY email;


-- ════════════════════════════════════════════════════════════
-- BAGIAN 1 — Buat baris orang_tua dan anak untuk keduanya
-- Aman dijalankan berulang kali.
-- ════════════════════════════════════════════════════════════

INSERT INTO orang_tua (id, email)
SELECT id, email FROM auth.users
WHERE email IN ('ujia@rekah.id', 'ujib@rekah.id')
ON CONFLICT (id) DO NOTHING;

-- Tabel anak tidak punya kunci unik pada nama, jadi penjagaan idempotensi
-- pakai NOT EXISTS — supaya menjalankan ulang tidak menumpuk anak kembar.
INSERT INTO anak (id_orang_tua, nama_anak, tanggal_lahir)
SELECT u.id, 'Anak Uji A', '2023-01-15'
FROM auth.users u
WHERE u.email = 'ujia@rekah.id'
  AND NOT EXISTS (
    SELECT 1 FROM anak a WHERE a.id_orang_tua = u.id AND a.nama_anak = 'Anak Uji A'
  );

INSERT INTO anak (id_orang_tua, nama_anak, tanggal_lahir)
SELECT u.id, 'Anak Uji B', '2023-01-15'
FROM auth.users u
WHERE u.email = 'ujib@rekah.id'
  AND NOT EXISTS (
    SELECT 1 FROM anak a WHERE a.id_orang_tua = u.id AND a.nama_anak = 'Anak Uji B'
  );

-- Periksa: harus 2 baris.
SELECT a.id AS id_anak, a.nama_anak, u.email
FROM anak a JOIN auth.users u ON u.id = a.id_orang_tua
WHERE u.email IN ('ujia@rekah.id', 'ujib@rekah.id')
ORDER BY u.email;


-- ════════════════════════════════════════════════════════════
-- BAGIAN 2 — Isi data milik B yang nanti dicoba dibocorkan
--
-- JANGAN LEWATI. Tanpa data, uji baca di BAGIAN 3 lulus secara palsu —
-- persis kelemahan yang membuat uji 3 & 4 di rls_test.sql tidak berguna.
-- ════════════════════════════════════════════════════════════

INSERT INTO rekah_musim (id_anak, musim_ke, nilai_fokus)
SELECT a.id, 1, ARRAY['Kejujuran']
FROM anak a JOIN auth.users u ON u.id = a.id_orang_tua
WHERE u.email = 'ujib@rekah.id' AND a.nama_anak = 'Anak Uji B'
ON CONFLICT (id_anak, musim_ke) DO NOTHING;

INSERT INTO rekah_jurnal (id_anak, judul, catatan)
SELECT a.id, 'Rahasia B', 'Tidak boleh terlihat oleh A'
FROM anak a JOIN auth.users u ON u.id = a.id_orang_tua
WHERE u.email = 'ujib@rekah.id' AND a.nama_anak = 'Anak Uji B'
  AND NOT EXISTS (
    SELECT 1 FROM rekah_jurnal j WHERE j.id_anak = a.id AND j.judul = 'Rahasia B'
  );

INSERT INTO rekah_langkah_selesai (id_anak, id_modul, musim_ke, minggu_ke)
SELECT a.id, 'modul-uji-b', 1, 1
FROM anak a JOIN auth.users u ON u.id = a.id_orang_tua
WHERE u.email = 'ujib@rekah.id' AND a.nama_anak = 'Anak Uji B'
ON CONFLICT (id_anak, id_modul, minggu_ke, musim_ke) DO NOTHING;

INSERT INTO rekah_refleksi (id_anak, id_modul, tanggal, respon_anak, musim_ke)
SELECT a.id, 'modul-uji-b', CURRENT_DATE, 'seru', 1
FROM anak a JOIN auth.users u ON u.id = a.id_orang_tua
WHERE u.email = 'ujib@rekah.id' AND a.nama_anak = 'Anak Uji B'
ON CONFLICT (id_anak, id_modul, tanggal) DO NOTHING;

INSERT INTO rekah_rencana_pekan (id_anak, musim_ke, minggu_ke, id_modul)
SELECT a.id, 1, 1, ARRAY['modul-uji-b']
FROM anak a JOIN auth.users u ON u.id = a.id_orang_tua
WHERE u.email = 'ujib@rekah.id' AND a.nama_anak = 'Anak Uji B'
ON CONFLICT (id_anak, musim_ke, minggu_ke) DO NOTHING;

-- Periksa: kelima tabel harus terisi minimal 1 baris untuk anak B.
SELECT 'rekah_musim' AS tabel, COUNT(*) FROM rekah_musim m
  JOIN anak a ON a.id = m.id_anak JOIN auth.users u ON u.id = a.id_orang_tua
  WHERE u.email = 'ujib@rekah.id'
UNION ALL SELECT 'rekah_jurnal', COUNT(*) FROM rekah_jurnal j
  JOIN anak a ON a.id = j.id_anak JOIN auth.users u ON u.id = a.id_orang_tua
  WHERE u.email = 'ujib@rekah.id'
UNION ALL SELECT 'rekah_langkah_selesai', COUNT(*) FROM rekah_langkah_selesai l
  JOIN anak a ON a.id = l.id_anak JOIN auth.users u ON u.id = a.id_orang_tua
  WHERE u.email = 'ujib@rekah.id'
UNION ALL SELECT 'rekah_refleksi', COUNT(*) FROM rekah_refleksi r
  JOIN anak a ON a.id = r.id_anak JOIN auth.users u ON u.id = a.id_orang_tua
  WHERE u.email = 'ujib@rekah.id'
UNION ALL SELECT 'rekah_rencana_pekan', COUNT(*) FROM rekah_rencana_pekan p
  JOIN anak a ON a.id = p.id_anak JOIN auth.users u ON u.id = a.id_orang_tua
  WHERE u.email = 'ujib@rekah.id';


-- ════════════════════════════════════════════════════════════
-- BAGIAN 3 — Uji RLS. Jalankan SELURUH bagian ini sekaligus.
--
-- Menjalankan DO block-nya saja tanpa BEGIN dan dua set_config di atasnya
-- tidak akan menguji apa pun — kamu masih service_role.
--
-- Harapan: berhenti dengan pesan 'SEMUA UJI RLS LULUS'.
-- ════════════════════════════════════════════════════════════

BEGIN;

-- Simpan UUID anak B SEBELUM berganti peran. Setelah SET LOCAL ROLE
-- authenticated, tabel auth.users tidak lagi terbaca.
SELECT set_config(
  'uji.id_anak_b',
  (SELECT a.id::text FROM anak a JOIN auth.users u ON u.id = a.id_orang_tua
   WHERE u.email = 'ujib@rekah.id' AND a.nama_anak = 'Anak Uji B'),
  true
);

-- Menyamar sebagai orang tua A. auth.uid() membaca klaim 'sub' dari sini.
SELECT set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',  (SELECT id::text FROM auth.users WHERE email = 'ujia@rekah.id'),
    'role', 'authenticated'
  )::text,
  true
);

SET LOCAL ROLE authenticated;

DO $$
DECLARE
  id_anak_b UUID := current_setting('uji.id_anak_b', true)::uuid;
  v_ditolak BOOLEAN;
  v_jumlah  INTEGER;
BEGIN
  -- ── Pemeriksaan penyamaran ────────────────────────────────────────────────
  ASSERT id_anak_b IS NOT NULL,
    'GAGAL SIAPKAN: anak B tidak ditemukan. Sudah jalankan BAGIAN 1 dan 2?';
  ASSERT auth.uid() IS NOT NULL,
    'GAGAL SIAPKAN: auth.uid() kosong — penyamaran tidak jalan. Email A benar?';
  ASSERT current_user = 'authenticated',
    'GAGAL SIAPKAN: masih berjalan sebagai ' || current_user || '.';

  -- A memang tidak melihat baris anak B. Kalau ini gagal, RLS pada `anak`
  -- yang rusak dan sisa uji tidak bermakna.
  ASSERT (SELECT COUNT(*) FROM anak WHERE id = id_anak_b) = 0,
    'GAGAL: A bisa melihat baris anak milik B — RLS pada anak rusak';

  -- ── Uji BACA ──────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_jumlah FROM rekah_musim WHERE id_anak = id_anak_b;
  ASSERT v_jumlah = 0, 'GAGAL: rekah_musim milik anak B terbaca oleh A';

  SELECT COUNT(*) INTO v_jumlah FROM rekah_langkah_selesai WHERE id_anak = id_anak_b;
  ASSERT v_jumlah = 0, 'GAGAL: rekah_langkah_selesai milik anak B terbaca oleh A';

  SELECT COUNT(*) INTO v_jumlah FROM rekah_refleksi WHERE id_anak = id_anak_b;
  ASSERT v_jumlah = 0, 'GAGAL: rekah_refleksi milik anak B terbaca oleh A';

  SELECT COUNT(*) INTO v_jumlah FROM rekah_jurnal WHERE id_anak = id_anak_b;
  ASSERT v_jumlah = 0, 'GAGAL: rekah_jurnal milik anak B terbaca oleh A';

  SELECT COUNT(*) INTO v_jumlah FROM rekah_rencana_pekan WHERE id_anak = id_anak_b;
  ASSERT v_jumlah = 0, 'GAGAL: rekah_rencana_pekan milik anak B terbaca oleh A';

  -- ── Uji TULIS ─────────────────────────────────────────────────────────────
  -- Kebocoran tulis lebih berbahaya daripada kebocoran baca: A bisa menanam
  -- entri jurnal di akun B. WITH CHECK yang menahannya.
  v_ditolak := FALSE;
  BEGIN
    INSERT INTO rekah_jurnal (id_anak, judul, catatan)
    VALUES (id_anak_b, 'sisipan dari A', 'seharusnya ditolak');
  EXCEPTION
    WHEN insufficient_privilege THEN v_ditolak := TRUE;
    WHEN check_violation       THEN v_ditolak := TRUE;
  END;
  ASSERT v_ditolak, 'GAGAL: A berhasil menyisipkan jurnal ke anak B';

  v_ditolak := FALSE;
  BEGIN
    INSERT INTO rekah_musim (id_anak, musim_ke, nilai_fokus)
    VALUES (id_anak_b, 990, ARRAY['Kejujuran']);
  EXCEPTION
    WHEN insufficient_privilege THEN v_ditolak := TRUE;
    WHEN check_violation       THEN v_ditolak := TRUE;
  END;
  ASSERT v_ditolak, 'GAGAL: A berhasil membuat musim untuk anak B';

  v_ditolak := FALSE;
  BEGIN
    INSERT INTO rekah_refleksi (id_anak, id_modul, tanggal, respon_anak, musim_ke)
    VALUES (id_anak_b, 'sisipan', CURRENT_DATE, 'seru', 1);
  EXCEPTION
    WHEN insufficient_privilege THEN v_ditolak := TRUE;
    WHEN check_violation       THEN v_ditolak := TRUE;
  END;
  ASSERT v_ditolak, 'GAGAL: A berhasil menyisipkan refleksi ke anak B';

  -- ── Uji UPDATE & DELETE ───────────────────────────────────────────────────
  -- Baris B tidak terlihat, jadi perintah ini "berhasil" tapi harus menyentuh
  -- 0 baris. Yang diuji jumlah baris terpengaruh, bukan ada/tidaknya galat.
  UPDATE rekah_jurnal SET judul = 'dibajak' WHERE id_anak = id_anak_b;
  GET DIAGNOSTICS v_jumlah = ROW_COUNT;
  ASSERT v_jumlah = 0, 'GAGAL: A mengubah baris jurnal milik anak B';

  DELETE FROM rekah_musim WHERE id_anak = id_anak_b;
  GET DIAGNOSTICS v_jumlah = ROW_COUNT;
  ASSERT v_jumlah = 0, 'GAGAL: A menghapus musim milik anak B';

  -- ── Sanity check ──────────────────────────────────────────────────────────
  -- Kalau A tidak punya anak sama sekali, semua uji di atas lulus tanpa arti.
  SELECT COUNT(*) INTO v_jumlah FROM anak;
  ASSERT v_jumlah > 0,
    'TIDAK SAH: A tidak melihat anak mana pun. BAGIAN 1 mungkin belum jalan.';

  RAISE EXCEPTION 'SEMUA UJI RLS LULUS (A melihat % anak miliknya) — rollback disengaja.', v_jumlah;
END $$;

ROLLBACK;

-- EXCEPTION di atas sudah membatalkan transaksi; ROLLBACK ini penutup saja.
-- Penyamaran ikut hilang — sesi kembali jadi service_role setelah ini.
--
-- Melihat 'SEMUA UJI RLS LULUS' adalah HASIL YANG BENAR.
-- Pesan diawali 'GAGAL:' berarti ada kebocoran.
-- Pesan diawali 'GAGAL SIAPKAN:' berarti persiapannya yang belum benar,
-- bukan RLS-nya.


-- ════════════════════════════════════════════════════════════
-- BAGIAN 4 — Pembersihan (opsional, jalankan sebagai service_role)
-- ON DELETE CASCADE dari anak ikut menghapus seluruh data musimnya.
-- ════════════════════════════════════════════════════════════

-- DELETE FROM anak WHERE nama_anak IN ('Anak Uji A', 'Anak Uji B');
-- DELETE FROM orang_tua WHERE id IN (
--   SELECT id FROM auth.users WHERE email IN ('ujia@rekah.id', 'ujib@rekah.id')
-- );
