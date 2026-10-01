-- 031_pembayaran.sql
-- Pembayaran langganan Rekah lewat Midtrans atau Xendit (Supabase Edge Functions).
--   buat-pembayaran        → INSERT pembayaran (status 'menunggu') + minta tautan bayar ke penyedia
--   notifikasi-pembayaran  → penyedia memberi kabar → lunasi_pembayaran() → langganan aktif
-- Klien hanya boleh MEMBACA pembayarannya sendiri. Semua penulisan lewat service_role.
-- Idempoten. Jalankan SETELAH 004.

CREATE TABLE IF NOT EXISTS pembayaran (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_order          TEXT NOT NULL UNIQUE,
  id_orang_tua        UUID NOT NULL REFERENCES orang_tua(id) ON DELETE CASCADE,
  penyedia            TEXT NOT NULL CHECK (penyedia IN ('midtrans', 'xendit')),
  paket               TEXT NOT NULL CHECK (paket IN ('monthly', 'quarterly', 'yearly')),
  jumlah              INT  NOT NULL CHECK (jumlah > 0),
  status              TEXT NOT NULL DEFAULT 'menunggu'
                        CHECK (status IN ('menunggu', 'lunas', 'gagal', 'kedaluwarsa')),
  url_bayar           TEXT,
  referensi_penyedia  TEXT,            -- id transaksi/invoice di penyedia
  metode              TEXT,            -- mis. qris, bank_transfer, gopay (dari notifikasi)
  catatan_penyedia    JSONB,           -- isi notifikasi terakhir (tanpa data kartu)
  dibuat_pada         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diperbarui_pada     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dilunasi_pada       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS pembayaran_orang_tua_idx ON pembayaran (id_orang_tua, dibuat_pada DESC);

ALTER TABLE pembayaran ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pembayaran: baca sendiri" ON pembayaran;
CREATE POLICY "pembayaran: baca sendiri"
  ON pembayaran FOR SELECT
  USING (id_orang_tua = auth.uid());

DROP POLICY IF EXISTS "pembayaran: admin baca semua" ON pembayaran;
CREATE POLICY "pembayaran: admin baca semua"
  ON pembayaran FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Tidak ada policy INSERT/UPDATE/DELETE: hanya service_role (Edge Function) yang menulis.

-- ── Pelunasan: tandai lunas + aktifkan/perpanjang langganan (atomik & idempoten) ──
-- Dipanggil Edge Function notifikasi-pembayaran setelah tanda tangan penyedia diverifikasi.
-- Perpanjangan dihitung dari akhir periode yang masih berjalan (tidak hangus bila bayar lebih awal).
CREATE OR REPLACE FUNCTION lunasi_pembayaran(
  p_kode_order TEXT,
  p_referensi  TEXT,
  p_metode     TEXT,
  p_catatan    JSONB
) RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bayar  pembayaran%ROWTYPE;
  v_durasi INTERVAL;
  v_mulai  TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_bayar FROM pembayaran WHERE kode_order = p_kode_order FOR UPDATE;
  IF NOT FOUND THEN
    RETURN 'tidak_ditemukan';
  END IF;
  IF v_bayar.status = 'lunas' THEN
    RETURN 'sudah_lunas';            -- notifikasi ganda: abaikan
  END IF;

  v_durasi := CASE v_bayar.paket
    WHEN 'monthly'   THEN INTERVAL '1 month'
    WHEN 'quarterly' THEN INTERVAL '3 months'
    WHEN 'yearly'    THEN INTERVAL '1 year'
  END;

  UPDATE pembayaran SET
    status             = 'lunas',
    referensi_penyedia = COALESCE(p_referensi, referensi_penyedia),
    metode             = COALESCE(p_metode, metode),
    catatan_penyedia   = p_catatan,
    dilunasi_pada      = NOW(),
    diperbarui_pada    = NOW()
  WHERE id = v_bayar.id;

  SELECT GREATEST(COALESCE(akhir_periode, NOW()), NOW()) INTO v_mulai
    FROM langganan WHERE id_orang_tua = v_bayar.id_orang_tua;
  v_mulai := COALESCE(v_mulai, NOW());

  INSERT INTO langganan (id_orang_tua, status, akhir_periode, diperbarui_pada)
  VALUES (v_bayar.id_orang_tua, 'aktif', v_mulai + v_durasi, NOW())
  ON CONFLICT (id_orang_tua) DO UPDATE SET
    status          = 'aktif',
    akhir_periode   = v_mulai + v_durasi,
    diperbarui_pada = NOW();

  RETURN 'lunas';
END;
$$;

REVOKE ALL ON FUNCTION lunasi_pembayaran(TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION lunasi_pembayaran(TEXT, TEXT, TEXT, JSONB) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION lunasi_pembayaran(TEXT, TEXT, TEXT, JSONB) TO service_role;
