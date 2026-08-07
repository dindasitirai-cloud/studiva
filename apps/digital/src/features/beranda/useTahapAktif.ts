/**
 * Memetakan usia dalam bulan ke sub-tahap Tahun Pertama.
 * Semua fungsi murni: tidak memanggil Date.now(). Mengikuti pola usia.ts.
 *
 * Konvensi batas [min, max) — konsisten dengan registry.ts dan bekalRegistry.ts.
 * Perhatian: label yang dilihat pengguna ("0 sampai 3 bulan") TIDAK sama dengan
 * rentang teknis. Anak tepat 3 bulan penuh sudah masuk tahap kedua karena
 * tahap pertama mencakup [0,3) bukan [0,3].
 */

import { useAnakAktif } from '../../context/AnakContext';

const TAHAP_RANGES: Array<{ id: string; min: number; max: number }> = [
  { id: 'bulan-0-3',   min: 0, max: 3  },
  { id: 'bulan-4-6',   min: 3, max: 6  },
  { id: 'bulan-7-9',   min: 6, max: 9  },
  { id: 'bulan-10-12', min: 9, max: 12 },
];

/**
 * Mengembalikan id sub-tahap Tahun Pertama untuk usia tertentu.
 * Mengembalikan null jika di luar rentang (< 0, >= 12, atau null).
 */
export function resolveTahapId(usiaBulan: number | null): string | null {
  if (usiaBulan === null || usiaBulan < 0) return null;
  const tahap = TAHAP_RANGES.find(t => usiaBulan >= t.min && usiaBulan < t.max);
  return tahap?.id ?? null;
}

/** Hook: membaca usiaBulan dari AnakContext lalu memanggil resolveTahapId. */
export function useTahapAktif(): string | null {
  const { usiaBulan } = useAnakAktif();
  return resolveTahapId(usiaBulan);
}
