/**
 * Implementasi CatatanHarianRepository di atas Supabase.
 *
 * ⚠️  DATA KESEHATAN. Baca kepala penyimpanan/kontrak.ts dan migrasi 013
 * sebelum menyentuh berkas ini.
 *
 * Data di sini HANYA untuk ditampilkan kembali kepada ibu yang mencatatnya.
 * Dilarang dipakai untuk personalisasi rekomendasi, penentuan kapan tautan
 * belanja muncul, penargetan, profiling, atau analitik per individu.
 * Jangan menambahkan fungsi agregat atau ekspor di berkas ini.
 *
 * caregiverId di sini adalah id ANAK.
 *
 * Migrasi 013 sempat memakai id orang tua, dengan alasan "catatan nifas milik
 * ibu". Alasan itu terbalik: nifas adalah peristiwa per-KELAHIRAN, jadi ibu
 * yang melahirkan dua kali memang punya dua catatan terpisah. Kunci per orang
 * tua membuat data satu anak muncul di layar anak lain. Dikoreksi di 014.
 *
 * Nama parameter tetap `caregiverId` karena itu yang dipakai kontraknya —
 * kontrak tidak peduli entitas mana yang jadi kuncinya, hanya bahwa satu
 * caregiver punya satu rangkaian catatan harian.
 */

import { supabase } from '../../../lib/supabase/client';
import type { Database } from '../../../lib/supabase/database.types';
import type { CatatanHarianIbu, CuacaHati, KelompokGiziId } from '../types';
import type { CatatanHarianRepository } from './kontrak';

/** Payload perubahan parsial — hanya field yang benar-benar hadir di diff. */
type PerubahanCatatan = Database['public']['Tables']['catatan_harian_ibu']['Update'];

interface BarisCatatan {
  tanggal: string;
  cuaca_hati: CuacaHati | null;
  kondisi_nifas: string[] | null;
  porsi: Partial<Record<KelompokGiziId, number>> | null;
  gelas_air: number | null;
  suplemen: Record<string, boolean> | null;
}

/**
 * Baris database → bentuk domain.
 *
 * Kolom yang kosong dihilangkan, bukan dikembalikan sebagai nilai kosong.
 * Kontraknya membedakan "tidak dicatat" dari "dicatat bernilai kosong" —
 * Cermin Pola bergantung pada perbedaan itu untuk tidak menghitung hari yang
 * ibu memang tidak membuka aplikasi.
 */
function keDomain(baris: BarisCatatan): CatatanHarianIbu {
  const hasil: CatatanHarianIbu = { tanggal: baris.tanggal };

  if (baris.cuaca_hati !== null) hasil.cuacaHati = baris.cuaca_hati;
  if (baris.kondisi_nifas !== null) hasil.kondisiNifas = baris.kondisi_nifas;
  if (baris.porsi !== null && Object.keys(baris.porsi).length > 0) hasil.porsi = baris.porsi;
  if (baris.gelas_air !== null) hasil.gelasAir = baris.gelas_air;
  if (baris.suplemen !== null && Object.keys(baris.suplemen).length > 0) {
    hasil.suplemen = baris.suplemen;
  }

  return hasil;
}

const KOLOM = 'tanggal, cuaca_hati, kondisi_nifas, porsi, gelas_air, suplemen';

export class CatatanHarianSupabase implements CatatanHarianRepository {
  async ambilRentang(
    caregiverId: string,
    dariTanggal: string,
    sampaiTanggal: string,
  ): Promise<CatatanHarianIbu[]> {
    const { data, error } = await supabase
      .from('catatan_harian_ibu')
      .select(KOLOM)
      .eq('id_anak', caregiverId)
      .gte('tanggal', dariTanggal)
      .lte('tanggal', sampaiTanggal)
      .order('tanggal');

    if (error) throw error;
    return ((data ?? []) as unknown as BarisCatatan[]).map(keDomain);
  }

  /**
   * Semantik diff sesuai kontrak, diuji oleh dalamMemori.test.ts:
   *   - field bernilai undefined TIDAK menghapus nilai lama
   *   - nilai kosong eksplisit (mis. larik kosong) MENGOSONGKAN
   *
   * Karena itu payload disusun hanya dari field yang benar-benar hadir, lalu
   * dikirim sebagai UPDATE parsial. Mengirim seluruh objek akan menulis NULL
   * ke field yang tidak disebut — persis yang dilarang kontrak.
   */
  async simpanDiff(caregiverId: string, diff: CatatanHarianIbu): Promise<void> {
    const perubahan: PerubahanCatatan = {};
    if (diff.cuacaHati !== undefined) perubahan.cuaca_hati = diff.cuacaHati;
    if (diff.kondisiNifas !== undefined) perubahan.kondisi_nifas = diff.kondisiNifas;
    if (diff.porsi !== undefined) perubahan.porsi = diff.porsi as Record<string, number>;
    if (diff.gelasAir !== undefined) perubahan.gelas_air = diff.gelasAir;
    if (diff.suplemen !== undefined) perubahan.suplemen = diff.suplemen;

    // Diff kosong: tidak ada yang berubah, dan jangan sampai membuat baris
    // kosong — hari tanpa catatan harus benar-benar tidak ada barisnya.
    if (Object.keys(perubahan).length === 0) return;

    const { data, error } = await supabase
      .from('catatan_harian_ibu')
      .update(perubahan)
      .eq('id_anak', caregiverId)
      .eq('tanggal', diff.tanggal)
      .select('id');

    if (error) throw error;
    if (data && data.length > 0) return;

    // Belum ada baris untuk tanggal itu.
    const { error: errSisip } = await supabase
      .from('catatan_harian_ibu')
      .insert({ id_anak: caregiverId, tanggal: diff.tanggal, ...perubahan });

    if (!errSisip) return;

    // 23505: tab lain menyisipkan di antara UPDATE dan INSERT. Barisnya kini
    // ada, jadi ulangi UPDATE-nya — bukan menimpa dengan payload penuh.
    if ((errSisip as { code?: string }).code === '23505') {
      const { error: errUlang } = await supabase
        .from('catatan_harian_ibu')
        .update(perubahan)
        .eq('id_anak', caregiverId)
        .eq('tanggal', diff.tanggal);
      if (errUlang) throw errUlang;
      return;
    }

    throw errSisip;
  }

  /** Hapus berarti benar-benar hilang, bukan ditandai tidak aktif. */
  async hapusSemua(caregiverId: string): Promise<void> {
    const { error } = await supabase
      .from('catatan_harian_ibu')
      .delete()
      .eq('id_anak', caregiverId);

    if (error) throw error;
  }
}

// ── Checklist "Menyambut Si Kecil" ───────────────────────────────────────────
// BUKAN data kesehatan — hanya daftar persiapan kelahiran. Sengaja ditaruh di
// tabel dan fungsi terpisah supaya batas antara keduanya tetap terlihat jelas.

export interface CentangPersiapan {
  kesiapan: Record<string, boolean>;
  barang: Record<string, boolean>;
}

export async function ambilCentangPersiapan(idAnak: string): Promise<CentangPersiapan> {
  const { data, error } = await supabase
    .from('centang_persiapan')
    .select('kesiapan, barang')
    .eq('id_anak', idAnak)
    .maybeSingle();

  if (error) throw error;
  return {
    kesiapan: (data?.kesiapan as Record<string, boolean>) ?? {},
    barang: (data?.barang as Record<string, boolean>) ?? {},
  };
}

export async function simpanCentangPersiapan(
  idAnak: string,
  centang: CentangPersiapan,
): Promise<void> {
  // Upsert aman di sini: tabelnya hanya punya kedua kolom itu, jadi tidak ada
  // kolom lain yang bisa tersapu.
  const { error } = await supabase
    .from('centang_persiapan')
    .upsert(
      { id_anak: idAnak, kesiapan: centang.kesiapan, barang: centang.barang },
      { onConflict: 'id_anak' },
    );

  if (error) throw error;
}
