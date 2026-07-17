"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hitungUsiaBulan = void 0;
function hitungUsiaBulan(tanggalLahir) {
    const lahir = new Date(tanggalLahir);
    const sekarang = new Date();
    return Math.max(0, (sekarang.getFullYear() - lahir.getFullYear()) * 12 +
        (sekarang.getMonth() - lahir.getMonth()));
}
exports.hitungUsiaBulan = hitungUsiaBulan;
//# sourceMappingURL=profiles.js.map