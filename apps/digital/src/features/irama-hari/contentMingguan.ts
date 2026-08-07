// =============================================================
// KONTEN FITUR IRAMA HARI MINGGUAN
// STATUS: DRAFT — seluruh teks UI MENUNGGU REVIEW PSIKOLOG FITRI
// sebelum rilis produksi. Jangan ubah copy tanpa melalui review.
// =============================================================

import type { DomainKeyIrama } from './mingguanAdapter';

// TODO: review Fitri
export const JUDUL_LAYAR = 'Irama Hari';

// TODO: review Fitri
export const JUDUL_RINGKASAN = 'Irama Minggu Ini';

// TODO: review Fitri
export const JUDUL_PITA = 'Pita Kebiasaan';

// ─── Ringkasan minggu ─────────────────────────────────────────────────────────

// TODO: review Fitri
export const RINGKASAN_DOMINAN = (namaDomainRamah: string) =>
  `Minggu ini banyak ${namaDomainRamah}.`;

// TODO: review Fitri
export const RINGKASAN_BERAGAM = 'Minggu ini beragam.';

// TODO: review Fitri
export const RINGKASAN_BACAAN = 'Minggu ini banyak membaca bersama.';

// TODO: review Fitri
export const RINGKASAN_KOSONG_JUDUL = 'Minggu ini belum ada catatan.';

// TODO: review Fitri
export const RINGKASAN_KOSONG_ISI =
  'Irama setiap keluarga berbeda. Kapan pun kamu siap, Bekal selalu ada.';

// TODO: review Fitri
export const RINGKASAN_KOSONG_TOMBOL = 'Buka Bekal';

// ─── Tile ringkasan ───────────────────────────────────────────────────────────

// TODO: review Fitri
export const TILE_AJAK_MAIN_LABEL = 'Ajak Main';
// TODO: review Fitri
export const TILE_AJAK_MAIN_SATUAN = 'kegiatan';

// TODO: review Fitri
export const TILE_WAWASAN_LABEL = 'Wawasan Tumbuh';
// TODO: review Fitri
export const TILE_WAWASAN_SATUAN = 'bacaan';

// TODO: review Fitri
export const TILE_WAKTU_LABEL = 'Waktu paling hidup';

// ─── Pita Kebiasaan ───────────────────────────────────────────────────────────

// TODO: review Fitri
export const KEBIASAAN_DISIRAM = (nilai: string, n: number) =>
  `${nilai} disiram di ${n} hari minggu ini.`;

// TODO: review Fitri
export const KEBIASAAN_ISTIRAHAT = (nilai: string) =>
  `${nilai} sedang istirahat minggu ini.`;

// TODO: review Fitri
export const KEBIASAAN_LIHAT_SEMUA = 'Lihat semua nilai';

// TODO: review Fitri
export const KEBIASAAN_KOSONG = 'Tanam nilai pertama di Akar Keluarga';

// TODO: review Fitri
export const KEBIASAAN_MEKAR_PENUH_LABEL = 'Mekar penuh';

// TODO: review Fitri
export const KEBIASAAN_LEGENDA = 'Istirahat · Mulai mekar · Mekar penuh';

// ─── Legenda ──────────────────────────────────────────────────────────────────

// TODO: review Fitri
export const LEGENDA_AJAK_MAIN = 'Ajak Main';
// TODO: review Fitri
export const LEGENDA_WAWASAN = 'Wawasan Tumbuh';

// ─── Label blok waktu (konsisten dengan content.ts harian) ───────────────────

export const LABEL_BLOK = {
  pagi:        'Pagi',
  siang:       'Siang',
  sore:        'Sore',
  jelangTidur: 'Jelang tidur',
} as const;

// ─── Nama domain ramah (terjemahan hangat, bukan istilah teknis) ──────────────

// TODO: review Fitri — konfirmasi terjemahan tiap domain
export const NAMA_DOMAIN_RAMAH: Record<DomainKeyIrama, string> = {
  mk:  'gerak besar',
  mh:  'gerak jemari',
  bhs: 'obrolan',
  kog: 'berpikir dan mencari tahu',
  sos: 'rasa dan hubungan',
  sen: 'meraba dan merasakan',
  fe:  'mengatur diri',
};

// ─── Label domain tampil ──────────────────────────────────────────────────────

export const LABEL_DOMAIN: Record<DomainKeyIrama, string> = {
  mk:  'Motorik Kasar',
  mh:  'Motorik Halus',
  bhs: 'Bahasa',
  kog: 'Kognitif',
  sos: 'Sosial-Emosional',
  sen: 'Sensorik',
  fe:  'Fungsi Eksekutif',
};

// ─── Navigasi minggu ─────────────────────────────────────────────────────────

// TODO: review Fitri
export const ARIA_MINGGU_SEBELUMNYA = 'Minggu sebelumnya';
// TODO: review Fitri
export const ARIA_MINGGU_BERIKUTNYA = 'Minggu berikutnya';
