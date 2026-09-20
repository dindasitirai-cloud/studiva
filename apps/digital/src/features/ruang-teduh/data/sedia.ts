/**
 * Konten KartuSedia — isi per pita usia.
 *
 * Sumber: jadwal imunisasi rutin Kemenkes, program suplementasi vitamin A Kemenkes,
 * Buku Bagan SDIDTK Kemenkes.
 *
 * TERBUKA: irama SDIDTK — laman Kesga menyebut 3 bulanan (0–24 bln) & 6 bulanan (24–72 bln),
 * Buku Bagan menyebut usia tertentu (6,9,18,24,36,48,60,72 bln). Perlu keputusan Fitri.
 *
 * TERBUKA: Kemenkes vs IDAI sebagai dasar. Saat ini memakai Kemenkes (gratis di Posyandu,
 * tercetak di Buku KIA). Perlu keputusan Fitri.
 *
 * STATUS: DRAFT — konten belum diverifikasi lengkap dari mockup v5 (file tidak ditemukan).
 * Semua butir dengan komentar "TODO: butuh konten dari Fitri" harus diverifikasi.
 */

import type { ButirSedia, PitaUsia } from '../types';

// ─── Pita 0: 0–1 tahun ───────────────────────────────────────────────────────

const SEDIA_0_KESEHATAN: ButirSedia[] = [
  {
    id: 's0-imun-bcg',
    judul: 'Imunisasi BCG',
    penjelasan: 'Diberikan satu kali, usia 1 bulan.',
    sumber: 'Kemenkes — Jadwal Imunisasi Rutin',
    kelompok: 'kesehatan',
  },
  {
    id: 's0-imun-hepb',
    judul: 'Imunisasi Hepatitis B',
    penjelasan: 'Empat dosis: lahir, 2 bulan, 3 bulan, 4 bulan.',
    sumber: 'Kemenkes — Jadwal Imunisasi Rutin',
    kelompok: 'kesehatan',
  },
  {
    id: 's0-imun-dtp',
    judul: 'Imunisasi DTP-HB-Hib',
    penjelasan: 'Tiga dosis primer: 2, 3, dan 4 bulan.',
    sumber: 'Kemenkes — Jadwal Imunisasi Rutin',
    kelompok: 'kesehatan',
  },
  {
    id: 's0-imun-polio',
    judul: 'Imunisasi Polio',
    penjelasan: 'OPV lahir, lalu OPV+IPV usia 2, 3, 4 bulan.',
    sumber: 'Kemenkes — Jadwal Imunisasi Rutin',
    kelompok: 'kesehatan',
  },
  {
    id: 's0-imun-pcv',
    judul: 'Imunisasi PCV',
    penjelasan: 'Dua dosis primer: 2 dan 3 bulan.',
    sumber: 'Kemenkes — Jadwal Imunisasi Rutin',
    kelompok: 'kesehatan',
  },
  {
    id: 's0-imun-rotavirus',
    judul: 'Imunisasi Rotavirus',
    penjelasan: 'Dua dosis: 2 dan 3 bulan. Diberikan sesuai jenis vaksin.',
    sumber: 'Kemenkes — Jadwal Imunisasi Rutin',
    kelompok: 'kesehatan',
  },
  {
    id: 's0-imun-mr',
    judul: 'Imunisasi MR (Campak-Rubella)',
    penjelasan: 'Satu dosis, usia 9 bulan.',
    sumber: 'Kemenkes — Jadwal Imunisasi Rutin',
    kelompok: 'kesehatan',
  },
  {
    id: 's0-vitamina',
    judul: 'Vitamin A kapsul biru',
    penjelasan: 'Mulai usia 6 bulan. Dosis 100.000 IU, setiap Februari dan Agustus di Posyandu.',
    sumber: 'Kemenkes — Program Suplementasi Vitamin A',
    kelompok: 'kesehatan',
  },
  {
    id: 's0-sdidtk',
    judul: 'Pemantauan SDIDTK',
    penjelasan: 'Setiap 3 bulan sekali pada tahun pertama. Bawa Buku KIA ke Posyandu.',
    sumber: 'Kemenkes — Buku Bagan SDIDTK',
    kelompok: 'kesehatan',
  },
];

// TODO: butuh konten dari Fitri — butir pengingat rumah tangga pita 0
const SEDIA_0_RUMAH: ButirSedia[] = [
  {
    id: 's0-r-kia',
    judul: 'Buku KIA dibawa ke setiap kunjungan',
    penjelasan: 'Catatan tumbuh kembang dan imunisasi ada di sini.',
    sumber: '',
    kelompok: 'rumah',
  },
  {
    id: 's0-r-posyandu',
    judul: 'Jadwal Posyandu diketahui',
    penjelasan: 'Posyandu biasanya sebulan sekali. Timbang, imunisasi, dan konsultasi gratis.',
    sumber: '',
    kelompok: 'rumah',
  },
];

// ─── Pita 1: 1–2 tahun ───────────────────────────────────────────────────────

const SEDIA_1_KESEHATAN: ButirSedia[] = [
  {
    id: 's1-imun-dtp-booster',
    judul: 'Imunisasi DTP-HB-Hib booster',
    penjelasan: 'Satu dosis booster, usia 18 bulan.',
    sumber: 'Kemenkes — Jadwal Imunisasi Rutin',
    kelompok: 'kesehatan',
  },
  {
    id: 's1-imun-mr-booster',
    judul: 'Imunisasi MR booster',
    penjelasan: 'Satu dosis booster, usia 18 bulan.',
    sumber: 'Kemenkes — Jadwal Imunisasi Rutin',
    kelompok: 'kesehatan',
  },
  {
    id: 's1-imun-pcv-booster',
    judul: 'Imunisasi PCV booster',
    penjelasan: 'Satu dosis booster, usia 12 bulan.',
    sumber: 'Kemenkes — Jadwal Imunisasi Rutin',
    kelompok: 'kesehatan',
  },
  {
    id: 's1-imun-polio-booster',
    judul: 'Imunisasi Polio booster',
    penjelasan: 'Satu dosis OPV booster, usia 18 bulan.',
    sumber: 'Kemenkes — Jadwal Imunisasi Rutin',
    kelompok: 'kesehatan',
  },
  {
    id: 's1-vitamina',
    judul: 'Vitamin A kapsul merah',
    penjelasan: 'Dosis 200.000 IU, setiap Februari dan Agustus di Posyandu.',
    sumber: 'Kemenkes — Program Suplementasi Vitamin A',
    kelompok: 'kesehatan',
  },
  {
    id: 's1-sdidtk',
    judul: 'Pemantauan SDIDTK',
    penjelasan: 'Usia 12 dan 18 bulan. Bawa Buku KIA ke Posyandu.',
    sumber: 'Kemenkes — Buku Bagan SDIDTK',
    kelompok: 'kesehatan',
  },
];

// TODO: butuh konten dari Fitri — butir pengingat rumah tangga pita 1
const SEDIA_1_RUMAH: ButirSedia[] = [
  {
    id: 's1-r-mpasi',
    judul: 'MPASI berjalan lancar',
    penjelasan: 'Anak usia 1–2 tahun masih butuh variasi tekstur dan gizi seimbang.',
    sumber: '',
    kelompok: 'rumah',
  },
  {
    id: 's1-r-tidur',
    judul: 'Rutinitas tidur terjaga',
    penjelasan: 'Anak 1–2 tahun butuh 11–14 jam tidur per hari termasuk tidur siang.',
    sumber: '',
    kelompok: 'rumah',
  },
];

// ─── Pita 2: 2–3 tahun ───────────────────────────────────────────────────────

const SEDIA_2_KESEHATAN: ButirSedia[] = [
  {
    id: 's2-imun-catatan',
    judul: 'Tidak ada imunisasi program rutin di rentang ini',
    penjelasan: 'Imunisasi berikutnya baru di sekolah (kelas 1 SD). Tetap pantau Buku KIA.',
    sumber: 'Kemenkes — Jadwal Imunisasi Rutin',
    kelompok: 'kesehatan',
  },
  {
    id: 's2-vitamina',
    judul: 'Vitamin A kapsul merah',
    penjelasan: 'Dosis 200.000 IU, setiap Februari dan Agustus di Posyandu.',
    sumber: 'Kemenkes — Program Suplementasi Vitamin A',
    kelompok: 'kesehatan',
  },
  {
    id: 's2-sdidtk',
    judul: 'Pemantauan SDIDTK',
    penjelasan: 'Usia 24 dan 36 bulan. Bawa Buku KIA ke Posyandu atau Puskesmas.',
    sumber: 'Kemenkes — Buku Bagan SDIDTK',
    kelompok: 'kesehatan',
  },
];

// TODO: butuh konten dari Fitri — butir pengingat rumah tangga pita 2
const SEDIA_2_RUMAH: ButirSedia[] = [
  {
    id: 's2-r-bahasa',
    judul: 'Perkembangan bahasa dipantau',
    penjelasan: 'Usia 2 tahun umumnya sudah bisa dua kata. Cerita ke dokter kalau belum.',
    sumber: '',
    kelompok: 'rumah',
  },
  {
    id: 's2-r-gigi',
    judul: 'Gigi sulung disikat dua kali sehari',
    penjelasan: 'Pakai pasta gigi berfluoride seukuran biji beras.',
    sumber: '',
    kelompok: 'rumah',
  },
];

// ─── Pita 3: 3–4 tahun ───────────────────────────────────────────────────────

const SEDIA_3_KESEHATAN: ButirSedia[] = [
  {
    id: 's3-imun-catatan',
    judul: 'Tidak ada imunisasi program rutin di rentang ini',
    penjelasan: 'Imunisasi berikutnya di sekolah (kelas 1 SD). Tetap pantau Buku KIA.',
    sumber: 'Kemenkes — Jadwal Imunisasi Rutin',
    kelompok: 'kesehatan',
  },
  {
    id: 's3-vitamina',
    judul: 'Vitamin A kapsul merah',
    penjelasan: 'Dosis 200.000 IU, setiap Februari dan Agustus di Posyandu (sampai usia 59 bulan).',
    sumber: 'Kemenkes — Program Suplementasi Vitamin A',
    kelompok: 'kesehatan',
  },
  {
    id: 's3-sdidtk',
    judul: 'Pemantauan SDIDTK',
    penjelasan: 'Usia 36 dan 48 bulan. Bawa Buku KIA ke Posyandu atau Puskesmas.',
    sumber: 'Kemenkes — Buku Bagan SDIDTK',
    kelompok: 'kesehatan',
  },
];

// TODO: butuh konten dari Fitri — butir pengingat rumah tangga pita 3
const SEDIA_3_RUMAH: ButirSedia[] = [
  {
    id: 's3-r-bermain',
    judul: 'Waktu bermain bebas tersedia setiap hari',
    penjelasan: 'Bermain tanpa aturan adalah cara anak belajar mengatur dirinya sendiri.',
    sumber: '',
    kelompok: 'rumah',
  },
  {
    id: 's3-r-gigi',
    judul: 'Gigi sulung disikat dua kali sehari',
    penjelasan: 'Pakai pasta gigi berfluoride seukuran kacang polong.',
    sumber: '',
    kelompok: 'rumah',
  },
];

// ─── Pita 4: 4–5 tahun (48–59 bulan) ─────────────────────────────────────────

const SEDIA_4_KESEHATAN: ButirSedia[] = [
  {
    id: 's4-imun-catatan',
    judul: 'Tidak ada imunisasi program rutin di rentang ini',
    penjelasan: 'Imunisasi berikutnya di sekolah (kelas 1 SD). Tetap pantau Buku KIA.',
    sumber: 'Kemenkes — Jadwal Imunisasi Rutin',
    kelompok: 'kesehatan',
  },
  {
    id: 's4-vitamina',
    judul: 'Vitamin A terakhir',
    penjelasan: 'Vitamin A berhenti di 59 bulan. Pastikan anak sudah dapat dosis Agustus atau Februari sebelum usia 5 tahun.',
    sumber: 'Kemenkes — Program Suplementasi Vitamin A',
    kelompok: 'kesehatan',
  },
  {
    id: 's4-sdidtk',
    judul: 'Pemantauan SDIDTK',
    penjelasan: 'Usia 48 dan 60 bulan. Bawa Buku KIA ke Posyandu atau Puskesmas.',
    sumber: 'Kemenkes — Buku Bagan SDIDTK',
    kelompok: 'kesehatan',
  },
];

// TODO: butuh konten dari Fitri — butir pengingat rumah tangga pita 4
const SEDIA_4_RUMAH: ButirSedia[] = [
  {
    id: 's4-r-sekolah',
    judul: 'Persiapan masuk TK atau PAUD dipantau',
    penjelasan: 'Anak tidak harus bisa baca-tulis. Kemandirian dan kemampuan bergaul lebih penting di tahap ini.',
    sumber: '',
    kelompok: 'rumah',
  },
  {
    id: 's4-r-tidur',
    judul: 'Waktu tidur konsisten',
    penjelasan: 'Anak 4–5 tahun butuh 10–13 jam tidur per hari.',
    sumber: '',
    kelompok: 'rumah',
  },
];

// ─── Pita 5: 5–6 tahun ───────────────────────────────────────────────────────

const SEDIA_5_KESEHATAN: ButirSedia[] = [
  {
    id: 's5-imun-catatan',
    judul: 'Imunisasi DT dan Td di kelas 1 SD',
    penjelasan: 'Diberikan melalui program BIAS di sekolah. Tidak perlu dicari sendiri.',
    sumber: 'Kemenkes — Jadwal Imunisasi Rutin',
    kelompok: 'kesehatan',
  },
  {
    id: 's5-vitamina',
    judul: 'Vitamin A sudah tidak diberikan',
    penjelasan: 'Program suplementasi vitamin A berakhir di usia 59 bulan.',
    sumber: 'Kemenkes — Program Suplementasi Vitamin A',
    kelompok: 'kesehatan',
  },
  {
    id: 's5-sdidtk',
    judul: 'Pemantauan SDIDTK',
    penjelasan: 'Usia 60 dan 72 bulan. Bawa Buku KIA ke Posyandu atau Puskesmas.',
    sumber: 'Kemenkes — Buku Bagan SDIDTK',
    kelompok: 'kesehatan',
  },
];

// TODO: butuh konten dari Fitri — butir pengingat rumah tangga pita 5
const SEDIA_5_RUMAH: ButirSedia[] = [
  {
    id: 's5-r-sekolah',
    judul: 'Persiapan masuk SD dipantau',
    penjelasan: 'Pendaftaran SD biasanya berdasarkan usia dan domisili. Cek jadwal PPDB daerah.',
    sumber: '',
    kelompok: 'rumah',
  },
  {
    id: 's5-r-tidur',
    judul: 'Waktu tidur konsisten',
    penjelasan: 'Anak 5–6 tahun butuh 10–13 jam tidur per hari.',
    sumber: '',
    kelompok: 'rumah',
  },
];

// ─── Ekspor per pita ─────────────────────────────────────────────────────────

export const SEDIA_KESEHATAN: Record<PitaUsia, ButirSedia[]> = {
  0: SEDIA_0_KESEHATAN,
  1: SEDIA_1_KESEHATAN,
  2: SEDIA_2_KESEHATAN,
  3: SEDIA_3_KESEHATAN,
  4: SEDIA_4_KESEHATAN,
  5: SEDIA_5_KESEHATAN,
};

export const SEDIA_RUMAH: Record<PitaUsia, ButirSedia[]> = {
  0: SEDIA_0_RUMAH,
  1: SEDIA_1_RUMAH,
  2: SEDIA_2_RUMAH,
  3: SEDIA_3_RUMAH,
  4: SEDIA_4_RUMAH,
  5: SEDIA_5_RUMAH,
};
