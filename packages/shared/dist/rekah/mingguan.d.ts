export type BlokWaktu = 'pagi' | 'siang' | 'sore' | 'jelangTidur';
export declare const BLOK_URUTAN: readonly BlokWaktu[];
export type DomainKeyIrama = 'mk' | 'mh' | 'bhs' | 'kog' | 'sos' | 'sen' | 'fe';
export interface ItemIrama {
    id: string;
    jenis: 'ajakMain' | 'wawasanTumbuh';
    /** Snapshot judul saat ditambah — riwayat tidak hilang bila sumber dihapus. */
    judul: string;
    urutan: number;
    selesai: boolean;
    /** Wajib bila jenis === 'ajakMain'. */
    domainKey?: DomainKeyIrama;
    /** Wajib bila jenis === 'wawasanTumbuh'. Diambil dari AGE_RANGES[card.ageKey].fill. */
    warnaCover?: string;
    kartuId?: string;
}
export interface HariIrama {
    /** ISO 'YYYY-MM-DD' dalam zona waktu WIB. */
    tanggal: string;
    slot: Record<BlokWaktu, ItemIrama[]>;
}
export interface MingguIrama {
    /** Senin, ISO. */
    mulai: string;
    /** Minggu, ISO. */
    selesai: string;
    /** Selalu tepat 7 elemen; hari tanpa data tetap ada dengan slot kosong. */
    hari: HariIrama[];
    rowSpan: Record<BlokWaktu, 1 | 2 | 3>;
}
/**
 * Tambahkan n hari ke tanggal ISO 'YYYY-MM-DD'.
 * Murni aritmetika kalender menggunakan UTC — zona waktu tidak relevan untuk
 * operasi tanggal-ke-tanggal selama input adalah string tanggal kalender.
 */
export declare function tambahHari(isoDate: string, n: number): string;
/**
 * Konversi timestamp UTC ke tanggal kalender WIB (Asia/Jakarta = UTC+7).
 * Dipakai di adapter agar kegiatan pukul 21.00 WIB tidak lompat ke hari berikutnya.
 */
export declare function tanggalDariTimestampWIB(timestampISO: string): string;
/**
 * Kembalikan tanggal Senin (ISO 'YYYY-MM-DD') untuk minggu yang mengandung
 * tanggalISO, menggunakan konvensi kalender Indonesia (minggu mulai Senin).
 *
 * Input diperlakukan sebagai tanggal kalender WIB — tanggal ISO yang dikirim
 * HARUS sudah dalam WIB (seperti yang disimpan oleh PilihanHarian.tanggal).
 */
export declare function getSeninMinggu(tanggalISO: string): string;
/**
 * Bangun MingguIrama dari data per-hari yang sudah dikonversi ke HariIrama.
 *
 * @param dataPerHari  Map tanggal ISO (WIB) → HariIrama; boleh sparse.
 * @param mulaiSenin   Tanggal Senin ISO; gunakan getSeninMinggu untuk menghitungnya.
 *
 * Pure function — tidak memanggil Date.now() atau new Date() tanpa argumen.
 */
export declare function getMingguIrama(dataPerHari: Partial<Record<string, HariIrama>>, mulaiSenin: string): MingguIrama;
//# sourceMappingURL=mingguan.d.ts.map