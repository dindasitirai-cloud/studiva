"use strict";
/**
 * Logika tingkat mekar untuk BungaKebiasaan.
 *
 * Murni — tidak ada Date.now(), tidak ada side effect.
 * Simpan di packages/shared agar testable tanpa React.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tingkatMekar = exports.TINGKAT_MAKS = exports.LANGKAH_TURUN = exports.LANGKAH_NAIK = void 0;
/** Setiap hari yang disiram menaikkan tingkat sebesar 1. */
exports.LANGKAH_NAIK = 1;
/** Setiap hari yang tidak disiram menurunkan tingkat sebesar 0.5. */
exports.LANGKAH_TURUN = 0.5;
/** Tingkat maksimum — satu per hari dalam seminggu. */
exports.TINGKAT_MAKS = 7;
/**
 * Menghitung tingkat mekar kumulatif untuk tiap hari.
 *
 * @param riwayat  Array boolean: true = disiram, false = tidak.
 *                 Indeks 0 = Senin, dst.
 * @returns        Tingkat mekar (0–TINGKAT_MAKS) setelah tiap hari.
 *                 Panjang sama dengan panjang riwayat.
 */
function tingkatMekar(riwayat) {
    let level = 0;
    return riwayat.map(disiram => {
        if (disiram) {
            level = Math.min(exports.TINGKAT_MAKS, level + exports.LANGKAH_NAIK);
        }
        else {
            level = Math.max(0, level - exports.LANGKAH_TURUN);
        }
        return level;
    });
}
exports.tingkatMekar = tingkatMekar;
//# sourceMappingURL=mekar.js.map