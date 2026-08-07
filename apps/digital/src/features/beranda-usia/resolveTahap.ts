/**
 * Satu-satunya tempat logika usia berada.
 * Tidak boleh ada perhitungan usia yang tersebar di komponen mana pun —
 * semua pemanggil harus masuk melalui resolveTahapAktif.
 *
 * Semua fungsi murni. Tidak melempar exception pada input apa pun.
 */

import type { Bekal, SubTahap } from './bekal';
import { DAFTAR_BEKAL } from './bekalRegistry';
import { hitungUsiaBulan, hitungUsiaKoreksiBulan } from './usia';

export interface ProfilAnak {
  tanggalLahir: Date;
  /** Opsional. Tidak diisi berarti diperlakukan sebagai cukup bulan (>= 37 minggu). */
  mingguGestasi?: number;
}

export interface HasilTahap {
  bekal: Bekal;
  subTahap: SubTahap;
  usiaBulan: number;
  /** true jika angka usiaBulan sudah dikoreksi karena kelahiran lebih awal. */
  memakaiUsiaKoreksi: boolean;
}

/**
 * Discriminated union — memaksa setiap pemanggil menangani semua keadaan.
 * Tidak boleh ada jalur yang melempar exception.
 */
export type StatusTahap =
  | { status: 'ok'; hasil: HasilTahap }
  | { status: 'belumLahir' }
  | { status: 'melewatiRentang'; usiaBulan: number }
  | { status: 'kontenBelumSiap'; bekal: Bekal; usiaBulan: number };

/**
 * Menentukan Bekal dan sub-tahap aktif berdasarkan profil anak dan tanggal acuan.
 *
 * Urutan aturan:
 * 1. Usia negatif → belumLahir
 * 2. Usia >= 72 bulan → melewatiRentang
 * 3. Cari sub-tahap dengan usiaBulanMulai <= usia < usiaBulanSelesai
 * 4. Jika Bekal induknya aktif === false → kontenBelumSiap
 * 5. Selain itu → ok
 *
 * Batas inklusif di bawah, eksklusif di atas — konsisten dengan AGE_RANGES
 * di learningStrategies.ts.
 */
export function resolveTahapAktif(
  profil: ProfilAnak,
  acuan: Date,
): StatusTahap {
  const usiaBulanKronologis = hitungUsiaBulan(profil.tanggalLahir, acuan);

  const usiaBulanHitung =
    profil.mingguGestasi !== undefined
      ? hitungUsiaKoreksiBulan(profil.tanggalLahir, acuan, profil.mingguGestasi)
      : usiaBulanKronologis;

  const memakaiUsiaKoreksi = usiaBulanHitung !== usiaBulanKronologis;

  // Aturan 1
  if (usiaBulanHitung < 0) return { status: 'belumLahir' };

  // Aturan 2
  if (usiaBulanHitung >= 72) return { status: 'melewatiRentang', usiaBulan: usiaBulanHitung };

  // Aturan 3, 4, 5
  for (const bekal of DAFTAR_BEKAL) {
    for (const subTahap of bekal.subTahap) {
      if (
        usiaBulanHitung >= subTahap.usiaBulanMulai &&
        usiaBulanHitung < subTahap.usiaBulanSelesai
      ) {
        // Aturan 4
        if (!bekal.aktif) {
          return { status: 'kontenBelumSiap', bekal, usiaBulan: usiaBulanHitung };
        }
        // Aturan 5
        return {
          status: 'ok',
          hasil: { bekal, subTahap, usiaBulan: usiaBulanHitung, memakaiUsiaKoreksi },
        };
      }
    }
  }

  // Seharusnya tidak pernah dicapai jika registry menutupi 0–72 tanpa celah.
  // Dikembalikan sebagai melewatiRentang sebagai jaring pengaman.
  return { status: 'melewatiRentang', usiaBulan: usiaBulanHitung };
}
