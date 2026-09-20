/**
 * Fase orang tua per pita usia.
 * Fase menamai pengalaman ORANG TUA, bukan capaian anak.
 *
 * STATUS: DRAFT — wajib review Psikolog Fitri sebelum produksi.
 */

import type { PitaUsia, Peran } from '../types';

export interface DataFase {
  /** Label singkat fase, mis. "fase tubuh" */
  label: string;
  /** Kalimat pengakuan setelah sapaan, per peran */
  pengakuan: Record<Peran, string>;
  /** Eyebrow: konteks usia tampil di atas sapaan */
  eyebrow: string;
}

// TODO: review Fitri — seluruh kalimat pengakuan
export const FASE: Record<PitaUsia, DataFase> = {
  0: {
    label: 'fase tubuh',
    eyebrow: '0–1 tahun · fase tubuh',
    pengakuan: {
      ibu: 'Tubuh Ibu baru saja melakukan sesuatu yang luar biasa. Tahun ini soal pemulihan dan penyesuaian.',
      ayah: 'Ayah ada di tahun pertama yang mengubah segalanya. Kehadiran itu sudah kerja nyata.',
    },
  },
  1: {
    label: 'fase stamina',
    eyebrow: '1–2 tahun · fase stamina',
    pengakuan: {
      ibu: 'Rutinitas dan stamina — ini tahun yang paling menguras. Ibu tidak harus baik-baik saja setiap hari.',
      ayah: 'Menjaga rumah tetap bergerak di tahun ini adalah pekerjaan sungguhan.',
    },
  },
  2: {
    label: 'fase gejolak',
    eyebrow: '2–3 tahun · fase gejolak',
    pengakuan: {
      ibu: 'Anak yang baru belajar berkehendak butuh orang dewasa yang tenang. Itu tidak mudah, dan itu wajar.',
      ayah: 'Di fase ini kekuatan Ayah bukan pada fisik, tapi pada konsistensi dan ketenangan.',
    },
  },
  3: {
    label: 'fase wibawa',
    eyebrow: '3–4 tahun · fase wibawa',
    pengakuan: {
      ibu: 'Pertanyaan tidak ada habisnya, dan Ibu tidak harus punya semua jawabannya.',
      ayah: 'Anak seusia ini sedang membangun gambar tentang ayah. Hadir sudah cukup untuk memulai.',
    },
  },
  4: {
    label: 'fase pembanding',
    eyebrow: '4–5 tahun · fase pembanding',
    pengakuan: {
      ibu: '"Di rumah si X boleh." Wajar terasa lelah oleh perbandingan yang tidak diminta.',
      ayah: 'Anak mulai membandingkan dan mempertanyakan. Itu tanda ia berkembang, bukan tanda Ayah salah.',
    },
  },
  5: {
    label: 'fase melepas',
    eyebrow: '5–6 tahun · fase melepas',
    pengakuan: {
      ibu: 'Sebentar lagi sekolah. Melepas selalu ada rasa campuran — bangga sekaligus tidak rela.',
      ayah: 'Anak mulai punya dunia sendiri. Penasaran Ayah pada dunianya adalah hadiah terbesar.',
    },
  },
};
