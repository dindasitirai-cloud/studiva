-- ═══════════════════════════════════════════════════════════════════════════
-- 018 — jejak_pengamatan_kompas (KONTINUITAS lintas waktu)
-- Log append-only tiap kali caregiver menandai / melepas pengamatan tahap
-- perkembangan. Dipakai membangun lini masa perkembangan anak.
-- aksi ∈ {tandai, lepas}. Tidak pernah dihapus (histori). Additive.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS jejak_pengamatan_kompas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak     UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  id_prompt   TEXT NOT NULL,
  aksi        TEXT NOT NULL,
  pada        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jejak_pengamatan_anak_pada ON jejak_pengamatan_kompas (id_anak, pada);

ALTER TABLE jejak_pengamatan_kompas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jejak_pengamatan_kompas: lewat anak pemilik"
  ON jejak_pengamatan_kompas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM anak
      WHERE anak.id = jejak_pengamatan_kompas.id_anak
        AND anak.id_orang_tua = auth.uid()
    )
  );
