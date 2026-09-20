// =============================================================
// COPY PITA KEBIASAAN — IRAMA HARI MINGGUAN
// STATUS: DRAFT — seluruh teks UI MENUNGGU REVIEW PSIKOLOG FITRI
// sebelum rilis produksi. Jangan ubah copy tanpa melalui review.
// =============================================================

import { TAHAP_MAKS } from '../lib/mekar';

export type LabelMekar =
  | 'Istirahat'
  | 'Mulai mekar'
  | 'Sedang mekar'
  | 'Hampir penuh'
  | 'Mekar penuh';

/** Chip warna per label — pasangan ink (teks) dan bg (latar). */
export const CHIP_PITA: Record<LabelMekar, { ink: string; bg: string }> = {
  'Istirahat':     { ink: '#A98DA0', bg: '#F3E8EF' },
  'Mulai mekar':   { ink: '#B98900', bg: '#FFF3D0' },
  'Sedang mekar':  { ink: '#B98900', bg: '#FFF3D0' },
  'Hampir penuh':  { ink: '#9B7700', bg: '#FFE89A' },
  'Mekar penuh':   { ink: '#9B7700', bg: '#FFE89A' },
};

/** Menentukan label tahap dari angka mekar. */
export function labelDariMekar(mekar: number): LabelMekar {
  if (mekar === 0)         return 'Istirahat';
  if (mekar <= 2)          return 'Mulai mekar';
  if (mekar <= 4.5)        return 'Sedang mekar';
  if (mekar < TAHAP_MAKS)  return 'Hampir penuh';
  return 'Mekar penuh';
}

// TODO: review Fitri
export const PRINSIP_PITA =
  'Kelopak mekar bertahap setiap harinya setiap kali disiram dengan melakukan kebiasaan yang ada tiap nilai, dan kan sedikit meredup jika tidak rutin disiram.';

// TODO: review Fitri
export const KALIMAT_PITA = {
  /** Teks panjang (tidak dipakai di grid sisi-sisi). */
  disiram: (nilai: string, n: number) =>
    `${nilai} sudah disiram ${n === 1 ? 'satu kali' : `${n} kali`} sejauh ini.`,
  istirahat: (nilai: string) =>
    `${nilai} sedang istirahat. Bunga ini tetap utuh.`,
  /** Label pendek untuk tampilan grid: menghitung hari unik yang ada centang. */
  hitungPendek: (n: number) => (n === 0 ? 'Belum disiram' : `${n} hari disiram`),
} as const;
