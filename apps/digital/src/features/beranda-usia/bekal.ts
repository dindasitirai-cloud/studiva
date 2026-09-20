import type { DomainKey } from '../../data/learningStrategies';
import type { DomainCode } from '@studiva/shared';
import type { NilaiAkar } from '../akar-keluarga/content';

/** Enam Bekal, satu per rentang usia satu tahun. */
export type BekalId = '0-1' | '1-2' | '2-3' | '3-4' | '4-5' | '5-6';

/**
 * Id sub-tahap = id band asli dari AGE_RANGES di learningStrategies.ts.
 * Nilai yang valid: 'b03' | 'b36' | 'b69' | 'b912' | 't1218' | 't1824'
 *                  | 'u23' | 'u34' | 'u45' | 'u56'
 * Tipe string (bukan union) agar bekalRegistry.ts tidak perlu bergantung
 * pada AGE_RANGES hanya untuk tipe — validasi ada di registry itu sendiri.
 */
export type SubTahapId = string;

/**
 * Siapa yang mengerjakan item ini. Menentukan apakah item dihitung
 * sebagai beban hari anak atau tugas baca orang tua.
 */
export type Pemilik = 'anak' | 'orangtua';

export type TipeItem = 'aktivitas' | 'alatEdukasi' | 'unduhan' | 'panduan';

/** Item yang bisa dijadwalkan ke dalam Irama Hari. */
export interface ItemBekal {
  id: string;
  /** Boleh mengandung token {anak} / {Anak}, diproses oleh renderRichText. */
  judul: string;
  tipe: TipeItem;
  /**
   * kegiatan (Learning Strategies) memakai DomainKey ('mk','mh','bhs','kog','sos','sen').
   * panduan (Panduan Tumbuh Kembang) memakai DomainCode ('FM','KG','BH','SE','KS','PS').
   * Dua sistem domain yang berbeda — jangan dikonversi satu sama lain.
   */
  domain: DomainKey | DomainCode;
  /** Semua domain kegiatan (Learning Strategies bisa multi-domain). Diisi hanya untuk tipe 'aktivitas'; dipakai pencocokan pengamatan Kompas Perkembangan. */
  domainSemua?: DomainKey[];
  nilai: NilaiAkar[];
  /** true = item sudah ditinjau dan memang tidak mengangkat tema nilai tertentu. */
  tanpaTemaNilai?: boolean;
  /** Undefined untuk alatEdukasi dan unduhan — durasi tidak berlaku untuk benda dan berkas. */
  perkiraanDurasiMenit?: number;
  pemilik: Pemilik;
  /**
   * Lacak balik ke modul asal. Wajib — dipakai panel review Psikolog Fitri
   * untuk menampilkan hasil rakitan beserta asal-usulnya.
   */
  sumberId: string;
  /** Id sub tahap asal item ini ('b03' | 'b36' | 'b69' | 'b912' | …). Diisi saat kolam diperluas lintas sub tahap. */
  subTahapId?: string;
  /** true = item ditulis sendiri oleh caregiver (bukan dari kolam Bekal). */
  kustom?: boolean;
  /** Kategori item kustom untuk label di susunan hari. */
  kategoriKustom?: 'momen' | 'kegiatan' | 'rencana';
  /** Keterangan kapan (mis. 'Pagi', 'Saat makan') untuk item kustom. */
  keteranganKapan?: string;
  /** Deskripsi tambahan item kustom (opsional). */
  deskripsiKustom?: string;
}

export interface SubTahap {
  id: SubTahapId;
  /** Label tampil, contoh: '6–9 bln'. Pakai en dash (–), bukan hyphen. */
  label: string;
  /** Batas bawah, INKLUSIF. */
  usiaBulanMulai: number;
  /** Batas atas, EKSKLUSIF. */
  usiaBulanSelesai: number;
  /** Plafon jumlah item terjadwal per hari untuk sub-tahap ini. */
  maksItemPerHari: number;
  kegiatan: ItemBekal[];
  panduan: ItemBekal[];
}

export interface Bekal {
  id: BekalId;
  /** Contoh: 'Bekal 0–1 tahun'. */
  label: string;
  usiaBulanMulai: number;
  usiaBulanSelesai: number;
  /**
   * Selalu terisi. Panjang 4 untuk '0-1', 2 untuk '1-2', 1 untuk sisanya.
   * Saat subTahap.length === 1, lapisan ini tetap ada di data dan
   * hanya disembunyikan di UI.
   */
  subTahap: SubTahap[];
  /** false = konten belum siap, UI menampilkan layar placeholder hangat. */
  aktif: boolean;
}
