-- ═══════════════════════════════════════════════════════════════════════════
-- 032 — Jurnal: "Yang terlihat hari ini"  [idempoten / aman dijalankan ulang]
-- Phase 22: checklist Kompas Perkembangan pindah ke Jurnal (tab di Kelola) dan
-- maknanya menjadi "terlihat hari ini" (bertanggal). Kolom menyimpan daftar id
-- prompt pengamatan (ObservationPrompt.id) yang terlihat pada tanggal tsb.
-- Penyetir saran Rekah = id yang terlihat dalam 21 hari terakhir.
-- RLS memakai policy jurnal_hari yang sudah ada (lewat anak pemilik).
-- Jalankan di SQL Editor. Sebelum dijalankan, aplikasi memakai cadangan lokal.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE jurnal_hari
  ADD COLUMN IF NOT EXISTS terlihat JSONB NOT NULL DEFAULT '[]'::jsonb;
