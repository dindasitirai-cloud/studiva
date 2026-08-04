/**
 * Logika tingkat mekar untuk BungaKebiasaan.
 *
 * Murni — tidak ada Date.now(), tidak ada side effect.
 * Simpan di packages/shared agar testable tanpa React.
 */
/** Setiap hari yang disiram menaikkan tingkat sebesar 1. */
export declare const LANGKAH_NAIK = 1;
/** Setiap hari yang tidak disiram menurunkan tingkat sebesar 0.5. */
export declare const LANGKAH_TURUN = 0.5;
/** Tingkat maksimum — satu per hari dalam seminggu. */
export declare const TINGKAT_MAKS = 7;
/**
 * Menghitung tingkat mekar kumulatif untuk tiap hari.
 *
 * @param riwayat  Array boolean: true = disiram, false = tidak.
 *                 Indeks 0 = Senin, dst.
 * @returns        Tingkat mekar (0–TINGKAT_MAKS) setelah tiap hari.
 *                 Panjang sama dengan panjang riwayat.
 */
export declare function tingkatMekar(riwayat: readonly boolean[]): readonly number[];
//# sourceMappingURL=mekar.d.ts.map