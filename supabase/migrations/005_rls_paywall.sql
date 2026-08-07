-- ============================================================
-- Rekah — Paywall RLS (Penegakan Sisi Server)
-- Migrasi: 005_rls_paywall
--
-- ⚠️  JALANKAN SETELAH:
--     1. Migration 004_langganan.sql sudah dijalankan
--     2. Stripe webhook sudah aktif dan bisa mengisi tabel `langganan`
--     3. Ada setidaknya satu baris `langganan` dengan status='aktif' untuk testing
--
-- Bila dijalankan sebelum ada data langganan, seluruh SELECT dari tabel
-- berbayar (pilihan_harian, nilai_ditanam, kebun_riwayat, jejak) akan
-- mengembalikan 0 baris — dashboard tidak bisa menampilkan data.
--
-- Penegakan: policy hanya mengizinkan SELECT bila langganan aktif.
-- Data tidak dihapus saat langganan kedaluwarsa — hanya diblokir bacanya.
-- Memperpanjang langganan langsung mengembalikan akses.
-- ============================================================

-- ── pilihan_harian (data harian Irama Hari — inti) ───────────────────────────
DROP POLICY IF EXISTS "pilihan_harian: lewat anak pemilik" ON pilihan_harian;

CREATE POLICY "pilihan_harian: lewat anak pemilik dan langganan aktif"
  ON pilihan_harian FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM anak
      WHERE anak.id = pilihan_harian.id_anak
        AND anak.id_orang_tua = auth.uid()
    )
    AND has_langganan_aktif(auth.uid())
  );

-- ── nilai_ditanam (Taman Akar Keluarga) ──────────────────────────────────────
DROP POLICY IF EXISTS "nilai_ditanam: lewat anak pemilik" ON nilai_ditanam;

CREATE POLICY "nilai_ditanam: lewat anak pemilik dan langganan aktif"
  ON nilai_ditanam FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM anak
      WHERE anak.id = nilai_ditanam.id_anak
        AND anak.id_orang_tua = auth.uid()
    )
    AND has_langganan_aktif(auth.uid())
  );

-- ── kebun_riwayat (Kebun Tumbuh) ─────────────────────────────────────────────
DROP POLICY IF EXISTS "kebun_riwayat: lewat anak pemilik" ON kebun_riwayat;

CREATE POLICY "kebun_riwayat: lewat anak pemilik dan langganan aktif"
  ON kebun_riwayat FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM anak
      WHERE anak.id = kebun_riwayat.id_anak
        AND anak.id_orang_tua = auth.uid()
    )
    AND has_langganan_aktif(auth.uid())
  );

-- ── jejak ─────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "jejak: lewat anak pemilik" ON jejak;

CREATE POLICY "jejak: lewat anak pemilik dan langganan aktif"
  ON jejak FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM anak
      WHERE anak.id = jejak.id_anak
        AND anak.id_orang_tua = auth.uid()
    )
    AND has_langganan_aktif(auth.uid())
  );

-- ── anak (profil anak — TODO: pertimbangkan apakah perlu paywall) ─────────────
-- TODO: penegakan langganan sisi server — tabel `anak`
-- Saat ini: anak bisa dibaca/ditulis pengguna mana pun yang authenticated (pemiliknya).
-- Pertanyaan terbuka: haruskah pengguna kedaluwarsa masih bisa melihat profil anak?
-- Rekomendasi: izinkan baca (untuk UX "selamat datang kembali") tapi blokir tulis baru.
-- Keputusan ini perlu diambil tim sebelum menerapkan paywall pada tabel anak.

-- ── orang_tua (profil induk — tidak di-paywall) ───────────────────────────────
-- Policy orang_tua tidak diubah — selalu bisa diakses untuk kebutuhan akun.

-- ── consent (jejak legal — tidak di-paywall) ──────────────────────────────────
-- Policy consent tidak diubah — diperlukan untuk keperluan audit/legal.
