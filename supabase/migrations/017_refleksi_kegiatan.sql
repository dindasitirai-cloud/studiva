-- ═══════════════════════════════════════════════════════════════════════════
-- 017 — refleksi_kegiatan (REFLECT dalam Family Journey Map)
-- Refleksi lembut satu-ketuk setelah kegiatan dilakukan. Tanpa skor.
-- hasil ∈ {menyenangkan, terlalu_sulit, kurang_cocok, ingin_ulang}.
-- Satu baris per anak per tanggal per kegiatan. Additive.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS refleksi_kegiatan (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anak       UUID NOT NULL REFERENCES anak(id) ON DELETE CASCADE,
  tanggal       DATE NOT NULL,
  id_kegiatan   TEXT NOT NULL,
  hasil         TEXT NOT NULL,
  dibuat_pada   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_anak, tanggal, id_kegiatan)
);

CREATE INDEX IF NOT EXISTS idx_refleksi_kegiatan_anak_tgl ON refleksi_kegiatan (id_anak, tanggal);

ALTER TABLE refleksi_kegiatan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "refleksi_kegiatan: lewat anak pemilik"
  ON refleksi_kegiatan FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM anak
      WHERE anak.id = refleksi_kegiatan.id_anak
        AND anak.id_orang_tua = auth.uid()
    )
  );
