import type { NilaiId } from './values';

export interface RefleksiEntry {
  id: string;
  moduleId: string;
  tanggal: string; // ISO date string
  responsAnak: 'seru' | 'menantang' | 'belum-tertarik';
  moodCaregiver?: 'lega' | 'biasa' | 'lelah';
  catatan?: string;
  nilaiUtama?: NilaiId; // dari modul yang dicatat
  simpanKeJurnal?: boolean;
}

export interface RefleksiMusim {
  musimId: string; // musimMulai ISO date
  syukurCatatan?: string;
  tanggal: string; // ISO date saat refleksi musim diisi
}
