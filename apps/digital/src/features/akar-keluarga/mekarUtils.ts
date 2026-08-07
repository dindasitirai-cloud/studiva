/**
 * Fungsi murni untuk menghitung tingkat mekar bunga nilai.
 * Tanpa efek samping, tanpa ketergantungan eksternal — aman untuk pengujian.
 */

import type { NilaiAkar } from './content';

/** Jumlah kejadian perawatan unik untuk mekar penuh. */
export const TINGKAT_PENUH = 5;

/** Rolling window dalam hari. */
export const WINDOW_HARI = 14;

/**
 * Tingkat mekar bunga nilai — 0 (istirahat) sampai TINGKAT_PENUH (mekar penuh).
 *
 * Aturan:
 * - Hanya kejadian dalam WINDOW_HARI hari terakhir yang dihitung (inklusif hari batas).
 * - Beberapa kejadian dalam satu hari kalender dihitung sebagai satu.
 * - Tingkat dikap ke TINGKAT_PENUH bila kejadian > TINGKAT_PENUH.
 */
export function tingkatMekar(riwayat: readonly Date[], sekarang = new Date()): number {
  const tglSekarang = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate());
  const batas = new Date(tglSekarang);
  batas.setDate(batas.getDate() - WINDOW_HARI);

  const hariUnik = new Set<string>();
  for (const d of riwayat) {
    const tgl = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (tgl >= batas) {
      hariUnik.add(`${tgl.getFullYear()}-${tgl.getMonth()}-${tgl.getDate()}`);
    }
  }
  return Math.min(hariUnik.size, TINGKAT_PENUH);
}

export interface CatatanPerawatan {
  /** Tanggal kejadian perawatan. Komponen waktu diabaikan. */
  tanggal: Date;
  nilaiTercapai: readonly NilaiAkar[];
}

/**
 * Merangkai riwayat perawatan dari catatan harian menjadi peta NilaiAkar → Date[].
 * Hasil dipakai sebagai input tingkatMekar per nilai.
 */
export function rangkaiRiwayatPerawatan(
  catatan: readonly CatatanPerawatan[],
): Partial<Record<NilaiAkar, Date[]>> {
  const hasil: Partial<Record<NilaiAkar, Date[]>> = {};
  for (const { tanggal, nilaiTercapai } of catatan) {
    for (const nilai of nilaiTercapai) {
      if (!hasil[nilai]) hasil[nilai] = [];
      hasil[nilai]!.push(tanggal);
    }
  }
  return hasil;
}
