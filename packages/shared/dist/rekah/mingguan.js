"use strict";
// Logika mingguan untuk Irama Hari — murni, tanpa React, tanpa DOM, tanpa browser API.
// Platform-agnostic: dapat dipakai di web dan mobile.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMingguIrama = exports.getSeninMinggu = exports.tanggalDariTimestampWIB = exports.tambahHari = exports.BLOK_URUTAN = void 0;
exports.BLOK_URUTAN = ['pagi', 'siang', 'sore', 'jelangTidur'];
// ─── Utilitas kalender (tidak diekspor kecuali yang berguna untuk adapter) ──
function klamp123(n) {
    if (n <= 1)
        return 1;
    if (n >= 3)
        return 3;
    return 2;
}
/**
 * Tambahkan n hari ke tanggal ISO 'YYYY-MM-DD'.
 * Murni aritmetika kalender menggunakan UTC — zona waktu tidak relevan untuk
 * operasi tanggal-ke-tanggal selama input adalah string tanggal kalender.
 */
function tambahHari(isoDate, n) {
    const d = new Date(isoDate + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}
exports.tambahHari = tambahHari;
/**
 * Konversi timestamp UTC ke tanggal kalender WIB (Asia/Jakarta = UTC+7).
 * Dipakai di adapter agar kegiatan pukul 21.00 WIB tidak lompat ke hari berikutnya.
 */
function tanggalDariTimestampWIB(timestampISO) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(timestampISO));
}
exports.tanggalDariTimestampWIB = tanggalDariTimestampWIB;
/**
 * Kembalikan tanggal Senin (ISO 'YYYY-MM-DD') untuk minggu yang mengandung
 * tanggalISO, menggunakan konvensi kalender Indonesia (minggu mulai Senin).
 *
 * Input diperlakukan sebagai tanggal kalender WIB — tanggal ISO yang dikirim
 * HARUS sudah dalam WIB (seperti yang disimpan oleh PilihanHarian.tanggal).
 */
function getSeninMinggu(tanggalISO) {
    // Representasikan sebagai noon WIB agar Intl mengembalikan tanggal yang sama.
    const wibDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(tanggalISO + 'T12:00:00+07:00'));
    // Hitung hari minggu menggunakan UTC midnight (aritmetika murni).
    const d = new Date(wibDate + 'T00:00:00Z');
    const dow = d.getUTCDay(); // 0=Minggu, 1=Senin, ..., 6=Sabtu
    const hariSejak = dow === 0 ? 6 : dow - 1; // Senin=0 ... Minggu=6
    return tambahHari(wibDate, -hariSejak);
}
exports.getSeninMinggu = getSeninMinggu;
function hariKosong(tanggal) {
    return {
        tanggal,
        slot: { pagi: [], siang: [], sore: [], jelangTidur: [] },
    };
}
/**
 * Bangun MingguIrama dari data per-hari yang sudah dikonversi ke HariIrama.
 *
 * @param dataPerHari  Map tanggal ISO (WIB) → HariIrama; boleh sparse.
 * @param mulaiSenin   Tanggal Senin ISO; gunakan getSeninMinggu untuk menghitungnya.
 *
 * Pure function — tidak memanggil Date.now() atau new Date() tanpa argumen.
 */
function getMingguIrama(dataPerHari, mulaiSenin) {
    // Bangun 7 hari dari Senin sampai Minggu.
    const hari = [];
    for (let i = 0; i < 7; i++) {
        const tgl = tambahHari(mulaiSenin, i);
        const raw = dataPerHari[tgl] ?? hariKosong(tgl);
        // Salin dan urutkan item tiap slot berdasarkan urutan.
        const slot = { ...raw.slot };
        for (const blok of exports.BLOK_URUTAN) {
            slot[blok] = [...raw.slot[blok]].sort((a, b) => a.urutan - b.urutan);
        }
        hari.push({ tanggal: raw.tanggal, slot });
    }
    // rowSpan = clamp(max jumlah item di blok itu dari 7 hari, 1, 3).
    const rowSpan = {
        pagi: 1,
        siang: 1,
        sore: 1,
        jelangTidur: 1,
    };
    for (const blok of exports.BLOK_URUTAN) {
        const maks = Math.max(0, ...hari.map(h => h.slot[blok].length));
        rowSpan[blok] = klamp123(maks);
    }
    return {
        mulai: mulaiSenin,
        selesai: tambahHari(mulaiSenin, 6),
        hari,
        rowSpan,
    };
}
exports.getMingguIrama = getMingguIrama;
//# sourceMappingURL=mingguan.js.map