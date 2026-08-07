/**
 * Nilai yang dirawat hari ini — sumber tunggal untuk menentukan nilai mana
 * yang aktif di Taman Akar hari ini.
 *
 * Murni, deterministik, tanpa efek samping.
 */

import type { NilaiAkar } from './content';

/**
 * Gabungan unik nilai yang muncul dalam sikap atau kegiatan hari ini.
 * Tidak ada filter fokus — semua nilai yang dipraktikkan hari ini dikembalikan.
 * Urutan mengikuti urutan kemunculan pertama (sikap didahulukan).
 */
export function nilaiDirawatHariIni(
  nilaiSikapHariIni: readonly NilaiAkar[],
  nilaiKegiatanHariIni: readonly NilaiAkar[],
): NilaiAkar[] {
  return [...new Set<NilaiAkar>([...nilaiSikapHariIni, ...nilaiKegiatanHariIni])];
}
