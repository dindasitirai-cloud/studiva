-- ============================================================
-- Verifikasi migrasi 011 — jalankan di Supabase SQL Editor
-- setelah 011_rekah_musim_jurnal.sql dijalankan.
--
-- Ini uji STRUKTUR, bukan uji RLS. Uji RLS yang sebenarnya butuh dua akun —
-- lihat rls_test_musim.sql.
--
-- Semua blok di bawah aman dijalankan berulang kali dan tidak mengubah data.
-- ============================================================

-- ── 1. Kelima tabel ada dan RLS aktif ────────────────────────────────────────
-- Harapan: 5 baris, semuanya rowsecurity = true.

SELECT tablename, rowsecurity AS rls_aktif
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'rekah_musim', 'rekah_langkah_selesai', 'rekah_refleksi',
    'rekah_jurnal', 'rekah_rencana_pekan'
  )
ORDER BY tablename;

-- ── 2. Setiap tabel punya policy ─────────────────────────────────────────────
-- Harapan: 5 baris, tiap tabel 1 policy, cmd = 'ALL', qual DAN with_check terisi.
-- Kalau with_check NULL, Postgres memakai ulang qual — tetap aman, tapi di 011
-- keduanya ditulis eksplisit jadi keduanya harus terisi.

SELECT tablename, policyname, cmd,
       qual IS NOT NULL       AS ada_using,
       with_check IS NOT NULL AS ada_with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'rekah\_%'
ORDER BY tablename;

-- ── 3. Kolom baru di anak ────────────────────────────────────────────────────
-- Harapan: 2 baris — temperamen, tantangan_utama.

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'anak'
  AND column_name IN ('temperamen', 'tantangan_utama')
ORDER BY column_name;

-- ── 4. Partial unique index "satu musim berjalan per anak" ───────────────────
-- Harapan: 1 baris, indexdef memuat "WHERE (selesai IS NULL)".
-- Ini penjaga utama migrasi 011 — tanpanya, tutupMusim() bisa menghasilkan
-- dua musim berjalan dan getMusimBerjalan() akan gagal dengan galat "multiple
-- rows returned" yang membingungkan.

SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND indexname = 'rekah_musim_satu_berjalan';

-- ── 5. Semua CHECK constraint terpasang ──────────────────────────────────────
-- Harapan minimal: respon_anak, mood_pendamping, tag, cardinality nilai_fokus,
-- cardinality id_modul (<= 7), temperamen.

SELECT rel.relname AS tabel, con.conname AS constraint_name,
       pg_get_constraintdef(con.oid) AS definisi
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace ns ON ns.oid = rel.relnamespace
WHERE ns.nspname = 'public'
  AND con.contype = 'c'
  AND (rel.relname LIKE 'rekah\_%' OR con.conname = 'anak_temperamen_valid')
ORDER BY rel.relname, con.conname;

-- ── 6. Trigger diperbarui_pada ───────────────────────────────────────────────
-- Harapan: 2 baris — rekah_musim, rekah_rencana_pekan.

SELECT event_object_table AS tabel, trigger_name, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public' AND trigger_name LIKE 'trg_rekah%'
ORDER BY event_object_table;

-- ── 7. Uji CHECK benar-benar menolak ─────────────────────────────────────────
-- Blok ini SENGAJA mencoba menulis data tidak sah dan menganggap GAGAL kalau
-- database MENERIMANYA. Semua percobaan di-rollback.
--
-- Tidak butuh input apa pun. Anak sementara dibuat di dalam blok ini sendiri,
-- lalu ikut hilang saat rollback — jadi blok ini tidak bergantung pada urutan
-- menjalankan berkas lain, dan tidak menyentuh data anak yang sungguhan.

DO $$
DECLARE
  -- Akun uji A. Hanya dipakai sebagai induk anak sementara di bawah.
  v_id_orang_tua UUID := 'e902ed9b-7ee9-4d81-9645-cad319964394';
  v_id_anak      UUID;
  v_ditolak      BOOLEAN;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM orang_tua WHERE id = v_id_orang_tua) THEN
    INSERT INTO orang_tua (id, email)
    SELECT id, email FROM auth.users WHERE id = v_id_orang_tua;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM orang_tua WHERE id = v_id_orang_tua) THEN
    RAISE EXCEPTION
      'GAGAL SIAPKAN: akun uji A (%) tidak ada di auth.users. Buat dulu ujia@rekah.id.',
      v_id_orang_tua;
  END IF;

  INSERT INTO anak (id_orang_tua, nama_anak, tanggal_lahir)
  VALUES (v_id_orang_tua, 'Anak Sementara Uji CHECK', '2023-01-15')
  RETURNING id INTO v_id_anak;

  -- 7a. nilai_fokus tidak boleh kosong
  v_ditolak := FALSE;
  BEGIN
    INSERT INTO rekah_musim (id_anak, musim_ke, nilai_fokus)
    VALUES (v_id_anak, 900, '{}');
  EXCEPTION WHEN check_violation THEN v_ditolak := TRUE;
  END;
  ASSERT v_ditolak, 'GAGAL: nilai_fokus kosong diterima';

  -- 7b. nilai_fokus maksimal 3
  v_ditolak := FALSE;
  BEGIN
    INSERT INTO rekah_musim (id_anak, musim_ke, nilai_fokus)
    VALUES (v_id_anak, 901, '{a,b,c,d}');
  EXCEPTION WHEN check_violation THEN v_ditolak := TRUE;
  END;
  ASSERT v_ditolak, 'GAGAL: nilai_fokus 4 elemen diterima';

  -- 7c. respon_anak di luar daftar
  v_ditolak := FALSE;
  BEGIN
    INSERT INTO rekah_refleksi (id_anak, id_modul, tanggal, respon_anak, musim_ke)
    VALUES (v_id_anak, 'uji', CURRENT_DATE, 'sangat-seru', 1);
  EXCEPTION WHEN check_violation THEN v_ditolak := TRUE;
  END;
  ASSERT v_ditolak, 'GAGAL: respon_anak tidak sah diterima';

  -- 7d. rencana pekan maksimal 7 langkah
  v_ditolak := FALSE;
  BEGIN
    INSERT INTO rekah_rencana_pekan (id_anak, musim_ke, minggu_ke, id_modul)
    VALUES (v_id_anak, 900, 1, '{m1,m2,m3,m4,m5,m6,m7,m8}');
  EXCEPTION WHEN check_violation THEN v_ditolak := TRUE;
  END;
  ASSERT v_ditolak, 'GAGAL: rencana 8 langkah diterima';

  -- 7e. tag jurnal di luar daftar
  v_ditolak := FALSE;
  BEGIN
    INSERT INTO rekah_jurnal (id_anak, judul, catatan, tag)
    VALUES (v_id_anak, 'uji', 'uji', 'sembarang');
  EXCEPTION WHEN check_violation THEN v_ditolak := TRUE;
  END;
  ASSERT v_ditolak, 'GAGAL: tag jurnal tidak sah diterima';

  -- 7f. dua musim berjalan untuk satu anak
  v_ditolak := FALSE;
  BEGIN
    INSERT INTO rekah_musim (id_anak, musim_ke, nilai_fokus, selesai)
      VALUES (v_id_anak, 902, '{Kejujuran}', NULL);
    INSERT INTO rekah_musim (id_anak, musim_ke, nilai_fokus, selesai)
      VALUES (v_id_anak, 903, '{Kesabaran}', NULL);
  EXCEPTION WHEN unique_violation THEN v_ditolak := TRUE;
  END;
  ASSERT v_ditolak, 'GAGAL: dua musim berjalan diterima — partial unique index tidak bekerja';

  RAISE EXCEPTION 'SEMUA UJI STRUKTUR LULUS — rollback disengaja, tidak ada data tersisa.';
END $$;

-- Blok 7 selalu berakhir dengan EXCEPTION agar seluruh isinya di-rollback,
-- termasuk 'Anak Sementara Uji CHECK' yang dibuat di awal blok.
--
-- Kalau kamu melihat "SEMUA UJI STRUKTUR LULUS", itu HASIL YANG BENAR.
-- Diawali "GAGAL:"        → ada CHECK yang tidak terpasang.
-- Diawali "GAGAL SIAPKAN:" → akun uji A belum dibuat, bukan soal skema.
--
-- Untuk memastikan tidak ada sisa (harus 0 baris):
--   SELECT COUNT(*) FROM anak WHERE nama_anak = 'Anak Sementara Uji CHECK';
