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
export const CENTANG_UMUM = '__umum__';

/** Apakah nilaiId sudah disiram pada tanggal ini? */
export function disiramPada(
  centang: CentangKebiasaan,
  nilaiId: string,
  tanggal: string,
): boolean {
  return (centang[tanggal]?.[nilaiId]?.length ?? 0) > 0;
}

/**
 * Daftar tanggal (diurutkan) di mana nilaiId sudah disiram.
 * Dipakai untuk menyambungkan ke tingkatMekar.
 */
export function riwayatSiramNilai(
  centang: CentangKebiasaan,
  nilaiId: string,
): string[] {
  return Object.keys(centang)
    .filter(tgl => disiramPada(centang, nilaiId, tgl))
    .sort();
}

/**
 * Menurunkan format Record<tanggal, nilaiId[]> yang dipakai BungaKebiasaan
 * dari CentangKebiasaan — tidak ada data ganda yang disimpan.
 */
export function derivedRiwayatSiram(
  centang: CentangKebiasaan,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [tgl, nilaiMap] of Object.entries(centang)) {
    const disiram = Object.entries(nilaiMap)
      .filter(([, butirIds]) => butirIds.length > 0)
      .map(([nilaiId]) => nilaiId);
    if (disiram.length > 0) result[tgl] = disiram;
  }
  return result;
}

/**
 * Toggle satu butirId untuk nilaiId pada tanggal. Immutable — mengembalikan
 * objek baru tanpa mengubah yang lama.
 */
export function toggleCentang(
  centang: CentangKebiasaan,
  nilaiId: string,
  butirId: string,
  tanggal: string,
): CentangKebiasaan {
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
