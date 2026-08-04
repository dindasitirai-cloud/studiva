"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const mingguan_1 = require("./mingguan");
// ─── getMingguIrama ────────────────────────────────────────────────────────────
(0, vitest_1.describe)('getMingguIrama', () => {
    (0, vitest_1.it)('minggu kosong total: 7 hari, semua slot kosong, semua rowSpan = 1', () => {
        const hasil = (0, mingguan_1.getMingguIrama)({}, '2026-07-27');
        (0, vitest_1.expect)(hasil.hari).toHaveLength(7);
        (0, vitest_1.expect)(hasil.mulai).toBe('2026-07-27');
        (0, vitest_1.expect)(hasil.selesai).toBe('2026-08-02');
        for (const hari of hasil.hari) {
            (0, vitest_1.expect)(hari.slot.pagi).toHaveLength(0);
            (0, vitest_1.expect)(hari.slot.siang).toHaveLength(0);
            (0, vitest_1.expect)(hari.slot.sore).toHaveLength(0);
            (0, vitest_1.expect)(hari.slot.jelangTidur).toHaveLength(0);
        }
        (0, vitest_1.expect)(hasil.rowSpan.pagi).toBe(1);
        (0, vitest_1.expect)(hasil.rowSpan.siang).toBe(1);
        (0, vitest_1.expect)(hasil.rowSpan.sore).toBe(1);
        (0, vitest_1.expect)(hasil.rowSpan.jelangTidur).toBe(1);
    });
    (0, vitest_1.it)('satu slot berisi 5 item: rowSpan slot itu = 3, slot lain tetap 1', () => {
        const hariData = {
            tanggal: '2026-07-27',
            slot: {
                pagi: [
                    { id: '1', jenis: 'ajakMain', judul: 'A', urutan: 1, selesai: false, domainKey: 'mk' },
                    { id: '2', jenis: 'ajakMain', judul: 'B', urutan: 2, selesai: false, domainKey: 'mh' },
                    { id: '3', jenis: 'ajakMain', judul: 'C', urutan: 3, selesai: false, domainKey: 'bhs' },
                    { id: '4', jenis: 'ajakMain', judul: 'D', urutan: 4, selesai: false, domainKey: 'kog' },
                    { id: '5', jenis: 'ajakMain', judul: 'E', urutan: 5, selesai: false, domainKey: 'sos' },
                ],
                siang: [],
                sore: [],
                jelangTidur: [],
            },
        };
        const hasil = (0, mingguan_1.getMingguIrama)({ '2026-07-27': hariData }, '2026-07-27');
        (0, vitest_1.expect)(hasil.rowSpan.pagi).toBe(3);
        (0, vitest_1.expect)(hasil.rowSpan.siang).toBe(1);
        (0, vitest_1.expect)(hasil.rowSpan.sore).toBe(1);
        (0, vitest_1.expect)(hasil.rowSpan.jelangTidur).toBe(1);
    });
    (0, vitest_1.it)('rowSpan 2 untuk slot dengan maksimal 2 item', () => {
        const hariData = {
            tanggal: '2026-07-27',
            slot: {
                pagi: [
                    { id: '1', jenis: 'ajakMain', judul: 'A', urutan: 1, selesai: false, domainKey: 'mk' },
                    { id: '2', jenis: 'ajakMain', judul: 'B', urutan: 2, selesai: false, domainKey: 'mh' },
                ],
                siang: [],
                sore: [],
                jelangTidur: [],
            },
        };
        const hasil = (0, mingguan_1.getMingguIrama)({ '2026-07-27': hariData }, '2026-07-27');
        (0, vitest_1.expect)(hasil.rowSpan.pagi).toBe(2);
    });
    (0, vitest_1.it)('item diurutkan naik berdasarkan urutan dalam slot', () => {
        const hariData = {
            tanggal: '2026-07-27',
            slot: {
                pagi: [
                    { id: '3', jenis: 'ajakMain', judul: 'C', urutan: 3, selesai: false, domainKey: 'bhs' },
                    { id: '1', jenis: 'ajakMain', judul: 'A', urutan: 1, selesai: false, domainKey: 'mk' },
                    { id: '2', jenis: 'ajakMain', judul: 'B', urutan: 2, selesai: false, domainKey: 'mh' },
                ],
                siang: [],
                sore: [],
                jelangTidur: [],
            },
        };
        const hasil = (0, mingguan_1.getMingguIrama)({ '2026-07-27': hariData }, '2026-07-27');
        const pagi = hasil.hari[0].slot.pagi;
        (0, vitest_1.expect)(pagi[0].id).toBe('1');
        (0, vitest_1.expect)(pagi[1].id).toBe('2');
        (0, vitest_1.expect)(pagi[2].id).toBe('3');
    });
});
// ─── getSeninMinggu ────────────────────────────────────────────────────────────
(0, vitest_1.describe)('getSeninMinggu', () => {
    (0, vitest_1.it)('hari Minggu: kembalikan Senin enam hari sebelumnya, bukan besoknya', () => {
        // 2026-08-02 adalah Minggu (2026-07-27 = Senin)
        (0, vitest_1.expect)((0, mingguan_1.getSeninMinggu)('2026-08-02')).toBe('2026-07-27');
    });
    (0, vitest_1.it)('hari Senin: kembalikan hari yang sama', () => {
        (0, vitest_1.expect)((0, mingguan_1.getSeninMinggu)('2026-07-27')).toBe('2026-07-27');
    });
    (0, vitest_1.it)('hari Sabtu: kembalikan Senin lima hari sebelumnya', () => {
        // 2026-08-01 adalah Sabtu
        (0, vitest_1.expect)((0, mingguan_1.getSeninMinggu)('2026-08-01')).toBe('2026-07-27');
    });
    (0, vitest_1.it)('hari Rabu: kembalikan Senin dua hari sebelumnya', () => {
        // 2026-07-29 adalah Rabu
        (0, vitest_1.expect)((0, mingguan_1.getSeninMinggu)('2026-07-29')).toBe('2026-07-27');
    });
});
// ─── tanggalDariTimestampWIB ───────────────────────────────────────────────────
(0, vitest_1.describe)('tanggalDariTimestampWIB', () => {
    (0, vitest_1.it)('pukul 21.00 WIB jatuh di tanggal yang sama, tidak lompat ke hari berikutnya', () => {
        // 2026-08-03T21:00:00+07:00 = 2026-08-03T14:00:00Z
        (0, vitest_1.expect)((0, mingguan_1.tanggalDariTimestampWIB)('2026-08-03T14:00:00Z')).toBe('2026-08-03');
    });
    (0, vitest_1.it)('pukul 00:30 WIB tanggal tertentu = UTC hari sebelumnya, tetap jatuh di tanggal WIB', () => {
        // 2026-08-04T00:30:00+07:00 = 2026-08-03T17:30:00Z — UTC masih Aug 3, WIB sudah Aug 4
        (0, vitest_1.expect)((0, mingguan_1.tanggalDariTimestampWIB)('2026-08-03T17:30:00Z')).toBe('2026-08-04');
    });
});
//# sourceMappingURL=mingguan.test.js.map