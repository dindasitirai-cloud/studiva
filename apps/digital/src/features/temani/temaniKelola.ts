// =============================================================
// temaniKelola — jembatan Temani ↔ Kelola (Phase 21E · sinkron dua arah).
// Sumber tunggal status selesai langkah Temani = pilihan_harian.diff.selesai
// (id "temani-<slug>-h<N>" pada tanggal mulai+N-1) — dibaca TemaniPage,
// PerjalananProgresCard (Beranda), Jurnal, dan kini papan Kelola.
// Papan Kelola menulis ke sumber yang sama, jadi centang di mana pun = sama.
// =============================================================
import { useCallback, useEffect, useState } from 'react';
import { tambahKustomKeTanggal, setSelesaiKustom, getPilihanHarian } from '../../lib/supabase/rekah';
import type { TemaniJourney, TemaniHari } from './temaniSeed';

export const idKegiatanTemani = (slug: string, n: number) => `temani-${slug}-h${n}`;

/** Item kustom Kelola untuk satu langkah Temani (bentuk sama seperti sebelumnya di TemaniPage). */
export const itemKelolaTemani = (j: TemaniJourney, h: TemaniHari) => ({
  id: idKegiatanTemani(j.slug, h.hari),
  judul: h.fokus.length > 64 ? `${h.fokus.slice(0, 62)}…` : h.fokus,
  tipe: 'aktivitas' as const, domain: 'sos', nilai: j.nilaiTerkait, pemilik: 'anak' as const,
  sumberId: idKegiatanTemani(j.slug, h.hari), kustom: true, kategoriKustom: 'momen' as const,
  keteranganKapan: 'Dari Temani', deskripsiKustom: h.script,
});

/** Tandai/lepas selesai satu langkah Temani pada tanggalnya (ditulis ke sumber tunggal). */
export async function tandaiLangkahTemani(idAnak: string, tanggal: string, j: TemaniJourney, h: TemaniHari, selesai: boolean): Promise<void> {
  if (selesai) await tambahKustomKeTanggal(idAnak, tanggal, itemKelolaTemani(j, h));
  await setSelesaiKustom(idAnak, tanggal, idKegiatanTemani(j.slug, h.hari), selesai);
}

/** Id langkah Temani yang selesai pada satu tanggal (dibaca dari sumber tunggal). */
export function useTemaniSelesaiHari(idAnak: string, tanggal: string, aktif: boolean) {
  const [ids, setIds] = useState<Set<string>>(() => new Set());
  const muat = useCallback(async () => {
    if (!aktif) { setIds(new Set()); return; }
    try {
      const baris = await getPilihanHarian(idAnak, tanggal);
      const sel = (baris?.diff as { selesai?: unknown } | null)?.selesai;
      setIds(new Set(Array.isArray(sel) ? sel.filter((x): x is string => typeof x === 'string' && x.startsWith('temani-')) : []));
    } catch { /* belum masuk / offline → biarkan kosong */ }
  }, [idAnak, tanggal, aktif]);
  useEffect(() => { void muat(); }, [muat]);
  return { ids, setIds, muat };
}
