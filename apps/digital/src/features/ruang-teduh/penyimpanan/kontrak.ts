import type { CatatanHarianIbu, CaregiverProfile } from '../types';

/**
 * Kontrak penyimpanan catatan harian ibu.
 *
 * PERINGATAN ISI DATA:
 * Catatan harian ibu berisi data kesehatan, yaitu suasana hati masa nifas,
 * tanda fisik masa nifas, asupan, dan konsumsi suplemen. Dalam UU 27/2022
 * data kesehatan termasuk data pribadi yang bersifat spesifik.
 *
 * Data ini HANYA boleh dipakai untuk menampilkan kembali kepada ibu yang
 * mencatatnya. DILARANG dipakai untuk personalisasi rekomendasi barang,
 * penentuan kapan menampilkan tautan belanja, penargetan, profiling,
 * atau analitik yang bisa ditelusuri ke individu.
 *
 * Larangan ini bukan preferensi gaya. Jangan dilonggarkan tanpa keputusan
 * tertulis Raisha.
 */
export interface CatatanHarianRepository {
  /**
   * Ambil catatan dalam rentang tanggal inklusif, terurut naik menurut tanggal.
   * Tanggal berformat YYYY-MM-DD.
   * Hari tanpa catatan TIDAK dikembalikan sebagai entri kosong, melainkan
   * tidak ada sama sekali. Ini penting untuk logika cermin pola.
   */
  ambilRentang(
    caregiverId: string,
    dariTanggal: string,
    sampaiTanggal: string,
  ): Promise<CatatanHarianIbu[]>;

  /**
   * Simpan diff satu hari. Field yang ada di diff menimpa nilai lama,
   * field yang tidak ada dibiarkan apa adanya.
   * Mengirim field bernilai undefined TIDAK menghapus nilai lama.
   * Untuk mengosongkan sebuah field, kirim nilai kosong yang eksplisit,
   * misalnya array kosong untuk kondisiNifas.
   */
  simpanDiff(caregiverId: string, diff: CatatanHarianIbu): Promise<void>;

  /**
   * Hapus seluruh catatan milik satu caregiver.
   * Hapus berarti benar benar hilang, bukan ditandai tidak aktif.
   * Metode ini wajib ada sejak awal walau UI-nya belum dibuat.
   */
  hapusSemua(caregiverId: string): Promise<void>;
}

export interface CaregiverRepository {
  ambil(caregiverId: string): Promise<CaregiverProfile | null>;
  simpan(profil: CaregiverProfile): Promise<void>;
}
