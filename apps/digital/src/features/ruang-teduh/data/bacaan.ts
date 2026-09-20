/**
 * Kartu bacaan untuk orang tua — per pita usia.
 *
 * STATUS: DRAFT — judul adalah usulan struktur, belum konten tervalidasi.
 * Wajib review Psikolog Fitri sebelum produksi.
 */

import type { PitaUsia, Peran } from '../types';

export interface KartuBacaan {
  id: string;
  judul: string;
  subjudul: string;
  peran?: Peran; // undefined = tampil untuk semua peran
}

// TODO: butuh konten dari Fitri — seluruh judul dan subjudul kartu bacaan
export const BACAAN: Record<PitaUsia, KartuBacaan[]> = {
  0: [
    {
      id: 'b0-perasaan-ibu',
      judul: 'Yang Ibu rasakan ini normal atau perlu dicek?',
      subjudul: 'Panduan membedakan kelelahan biasa dan tanda perlu bantuan.',
      peran: 'ibu',
    },
    {
      id: 'b0-peran-ayah',
      judul: 'Yang bisa Ayah lakukan minggu ini',
      subjudul: 'Dukungan konkret, bukan sekadar menemani.',
      peran: 'ayah',
    },
    {
      id: 'b0-tidur-aman',
      judul: 'Tidur aman untuk bayi',
      subjudul: 'Lima hal yang perlu ada dan lima yang perlu disingkirkan.',
    },
  ],
  1: [
    {
      id: 'b1-tantrum',
      judul: 'Tantrum bukan perilaku buruk',
      subjudul: 'Ini cara otak kecil melatih pengaturan emosi.',
    },
    {
      id: 'b1-bermain',
      judul: 'Bermain adalah kerja serius',
      subjudul: 'Cara terbaik mendampingi tanpa mengatur.',
    },
  ],
  2: [
    {
      id: 'b2-batas',
      judul: 'Memberi batas tanpa berteriak',
      subjudul: 'Konsistensi lebih kuat daripada volume suara.',
    },
    {
      id: 'b2-mandiri',
      judul: 'Anak mau sendiri — bagaimana mendampingi?',
      subjudul: 'Antara membiarkan dan menjaga tetap aman.',
    },
  ],
  3: [
    {
      id: 'b3-pertanyaan',
      judul: 'Seribu satu pertanyaan anak prasekolah',
      subjudul: 'Tidak harus tahu semua jawabannya.',
    },
    {
      id: 'b3-teman',
      judul: 'Belajar berteman: yang normal dan yang perlu diperhatikan',
      subjudul: 'Panduan untuk masa sosialisasi pertama.',
    },
  ],
  4: [
    {
      id: 'b4-perbandingan',
      judul: '"Di rumah si X boleh" — cara merespons',
      subjudul: 'Tanpa debat, tanpa tergoyahkan.',
    },
    {
      id: 'b4-sekolah',
      judul: 'Mempersiapkan anak masuk sekolah',
      subjudul: 'Yang penting bukan bisa baca-tulis dulu.',
    },
  ],
  5: [
    {
      id: 'b5-melepas',
      judul: 'Melepas dan tetap terhubung',
      subjudul: 'Anak punya dunia sendiri — ini cara Ayah-Ibu tetap jadi rumahnya.',
    },
    {
      id: 'b5-sd',
      judul: 'Sebelum masuk SD: yang perlu disiapkan',
      subjudul: 'Bukan soal akademik dulu.',
    },
  ],
};
