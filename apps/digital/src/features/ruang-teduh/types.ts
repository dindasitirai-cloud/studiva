export type PeranCaregiver = 'ibu' | 'ayah' | 'lainnya';

export interface CaregiverProfile {
  id: string;
  peran: PeranCaregiver;
  anakIds: string[];
  /** basis Lembar Nifas 42 hari, diisi di rilis berikutnya */
  tanggalMelahirkan?: string;
}

export type SubTahapRuangTeduh = 'menyusui-eksklusif' | 'mpasi-berlanjut';

export type KelompokGiziId =
  | 'makanan-pokok'
  | 'protein-hewani'
  | 'protein-nabati'
  | 'sayur'
  | 'buah'
  | 'minyak-lemak'
  | 'gula';

export interface KelompokGizi {
  id: KelompokGiziId;
  nama: string;
  porsiHarian: number;
  padananRumahTangga: string;
  sumberHalamanKIA: number;
}

export interface SuplemenHarian {
  id: string;
  nama: string;
  keterangan: string;
  sumberHalamanKIA?: number;
  /** true jika butuh persetujuan Apoteker sebelum tayang */
  perluReviewApoteker: boolean;
}

export type TierBarang = 'perlu' | 'membantu' | 'tidak-wajib';

export type KategoriChecklist =
  | 'kesiapan-keluarga'
  | 'pakaian'
  | 'tidur-aman'
  | 'menyusui'
  | 'kebersihan'
  | 'kesehatan'
  | 'transportasi';

export interface KriteriaPilih {
  teks: string;
  jenis: 'cari' | 'hindari';
}

export interface ItemChecklist {
  id: string;
  label: string;
  kategori: KategoriChecklist;
  /** hanya untuk barang, kosong untuk kesiapan-keluarga */
  tier?: TierBarang;
  catatan?: string;
  sumberHalamanKIA?: number;
  panduanMemilih?: KriteriaPilih[];
  rujukanPanduan?: string;
  /** kosong berarti sengaja tidak ditautkan */
  tautanBelanja?: string;
  /** wajib diisi kalau ada panduanMemilih tapi tautanBelanja kosong */
  alasanTanpaTautan?: string;
}

// ─── Cuaca Hati dan Lembar Nifas ─────────────────────────────────────────────

export type CuacaHati = 'cerah' | 'berawan' | 'mendung' | 'hujan' | 'badai';

export type TingkatKondisi = 'bahaya' | 'dicatat';

export interface KondisiNifas {
  id: string;
  label: string;
  tingkat: TingkatKondisi;
  sumberHalamanKIA: string;
}

/**
 * Catatan harian ibu. Mengikuti pola PilihanHarian di Irama Hari:
 * yang disimpan adalah diff per tanggal, bukan hasil akhir yang terakumulasi.
 */
export interface CatatanHarianIbu {
  tanggal: string;
  cuacaHati?: CuacaHati;
  kondisiNifas?: string[];
  porsi?: Partial<Record<KelompokGiziId, number>>;
  gelasAir?: number;
  suplemen?: Record<string, boolean>;
}

export interface RingkasNifas {
  /** hari ke berapa sejak melahirkan, 1 sampai 42 */
  hariKe: number;
  /** true jika masih dalam 42 hari */
  dalamMasaNifas: boolean;
}
