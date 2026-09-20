// Papan catatan (Phase 14, Kelola Overall) — util bersama.
// Memisahkan item "tidak terikat waktu" (papan kanan) dari item daypart (kolom kiri),
// dan mengklasifikasi sumbernya untuk warna/label sticky note. Leaf module (tanpa import
// komponen) agar tidak ada circular import antara SusunanHari, PapanCatatan, dan Kelola.
import type { ItemBekal } from '../beranda-usia/bekal';

export type SumberPapan = 'temani' | 'bantu' | 'rencana' | 'catatan';

/** Item kustom yang tampil di Papan (bukan di blok daypart). */
export function esItemPapan(it: ItemBekal): boolean {
  if (!it.kustom) return false;
  const k = it.keteranganKapan ?? '';
  return it.kategoriKustom === 'rencana' || k === 'Dari Temani' || k === 'Dari Bantu' || k === 'Catatan';
}

export function sumberPapan(it: ItemBekal): SumberPapan {
  const k = it.keteranganKapan ?? '';
  if (k === 'Dari Temani') return 'temani';
  if (k === 'Dari Bantu') return 'bantu';
  if (k === 'Catatan') return 'catatan';
  return 'rencana';
}

// Jadwal imunisasi Buku KIA 2024 (Kemenkes). Sumber tunggal — dipakai TabRencana & Papan.
export const JADWAL_KIA_2024: Record<number, string[]> = {
  0: ['Hepatitis B (HB0)'], 1: ['BCG', 'OPV 1'], 2: ['DPT-HB-Hib 1', 'OPV 2', 'PCV 1', 'RV 1'],
  3: ['DPT-HB-Hib 2', 'OPV 3', 'PCV 2', 'RV 2'], 4: ['DPT-HB-Hib 3', 'OPV 4', 'IPV 1', 'RV 3'],
  9: ['Campak-Rubella (MR) 1', 'IPV 2'], 10: ['Japanese Encephalitis (JE)'], 12: ['PCV 3'],
  18: ['DPT-HB-Hib 4', 'Campak-Rubella (MR) 2'], 24: ['DPT-HB-Hib lanjutan', 'Campak-Rubella (MR) lanjutan'],
};
