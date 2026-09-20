-- ═══════════════════════════════════════════════════════════════════════════
-- 016 — pengamatan_kompas (Development Compass / Kompas Perkembangan)
-- Menyimpan prompt observasi tahap perkembangan yang ditandai caregiver.
-- id_prompt = ObservationPrompt.id (mis. "obs-adaptive-selffeed").
-- Satu baris per anak per prompt. Additive; tidak menyentuh tabel lain.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pengamatan_kompas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak       UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  id_prompt     TEXT NOT NULL,
  diamati_pada  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_anak, id_prompt)
);

CREATE INDEX IF NOT EXISTS idx_pengamatan_kompas_anak ON pengamatan_kompas (id_anak);

-- RLS: hanya lewat anak milik orang tua yang login (pola sama seperti nilai_ditanam).
ALTER TABLE pengamatan_kompas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pengamatan_kompas: lewat anak pemilik"
  ON pengamatan_kompas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM anak
      WHERE anak.id = pengamatan_kompas.id_anak
        AND anak.id_orang_tua = auth.uid()
    )
  );
