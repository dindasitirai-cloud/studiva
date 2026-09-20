-- ═══════════════════════════════════════════════════════════════════════════
-- 019 — catatan_pengamatan_kompas (observasi teks bebas caregiver)
-- Caregiver menulis pengamatan lalu menyimpannya → masuk Jejak Perkembangan,
-- dan keyword-nya dipakai memunculkan kegiatan cocok di Fokus minggu ini.
-- Append-only. Additive.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS catatan_pengamatan_kompas (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak   UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  teks      TEXT NOT NULL,
  pada      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catatan_pengamatan_anak_pada ON catatan_pengamatan_kompas (id_anak, pada);

ALTER TABLE catatan_pengamatan_kompas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catatan_pengamatan_kompas: lewat anak pemilik"
  ON catatan_pengamatan_kompas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM anak
      WHERE anak.id = catatan_pengamatan_kompas.id_anak
        AND anak.id_orang_tua = auth.uid()
    )
  );
