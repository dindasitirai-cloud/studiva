-- ============================================================
-- Rekah — Tabel Langganan
-- Migrasi: 004_langganan
--
-- Rancangan agar Stripe tinggal mengisinya via webhook:
--   Stripe → backend webhook → UPDATE langganan SET status, akhir_periode
--
-- Tidak ada data kartu/pembayaran di tabel ini.
-- Stripe menyimpan data kartu; kita hanya menyimpan status + id referensi.
--
-- RLS:
--   SELECT → orang tua bisa baca statusnya sendiri
--   INSERT/UPDATE/DELETE → hanya service_role (backend webhook)
--   Klien tidak bisa memalsukan status 'aktif'.
-- ============================================================

CREATE TABLE IF NOT EXISTS langganan (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_orang_tua            UUID NOT NULL UNIQUE REFERENCES orang_tua(id) ON DELETE CASCADE,
  status                  TEXT NOT NULL DEFAULT 'belum_pernah'
                            CHECK (status IN ('aktif', 'dibatalkan', 'tertunggak', 'belum_pernah')),
  akhir_periode           TIMESTAMPTZ,                -- NULL bila belum pernah berlangganan
  stripe_customer_id      TEXT,                       -- hanya id, bukan data kartu
  stripe_subscription_id  TEXT,                       -- id langganan Stripe
  diperbarui_pada         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE langganan ENABLE ROW LEVEL SECURITY;

-- Orang tua bisa membaca status langganannya sendiri (untuk UX gerbang)
CREATE POLICY "langganan: baca sendiri"
  ON langganan FOR SELECT
  USING (id_orang_tua = auth.uid());

-- Tidak ada policy INSERT/UPDATE/DELETE untuk role authenticated/anon.
-- Hanya service_role (backend webhook Stripe) yang dapat menulis.
-- Penegakan: status tidak dapat dipalsukan oleh klien.

-- ── Helper function ───────────────────────────────────────────────────────────
-- Digunakan di RLS migration 005_rls_paywall untuk cek hak akses data berbayar.
-- SECURITY DEFINER agar bisa query tabel langganan tanpa kebocoran RLS silang.
CREATE OR REPLACE FUNCTION has_langganan_aktif(p_uid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM langganan
    WHERE id_orang_tua = p_uid
      AND status = 'aktif'
      AND akhir_periode > NOW()
  );
$$;
