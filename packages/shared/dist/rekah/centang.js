"use strict";
/**
 * CentangKebiasaan — satu-satunya sumber kebenaran untuk kebiasaan yang dilakukan.
 * Murni: tidak ada Date.now(), tidak ada side effect, tidak ada localStorage.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleCentang = exports.derivedRiwayatSiram = exports.riwayatSiramNilai = exports.disiramPada = exports.CENTANG_UMUM = void 0;
/**
 * Sentinel yang ditulis oleh grace-window toggle di Pita Kebiasaan.
 * disiramPada memperlakukannya sama seperti butirId biasa.
 */
exports.CENTANG_UMUM = '__umum__';
/** Apakah nilaiId sudah disiram pada tanggal ini? */
function disiramPada(centang, nilaiId, tanggal) {
    return (centang[tanggal]?.[nilaiId]?.length ?? 0) > 0;
}
exports.disiramPada = disiramPada;
/**
 * Daftar tanggal (diurutkan) di mana nilaiId sudah disiram.
 * Dipakai untuk menyambungkan ke tingkatMekar.
 */
function riwayatSiramNilai(centang, nilaiId) {
    return Object.keys(centang)
        .filter(tgl => disiramPada(centang, nilaiId, tgl))
        .sort();
}
exports.riwayatSiramNilai = riwayatSiramNilai;
/**
 * Menurunkan format Record<tanggal, nilaiId[]> yang dipakai BungaKebiasaan
 * dari CentangKebiasaan — tidak ada data ganda yang disimpan.
 */
function derivedRiwayatSiram(centang) {
    const result = {};
    for (const [tgl, nilaiMap] of Object.entries(centang)) {
        const disiram = Object.entries(nilaiMap)
            .filter(([, butirIds]) => butirIds.length > 0)
            .map(([nilaiId]) => nilaiId);
        if (disiram.length > 0)
            result[tgl] = disiram;
    }
    return result;
}
exports.derivedRiwayatSiram = derivedRiwayatSiram;
/**
 * Toggle satu butirId untuk nilaiId pada tanggal. Immutable — mengembalikan
 * objek baru tanpa mengubah yang lama.
 */
function toggleCentang(centang, nilaiId, butirId, tanggal) {
    const hari = centang[tanggal] ?? {};
    const butirList = hari[nilaiId] ?? [];
    const sudahAda = butirList.includes(butirId);
    const butirBaru = sudahAda
        ? butirList.filter(id => id !== butirId)
        : [...butirList, butirId];
    return {
        ...centang,
        [tanggal]: { ...hari, [nilaiId]: butirBaru },
    };
}
exports.toggleCentang = toggleCentang;
//# sourceMappingURL=centang.js.map