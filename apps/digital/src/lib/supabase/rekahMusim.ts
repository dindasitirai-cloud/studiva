// ============================================================================
// Lapisan akses data untuk musim Rekah — pasangan dari migrasi 011.
//
// Dipisah dari rekah.ts (profil anak, nilai ditanam, kebun) karena beda
// domain, mengikuti pola langganan.ts dan pipeline.ts.
//
// SEMUA fungsi di sini butuh idAnak. Itu disengaja: tidak ada satu pun data
// musim yang dimiliki "orang tua" — semuanya milik seorang anak. Kalau sebuah
// pemanggil tidak punya idAnak, itu tanda layarnya belum melewati gerbang
// pemilihan anak, bukan tanda fungsi ini perlu argumen opsional.
//
// RLS database yang memastikan idAnak memang milik pemanggil. Jangan menambah
// pengecekan kepemilikan di sini — itu duplikasi yang bisa berbeda isi.
// ============================================================================

import { supabase } from './client';
import type { Database, Json } from './database.types';

type MusimRow = Database['public']['Tables']['rekah_musim']['Row'];
type LangkahRow = Database['public']['Tables']['rekah_langkah_selesai']['Row'];
type RefleksiRow = Database['public']['Tables']['rekah_refleksi']['Row'];
type JurnalRow = Database['public']['Tables']['rekah_jurnal']['Row'];

/** Kode PostgREST untuk "nol baris padahal diminta satu". Bukan error. */
const TIDAK_ADA_BARIS = 'PGRST116';

// ── Musim ────────────────────────────────────────────────────────────────────

/** Musim yang sedang berjalan. null berarti anak ini belum mulai musim mana pun. */
export async function getMusimBerjalan(idAnak: string): Promise<MusimRow | null> {
  const { data, error } = await supabase
    .from('rekah_musim')
    .select('*')
    .eq('id_anak', idAnak)
    .is('selesai', null)
    .maybeSingle();

  if (error && error.code !== TIDAK_ADA_BARIS) throw error;
  return data ?? null;
}

/** Musim yang sudah ditutup, terbaru dulu. Untuk halaman Jejak Mekar. */
export async function getRiwayatMusim(idAnak: string): Promise<MusimRow[]> {
  const { data, error } = await supabase
    .from('rekah_musim')
    .select('*')
    .eq('id_anak', idAnak)
    .not('selesai', 'is', null)
    .order('musim_ke', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Memulai musim pertama. Gagal (unique violation) bila anak sudah punya musim
 * berjalan — itu memang yang kita mau: dua musim berjalan adalah keadaan rusak.
 */
export async function mulaiMusimPertama(
  idAnak: string,
  nilaiFokus: string[],
): Promise<MusimRow> {
  const { data, error } = await supabase
    .from('rekah_musim')
    .insert({ id_anak: idAnak, musim_ke: 1, minggu_ke: 1, nilai_fokus: nilaiFokus })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Ganti pekan dan/atau nilai fokus pada musim berjalan. */
export async function perbaruiMusimBerjalan(
  idMusim: string,
  patch: { mingguKe?: number; nilaiFokus?: string[] },
): Promise<void> {
  const { error } = await supabase
    .from('rekah_musim')
    .update({
      ...(patch.mingguKe !== undefined ? { minggu_ke: patch.mingguKe } : {}),
      ...(patch.nilaiFokus !== undefined ? { nilai_fokus: patch.nilaiFokus } : {}),
    })
    .eq('id', idMusim);

  if (error) throw error;
}

/**
 * Menutup musim berjalan lalu membuka musim berikutnya.
 *
 * Di Express ini tersebar: POST /seasons/close menyisipkan arsip, lalu PUT
 * /profile menimpa musim_ke, dan perubahan nilaiFokus memicu penyalinan baris
 * ketiga. Tiga tulisan yang bisa gagal sebagian dan meninggalkan musim hantu.
 *
 * Di sini dua tulisan, dan yang kedua dilindungi partial unique index: kalau
 * musim baru gagal dibuat, musim lama sudah tertutup dan pemanggil bisa
 * mengulang tanpa menghasilkan duplikat.
 *
 * CATATAN: idealnya ini satu RPC transaksional di Postgres. Belum dibuat
 * karena butuh keputusan tentang penanganan galat di sisi UI — lihat
 * catatan di REKAH_MIGRASI_SUPABASE.md.
 */
export async function tutupMusim(params: {
  idAnak: string;
  idMusim: string;
  totalLangkah: number;
  refleksiMusim?: unknown;
  nilaiFokusBaru: string[];
  musimKeBaru: number;
}): Promise<MusimRow> {
  const hariIni = new Date().toISOString().split('T')[0];

  const { error: errTutup } = await supabase
    .from('rekah_musim')
    .update({
      selesai: hariIni,
      total_langkah: params.totalLangkah,
      refleksi_musim: (params.refleksiMusim ?? null) as Json | null,
    })
    .eq('id', params.idMusim);

  if (errTutup) throw errTutup;

  const { data, error: errBaru } = await supabase
    .from('rekah_musim')
    .insert({
      id_anak: params.idAnak,
      musim_ke: params.musimKeBaru,
      minggu_ke: 1,
      nilai_fokus: params.nilaiFokusBaru,
      mulai: hariIni,
    })
    .select()
    .single();

  if (errBaru) throw errBaru;
  return data;
}

// ── Langkah selesai ──────────────────────────────────────────────────────────

export async function getLangkahSelesai(
  idAnak: string,
  musimKe: number,
  mingguKe: number,
): Promise<LangkahRow[]> {
  const { data, error } = await supabase
    .from('rekah_langkah_selesai')
    .select('*')
    .eq('id_anak', idAnak)
    .eq('musim_ke', musimKe)
    .eq('minggu_ke', mingguKe)
    .order('selesai_pada');

  if (error) throw error;
  return data ?? [];
}

/** Total langkah selesai sepanjang satu musim. Dipakai saat menutup musim. */
export async function hitungLangkahMusim(idAnak: string, musimKe: number): Promise<number> {
  const { count, error } = await supabase
    .from('rekah_langkah_selesai')
    .select('*', { count: 'exact', head: true })
    .eq('id_anak', idAnak)
    .eq('musim_ke', musimKe);

  if (error) throw error;
  return count ?? 0;
}

/**
 * Menandai satu langkah selesai. Aman dipanggil dua kali — UNIQUE di database
 * yang menyaring, jadi klien tidak perlu mengecek duluan (yang selalu balapan).
 */
export async function tandaiLangkahSelesai(params: {
  idAnak: string;
  idModul: string;
  musimKe: number;
  mingguKe: number;
}): Promise<void> {
  const { error } = await supabase
    .from('rekah_langkah_selesai')
    .upsert(
      {
        id_anak: params.idAnak,
        id_modul: params.idModul,
        musim_ke: params.musimKe,
        minggu_ke: params.mingguKe,
      },
      { onConflict: 'id_anak,id_modul,minggu_ke,musim_ke', ignoreDuplicates: true },
    );

  if (error) throw error;
}

// ── Refleksi (CeritaHariIni) ─────────────────────────────────────────────────

export async function getRefleksi(idAnak: string, musimKe: number): Promise<RefleksiRow[]> {
  const { data, error } = await supabase
    .from('rekah_refleksi')
    .select('*')
    .eq('id_anak', idAnak)
    .eq('musim_ke', musimKe)
    .order('dibuat_pada');

  if (error) throw error;
  return data ?? [];
}

/**
 * Menyimpan satu refleksi. Idempotensi dari UNIQUE (id_anak, id_modul, tanggal),
 * bukan dari id buatan klien seperti di Express — jadi menekan simpan dua kali
 * dari dua tab pun tidak menggandakan.
 */
export async function simpanRefleksi(params: {
  idAnak: string;
  idModul: string;
  tanggal: string;
  responAnak: 'seru' | 'menantang' | 'belum-tertarik';
  moodPendamping?: 'lega' | 'biasa' | 'lelah' | null;
  catatan?: string | null;
  nilaiUtama?: string | null;
  simpanKeJurnal?: boolean;
  musimKe: number;
}): Promise<void> {
  const { error } = await supabase
    .from('rekah_refleksi')
    .upsert(
      {
        id_anak: params.idAnak,
        id_modul: params.idModul,
        tanggal: params.tanggal,
        respon_anak: params.responAnak,
        mood_pendamping: params.moodPendamping ?? null,
        catatan: params.catatan ?? null,
        nilai_utama: params.nilaiUtama ?? null,
        simpan_ke_jurnal: params.simpanKeJurnal ?? false,
        musim_ke: params.musimKe,
      },
      { onConflict: 'id_anak,id_modul,tanggal', ignoreDuplicates: true },
    );

  if (error) throw error;
}

// ── Jurnal ───────────────────────────────────────────────────────────────────

export async function getJurnal(idAnak: string): Promise<JurnalRow[]> {
  const { data, error } = await supabase
    .from('rekah_jurnal')
    .select('*')
    .eq('id_anak', idAnak)
    .order('dibuat_pada', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function tambahJurnal(params: {
  idAnak: string;
  judul: string;
  catatan: string;
  tanggal?: string;
  idNilai?: string | null;
  tag?: 'refleksi' | 'penutup-musim' | 'manual';
}): Promise<JurnalRow> {
  const { data, error } = await supabase
    .from('rekah_jurnal')
    .insert({
      id_anak: params.idAnak,
      judul: params.judul,
      catatan: params.catatan,
      tanggal: params.tanggal,
      id_nilai: params.idNilai ?? null,
      tag: params.tag ?? 'manual',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function hapusJurnal(idEntri: string): Promise<void> {
  const { error } = await supabase.from('rekah_jurnal').delete().eq('id', idEntri);
  if (error) throw error;
}

// ── Rencana pekan ────────────────────────────────────────────────────────────

export async function getRencanaPekan(
  idAnak: string,
  musimKe: number,
  mingguKe: number,
): Promise<string[] | null> {
  const { data, error } = await supabase
    .from('rekah_rencana_pekan')
    .select('id_modul')
    .eq('id_anak', idAnak)
    .eq('musim_ke', musimKe)
    .eq('minggu_ke', mingguKe)
    .maybeSingle();

  if (error && error.code !== TIDAK_ADA_BARIS) throw error;
  return data?.id_modul ?? null;
}

/** Batas 7 langkah dijaga CHECK di database, bukan di sini. */
export async function simpanRencanaPekan(params: {
  idAnak: string;
  musimKe: number;
  mingguKe: number;
  idModul: string[];
}): Promise<void> {
  const { error } = await supabase
    .from('rekah_rencana_pekan')
    .upsert(
      {
        id_anak: params.idAnak,
        musim_ke: params.musimKe,
        minggu_ke: params.mingguKe,
        id_modul: params.idModul,
      },
      { onConflict: 'id_anak,musim_ke,minggu_ke' },
    );

  if (error) throw error;
}

// ── Hapus semua data musim satu anak ─────────────────────────────────────────
// Padanan DELETE /rekah/account-data. Tidak diperlukan untuk penghapusan akun
// biasa — ON DELETE CASCADE dari anak sudah menanganinya. Ini untuk "mulai
// ulang dari nol" tanpa menghapus profil anaknya.

export async function hapusDataMusim(idAnak: string): Promise<void> {
  const tabel = [
    'rekah_langkah_selesai',
    'rekah_refleksi',
    'rekah_jurnal',
    'rekah_rencana_pekan',
    'rekah_musim',
  ] as const;

  for (const t of tabel) {
    const { error } = await supabase.from(t).delete().eq('id_anak', idAnak);
    if (error) throw error;
  }
}
