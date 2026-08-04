/**
 * CentangKebiasaan — satu-satunya sumber kebenaran untuk kebiasaan yang dilakukan.
 * Murni: tidak ada Date.now(), tidak ada side effect, tidak ada localStorage.
 */
/**
 * tanggal ISO 'YYYY-MM-DD' → nilaiId (NilaiAkar string) → daftar butirId (ItemSikap.id)
 *
 * Nilai dihitung DISIRAM pada tanggal d kalau ada minimal satu butirId
 * yang tercatat untuk nilai itu pada tanggal d.
 */
export type CentangKebiasaan = Record<string, Record<string, string[]>>;
/**
 * Sentinel yang ditulis oleh grace-window toggle di Pita Kebiasaan.
 * disiramPada memperlakukannya sama seperti butirId biasa.
 */
export declare const CENTANG_UMUM = "__umum__";
/** Apakah nilaiId sudah disiram pada tanggal ini? */
export declare function disiramPada(centang: CentangKebiasaan, nilaiId: string, tanggal: string): boolean;
/**
 * Daftar tanggal (diurutkan) di mana nilaiId sudah disiram.
 * Dipakai untuk menyambungkan ke tingkatMekar.
 */
export declare function riwayatSiramNilai(centang: CentangKebiasaan, nilaiId: string): string[];
/**
 * Menurunkan format Record<tanggal, nilaiId[]> yang dipakai BungaKebiasaan
 * dari CentangKebiasaan — tidak ada data ganda yang disimpan.
 */
export declare function derivedRiwayatSiram(centang: CentangKebiasaan): Record<string, string[]>;
/**
 * Toggle satu butirId untuk nilaiId pada tanggal. Immutable — mengembalikan
 * objek baru tanpa mengubah yang lama.
 */
export declare function toggleCentang(centang: CentangKebiasaan, nilaiId: string, butirId: string, tanggal: string): CentangKebiasaan;
//# sourceMappingURL=centang.d.ts.map