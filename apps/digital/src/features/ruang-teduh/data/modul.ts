/**
 * Konfigurasi modul Ruang Teduh — data-driven.
 * Menambah modul baru cukup satu entri di sini, tanpa menyentuh komponen.
 *
 * STATUS: DRAFT — wajib review sebelum produksi.
 */

import type { KonfigModul, Peran, PitaUsia } from '../types';

export const MODUL: KonfigModul[] = [
  // ── Kolom kiri ───────────────────────────────────────────────────────────
  {
    id: 'langit-hari-ini',
    kolom: 'kiri',
    urutanMobile: 1,
    tampil: () => true,
  },
  {
    id: 'setelah-badai',
    kolom: 'kiri',
    urutanMobile: 2, // Naik ke posisi 2 di mobile — satu-satunya kartu darurat
    tampil: () => true,
  },
  {
    id: 'sedia',
    kolom: 'kiri',
    urutanMobile: 3,
    tampil: () => true,
  },

  // ── Kolom kanan ──────────────────────────────────────────────────────────
  {
    id: 'lembar-nifas',
    kolom: 'kanan',
    urutanMobile: 5,
    // Hanya tampil untuk ibu di pita 0 (0–1 tahun)
    tampil: (peran: Peran, usia: PitaUsia) => peran === 'ibu' && usia === 0,
  },
  {
    id: 'piring-ibu',
    kolom: 'kanan',
    urutanMobile: 6,
    // Hanya tampil untuk ibu di pita 0 (0–1 tahun)
    tampil: (peran: Peran, usia: PitaUsia) => peran === 'ibu' && usia === 0,
  },
  {
    id: 'menyambut',
    kolom: 'kanan',
    urutanMobile: 4,
    // Kedua peran, hanya pita 0
    tampil: (_peran: Peran, usia: PitaUsia) => usia === 0,
  },
  {
    id: 'ruang-ayah',
    kolom: 'kanan',
    urutanMobile: 7,
    tampil: (peran: Peran) => peran === 'ayah',
  },
  {
    id: 'ini-wajar',
    kolom: 'kanan',
    urutanMobile: 8,
    tampil: () => true,
  },
  {
    id: 'bacaan',
    kolom: 'kanan',
    urutanMobile: 9,
    tampil: () => true,
  },
];
