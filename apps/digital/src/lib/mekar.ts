// =============================================================
// LOGIKA MEKAR — PITA KEBIASAAN
// Fungsi murni: tidak ada Date.now(), tidak ada side effect.
// Disimpan di lib/ agar testable tanpa React.
// =============================================================

/** Status satu hari dalam riwayat kebiasaan. */
export type StatusHari = 'ada-kegiatan' | 'tanpa-kegiatan' | 'belum-lewat';

/** Tingkat mekar maksimum. */
export const TAHAP_MAKS = 7;

const LANGKAH_NAIK = 1;
const LANGKAH_TURUN = 0.5;

/**
 * Menghitung tingkat mekar akhir berdasarkan riwayat lengkap.
 *
 * - 'ada-kegiatan'   → naik 1 (dikap di TAHAP_MAKS)
 * - 'tanpa-kegiatan' → turun 0.5 (dikap di 0)
 * - 'belum-lewat'    → dilewati, tidak mengubah level
 *
 * @param riwayat  Riwayat status per hari, indeks 0 = hari paling awal.
 * @returns        Tingkat mekar akhir dalam rentang [0, TAHAP_MAKS].
 */
export function hitungMekar(riwayat: readonly StatusHari[]): number {
  let level = 0;
  for (const status of riwayat) {
    if (status === 'ada-kegiatan') {
      level = Math.min(TAHAP_MAKS, level + LANGKAH_NAIK);
    } else if (status === 'tanpa-kegiatan') {
      level = Math.max(0, level - LANGKAH_TURUN);
    }
    // 'belum-lewat' → skip
  }
  return level;
}
