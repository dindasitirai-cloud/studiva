// ============================================================================
// Tipe kanonik profil anak.
//
// SATU SUMBER DATA: tabel `anak` di Supabase → lib/supabase/rekah.ts →
// context/AnakContext.tsx → seluruh UI.
//
// Jangan membuat tipe profil anak lain. Kalau sebuah layar butuh data anak,
// ambil lewat useAnak() atau useAnakAktif(), jangan lewat props berantai,
// outlet context, atau salinan di context lain.
// ============================================================================

export type JenisKelamin = 'perempuan' | 'laki-laki';

export type PeranPendamping =
  | 'ibu'
  | 'ayah'
  | 'nenek-kakek'
  | 'pengasuh'
  | 'lainnya';

export const PERAN_PENDAMPING: readonly PeranPendamping[] = [
  'ibu',
  'ayah',
  'nenek-kakek',
  'pengasuh',
  'lainnya',
] as const;

export const LABEL_PERAN: Record<PeranPendamping, string> = {
  'ibu': 'Ibu',
  'ayah': 'Ayah',
  'nenek-kakek': 'Nenek atau Kakek',
  'pengasuh': 'Pengasuh',
  'lainnya': 'Lainnya',
};

export const LABEL_JENIS_KELAMIN: Record<JenisKelamin, string> = {
  'perempuan': 'Perempuan',
  'laki-laki': 'Laki-laki',
};

/**
 * Satu orang yang mendampingi anak. Satu anak boleh punya beberapa,
 * misalnya ibu dan ayah, atau ibu dan nenek.
 */
export interface Pendamping {
  panggilan: string;
  peran: PeranPendamping;
}

/** Batas jumlah pendamping per anak. Ditegakkan juga oleh CHECK di database. */
export const MAKS_PENDAMPING = 6;

/** Bentuk profil anak yang dipakai di seluruh aplikasi. */
export interface ProfilAnak {
  id: string;
  namaAnak: string;
  /** ISO 'YYYY-MM-DD'. Imutabel setelah dibuat. */
  tanggalLahir: string;
  jenisKelamin: JenisKelamin | null;
  /** Path objek di bucket privat "foto-anak", bukan URL siap pakai. */
  fotoPath: string | null;
  pendamping: Pendamping[];
  dibuatPada: string;
}

/** Isian wizard saat membuat anak baru. */
export interface DraftAnak {
  namaAnak: string;
  tanggalLahir: string;
  jenisKelamin: JenisKelamin | null;
  pendamping: Pendamping[];
  /** Belum diunggah saat wizard berjalan — diunggah setelah baris anak ada. */
  fileFoto: File | null;
}

/** Yang boleh diubah pengguna setelah anak dibuat. Tanggal lahir tidak ada. */
export interface PatchAnak {
  namaAnak?: string;
  jenisKelamin?: JenisKelamin | null;
  pendamping?: Pendamping[];
}

// ── Sapaan pendamping ────────────────────────────────────────────────────────

/**
 * Merangkai nama pendamping jadi satu sapaan.
 *   []                      → null
 *   [Bunda]                 → "Bunda"
 *   [Bunda, Ayah]           → "Bunda dan Ayah"
 *   [Bunda, Ayah, Uni]      → "Bunda, Ayah, dan Uni"
 * Memakai koma Oxford karena tanpa itu "Bunda, Ayah dan Uni" bisa terbaca
 * seolah Ayah dan Uni satu kesatuan.
 */
export function sapaanPendamping(daftar: Pendamping[]): string | null {
  const nama = daftar
    .map(p => p.panggilan.trim())
    .filter(Boolean);

  if (nama.length === 0) return null;
  if (nama.length === 1) return nama[0];
  if (nama.length === 2) return `${nama[0]} dan ${nama[1]}`;
  return `${nama.slice(0, -1).join(', ')}, dan ${nama[nama.length - 1]}`;
}

/** Sapaan cadangan saat belum ada pendamping terisi. */
export const SAPAAN_CADANGAN = 'Ayah atau Bunda';

export function pendampingKosong(): Pendamping {
  return { panggilan: '', peran: 'ibu' };
}

/** Sapaan turunan dari nama anak. Dipakai copy di seluruh konten. */
export interface SapaanSet {
  variant: JenisKelamin | 'netral';
  /** Huruf kecil, untuk di tengah kalimat. */
  low: string;
  /** Huruf besar, untuk awal kalimat. */
  cap: string;
}

// ── Turunan ──────────────────────────────────────────────────────────────────

export function usiaDalamBulan(tanggalLahir: string | null, sekarang = new Date()): number | null {
  if (!tanggalLahir) return null;
  const lahir = new Date(tanggalLahir);
  if (isNaN(lahir.getTime())) return null;

  let bulan =
    (sekarang.getFullYear() - lahir.getFullYear()) * 12 +
    (sekarang.getMonth() - lahir.getMonth());
  if (sekarang.getDate() < lahir.getDate()) bulan -= 1;
  return Math.max(0, bulan);
}

export function sapaanDari(profil: Pick<ProfilAnak, 'namaAnak' | 'jenisKelamin'> | null): SapaanSet {
  const nama = profil?.namaAnak?.trim();
  return {
    variant: profil?.jenisKelamin ?? 'netral',
    low: nama || 'si kecil',
    cap: nama || 'Si kecil',
  };
}

export function formatUsia(bulan: number | null): string {
  if (bulan === null) return 'Usia belum diketahui';
  if (bulan < 1) return 'Baru lahir';
  const tahun = Math.floor(bulan / 12);
  const sisa = bulan % 12;
  if (tahun === 0) return `${sisa} bulan`;
  if (sisa === 0) return `${tahun} tahun`;
  return `${tahun} tahun ${sisa} bulan`;
}

export function inisialAnak(nama: string): string {
  return nama.trim().charAt(0).toUpperCase() || '?';
}
