-- ============================================================
-- Rekah — Admin Helpers
-- Migrasi: 003_admin_helpers
--
-- Fungsi ini HANYA dapat dipanggil lewat service_role key
-- (dari backend yang aman, bukan dari browser).
-- Supabase service_role bypass RLS — simpan key ini di server saja.
-- ============================================================

-- ── Fungsi: koreksi tanggal lahir ────────────────────────────────────────────
-- Dipanggil admin setelah memverifikasi permohonan.
-- Memperbarui tanggal_lahir di tabel anak DAN menandai
-- permohonan sebagai 'disetujui'.

CREATE OR REPLACE FUNCTION admin_koreksi_tanggal_lahir(
  p_id_anak       UUID,
  p_tanggal_lahir DATE
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER  -- berjalan sebagai pemilik fungsi (postgres), bypass RLS
AS $$
BEGIN
  UPDATE anak
     SET tanggal_lahir = p_tanggal_lahir
   WHERE id = p_id_anak;

  UPDATE permohonan_koreksi_tgl_lahir
     SET status = 'disetujui',
         ditangani_pada = NOW()
   WHERE id_anak = p_id_anak
     AND status  = 'menunggu';
END;
$$;

-- Cabut akses publik — hanya bisa dipanggil oleh service_role via RPC
REVOKE ALL ON FUNCTION admin_koreksi_tanggal_lahir(UUID, DATE) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION admin_koreksi_tanggal_lahir(UUID, DATE) TO service_role;

-- ── Fungsi: tolak permohonan koreksi ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION admin_tolak_koreksi_tanggal_lahir(
  p_id_anak UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE permohonan_koreksi_tgl_lahir
     SET status = 'ditolak',
         ditangani_pada = NOW()
   WHERE id_anak = p_id_anak
     AND status  = 'menunggu';
END;
$$;

REVOKE ALL ON FUNCTION admin_tolak_koreksi_tanggal_lahir(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION admin_tolak_koreksi_tanggal_lahir(UUID) TO service_role;

-- ── Fungsi: hapus seluruh data anak (cascade) ────────────────────────────────
-- Untuk hak hapus subjek data (PDP).
-- Cascade sudah diatur via FK ON DELETE CASCADE —
-- menghapus baris dari tabel anak akan otomatis hapus semua data turunan.
-- Fungsi ini sebagai titik tunggal yang teraudit.

CREATE OR REPLACE FUNCTION admin_hapus_anak(p_id_anak UUID) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM anak WHERE id = p_id_anak;
END;
$$;

REVOKE ALL ON FUNCTION admin_hapus_anak(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION admin_hapus_anak(UUID) TO service_role;

-- ── Fungsi: hapus akun orang tua beserta semua data ─────────────────────────
-- Menghapus baris orang_tua → cascade hapus semua anak + semua data turunan.
-- Kemudian memanggil auth.admin_delete_user via pg hook (perlu service_role).

CREATE OR REPLACE FUNCTION admin_hapus_orang_tua(p_id_orang_tua UUID) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM orang_tua WHERE id = p_id_orang_tua;
  -- Catatan: penghapusan dari auth.users dilakukan lewat Supabase Admin API
  -- di backend (service_role) setelah fungsi ini dipanggil.
  -- Lihat backend/src/routes/rekahAdmin.ts
END;
$$;

REVOKE ALL ON FUNCTION admin_hapus_orang_tua(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION admin_hapus_orang_tua(UUID) TO service_role;
