/**
 * Logika tingkat mekar untuk BungaKebiasaan.
 *
 * Murni — tidak ada Date.now(), tidak ada side effect.
 * Simpan di packages/shared agar testable tanpa React.
 */

/** Setiap hari yang disiram menaikkan tingkat sebesar 1. */
export const LANGKAH_NAIK = 1;

/** Setiap hari yang tidak disiram menurunkan tingkat sebesar 0.5. */
export const LANGKAH_TURUN = 0.5;

/** Tingkat maksimum — satu per hari dalam seminggu. */
export const TINGKAT_MAKS = 7;

/**
 * Menghitung tingkat mekar kumulatif untuk tiap hari.
 *
 * @param riwayat  Array boolean: true = disiram, false = tidak.
 *                 Indeks 0 = Senin, dst.
 * @returns        Tingkat mekar (0–TINGKAT_MAKS) setelah tiap hari.
 *                 Panjang sama dengan panjang riwayat.
 */
export function tingkatMekar(riwayat: readonly boolean[]): readonly number[] {
  let level = 0;
  return riwayat.map(disiram => {
    if (disiram) {
      level = Math.min(TINGKAT_MAKS, level + LANGKAH_NAIK);
    } else {
      level = Math.max(0, level - LANGKAH_TURUN);
    }
    return level;
  });
}
