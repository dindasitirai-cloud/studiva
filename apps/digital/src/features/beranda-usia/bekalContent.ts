/**
 * Seluruh teks antarmuka yang dilihat orang tua terkait konsep Bekal.
 * Tidak ada teks UI yang ditulis langsung di file data atau logika.
 */

import type { BekalId, SubTahapId } from './bekal';

export const LABEL_BEKAL: Record<BekalId, string> = {
  '0-1': 'Tahun Pertama',
  '1-2': 'Usia 1–2 Tahun',
  '2-3': 'Usia 2–3 Tahun',
  '3-4': 'Usia 3–4 Tahun',
  '4-5': 'Usia 4–5 Tahun',
  '5-6': 'Usia 5–6 Tahun',
};

export const LABEL_SUB_TAHAP: Record<SubTahapId, string> = {
  b03:   '0–3 Bulan',
  b36:   '3–6 Bulan',
  b69:   '6–9 Bulan',
  b912:  '9–12 Bulan',
  t1218: '12–18 Bulan',
  t1824: '18–24 Bulan',
  u23:   '2–3 Tahun',
  u34:   '3–4 Tahun',
  u45:   '4–5 Tahun',
  u56:   '5–6 Tahun',
};

export const PEMBUKA_BEKAL_01 =
  'Tahun pertama berubah paling cepat, jadi bekalnya dibagi per tiga bulan.';

export const PEMBUKA_BEKAL_LAIN =
  'Semua ini tersedia sepanjang rentang usia. Tidak ada yang harus selesai.';

export const TEKS_STATUS = {
  belumLahir:
    'Profil si kecil sudah tersimpan. Bekal akan muncul setelah hari kelahiran tiba.',
  melewatiRentang:
    'Rekah menemani usia 0 sampai 6 tahun. Perjalanan ini sudah jauh, Ayah Bunda.',
  kontenBelumSiap:
    'Bekal untuk usia ini sedang kami siapkan dengan cermat. Nantikan, ya.',
} as const;

/**
 * Keterangan usia koreksi bagi anak yang lahir lebih awal dari perkiraan.
 * Teks ini menenangkan — menyebutkan bahwa usia dihitung dari perkiraan
 * lahir, tanpa membingkainya sebagai kekurangan.
 */
export const TEKS_USIA_KOREKSI =
  'Usia {anak} dihitung dari perkiraan tanggal lahir, bukan tanggal aktual. ' +
  'Ini membantu memilih bekal yang paling sesuai dengan tahap perkembangannya saat ini.';
