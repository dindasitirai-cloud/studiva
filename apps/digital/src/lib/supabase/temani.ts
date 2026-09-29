// Lapisan data konten Temani (migrasi 024).
// • Katalog tayang: temani_journey + temani_journey_hari (baca saja via RLS).
// • Draf/revisi: konten_draf jenis 'temani_journey' — memakai pipeline tinjauan yang sama
//   dengan Ajak Main / Wawasan / Kebiasaan Baik (penulis ≠ penyetuju ditegakkan DB).
// • Tulis ke katalog hanya lewat RPC terapkan_temani / atur_status_temani (admin).
import { supabase } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { KontenDraf } from './pipeline';

// Tabel Temani belum ada di Database types (generated) → klien untyped khusus modul ini.
const sb = supabase as unknown as SupabaseClient;

export const JENIS_TEMANI = 'temani_journey' as const;

/** Satu hari perjalanan — bentuk payload `konten_draf.isi.hari[]` (snake_case = kolom DB). */
export interface IsiHariTemani {
  hari: number;
  jenis: 'target' | 'perancah';
  kebiasaan_id: string;
  fokus_hari: string;
  script: string;
  kenapa_sederhana: string;
  kenapa_evidence: string;
  kenapa_sumber: string;
  yang_diamati: string;
}

/** Payload lengkap satu perjalanan (isi draf = baris katalog). */
export interface IsiTemani {
  slug: string;
  judul: string;
  deskripsi: string;
  nilai_terkait: string[];
  usia_min_bulan: number;
  usia_max_bulan: number;
  kebiasaan_utama: string;
  hari: IsiHariTemani[];
}

export interface JourneyKatalog extends IsiTemani {
  id: string;
  status: 'tayang' | 'diarsipkan';
  versi: number;
  diterbitkan_pada: string;
  diperbarui_pada: string;
}

export interface DrafTemani extends Omit<KontenDraf, 'isi'> {
  isi: IsiTemani;
}

export function hariKosong(n: number): IsiHariTemani {
  return {
    hari: n, jenis: 'perancah', kebiasaan_id: '', fokus_hari: '', script: '',
    kenapa_sederhana: '', kenapa_evidence: '', kenapa_sumber: '', yang_diamati: '',
  };
}

export function isiKosong(): IsiTemani {
  return {
    slug: '', judul: '', deskripsi: '', nilai_terkait: [], usia_min_bulan: 12, usia_max_bulan: 36,
    kebiasaan_utama: '', hari: [hariKosong(1)],
  };
}

/** Rapikan payload: trim teks, nomor hari 1..N berurutan. */
export function normalisasiIsi(isi: IsiTemani): IsiTemani {
  const t = (s: unknown) => (typeof s === 'string' ? s.trim() : '');
  return {
    slug: t(isi.slug).toLowerCase(),
    judul: t(isi.judul),
    deskripsi: t(isi.deskripsi),
    nilai_terkait: (isi.nilai_terkait ?? []).map(t).filter(Boolean),
    usia_min_bulan: Number(isi.usia_min_bulan),
    usia_max_bulan: Number(isi.usia_max_bulan),
    kebiasaan_utama: t(isi.kebiasaan_utama),
    hari: (isi.hari ?? []).map((h, i) => ({
      hari: i + 1,
      jenis: h.jenis === 'target' ? 'target' : 'perancah',
      kebiasaan_id: t(h.kebiasaan_id),
      fokus_hari: t(h.fokus_hari),
      script: t(h.script),
      kenapa_sederhana: t(h.kenapa_sederhana),
      kenapa_evidence: t(h.kenapa_evidence),
      kenapa_sumber: t(h.kenapa_sumber),
      yang_diamati: t(h.yang_diamati),
    })),
  };
}

function isiDariDraf(raw: unknown): IsiTemani {
  const o = (raw ?? {}) as Partial<IsiTemani>;
  return normalisasiIsi({ ...isiKosong(), ...o, hari: Array.isArray(o.hari) ? o.hari : [] } as IsiTemani);
}

/** Ambil hanya bagian isi (tanpa metadata katalog) — untuk revisi, ekspor, dan perbandingan. */
export function isiDariKatalog(j: JourneyKatalog): IsiTemani {
  return {
    slug: j.slug, judul: j.judul, deskripsi: j.deskripsi, nilai_terkait: [...j.nilai_terkait],
    usia_min_bulan: j.usia_min_bulan, usia_max_bulan: j.usia_max_bulan, kebiasaan_utama: j.kebiasaan_utama,
    hari: j.hari.map(h => ({ ...h })),
  };
}

// ── Katalog ──────────────────────────────────────────────────────────────────

/**
 * Muat katalog. Orang tua hanya menerima yang tayang (RLS); staf menerima semua.
 * Mengembalikan null bila belum login / tabel belum ada (→ pemanggil memakai seed).
 */
export async function muatKatalogTemani(opsi: { sertakanArsip?: boolean } = {}): Promise<JourneyKatalog[] | null> {
  try {
    let q = sb.from('temani_journey').select('*, temani_journey_hari(*)');
    if (!opsi.sertakanArsip) q = q.eq('status', 'tayang');
    const { data, error } = await q.order('diterbitkan_pada', { ascending: false });
    if (error) { console.warn('[temani] katalog belum tersedia:', error.message); return null; }
    return (data ?? []).map((r: any) => ({
      id: r.id,
      slug: r.slug,
      judul: r.judul,
      deskripsi: r.deskripsi ?? '',
      nilai_terkait: r.nilai_terkait ?? [],
      usia_min_bulan: r.usia_min_bulan,
      usia_max_bulan: r.usia_max_bulan,
      kebiasaan_utama: r.kebiasaan_utama ?? '',
      status: r.status,
      versi: r.versi,
      diterbitkan_pada: r.diterbitkan_pada,
      diperbarui_pada: r.diperbarui_pada,
      hari: ((r.temani_journey_hari ?? []) as any[])
        .sort((a, b) => a.hari - b.hari)
        .map(h => ({
          hari: h.hari,
          jenis: h.jenis === 'target' ? 'target' : 'perancah',
          kebiasaan_id: h.kebiasaan_id ?? '',
          fokus_hari: h.fokus_hari ?? '',
          script: h.script ?? '',
          kenapa_sederhana: h.kenapa_sederhana ?? '',
          kenapa_evidence: h.kenapa_evidence ?? '',
          kenapa_sumber: h.kenapa_sumber ?? '',
          yang_diamati: h.yang_diamati ?? '',
        })),
    }));
  } catch (e) {
    console.warn('[temani] gagal memuat katalog:', e);
    return null;
  }
}

// ── Draf ─────────────────────────────────────────────────────────────────────

export async function muatDrafTemani(): Promise<DrafTemani[]> {
  const { data, error } = await sb
    .from('konten_draf')
    .select('*')
    .eq('jenis', JENIS_TEMANI)
    .order('diperbarui_pada', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((d: any) => ({ ...d, isi: isiDariDraf(d.isi) })) as DrafTemani[];
}

export async function muatSatuDrafTemani(id: string): Promise<DrafTemani | null> {
  const { data, error } = await sb.from('konten_draf').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...(data as any), isi: isiDariDraf((data as any).isi) } as DrafTemani;
}

async function uidWajib(): Promise<string> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Sesi tidak ditemukan. Masuk lagi sebagai admin.');
  return user.id;
}

/**
 * Buat draf baru. `idSumber` = slug perjalanan tayang bila ini revisi.
 * `ajukan` = langsung masuk antrean tinjauan.
 */
export async function buatDrafTemani(isi: IsiTemani, opsi: { idSumber?: string | null; catatan?: string; ajukan?: boolean } = {}): Promise<DrafTemani> {
  const uid = await uidWajib();
  const bersih = normalisasiIsi(isi);
  const status = opsi.ajukan ? 'diajukan' : 'draf';
  const { data, error } = await sb
    .from('konten_draf')
    .insert({
      jenis: JENIS_TEMANI,
      judul: bersih.judul,
      isi: bersih,
      id_konten_sumber: opsi.idSumber ?? null,
      catatan_penulis: opsi.catatan?.trim() || null,
      id_penulis: uid,
      status,
    })
    .select('*')
    .single();
  if (error) throw error;
  if (opsi.ajukan) {
    await sb.from('riwayat_tinjauan').insert({ id_draf: (data as any).id, id_pelaku: uid, tindakan: 'diajukan' });
  }
  return { ...(data as any), isi: bersih } as DrafTemani;
}

/**
 * Perbarui draf milik sendiri (RLS: status draf/diajukan). Menyimpan tanpa `ajukan`
 * menarik draf kembali dari antrean agar peninjau tidak membaca versi setengah jadi.
 */
export async function perbaruiDrafTemani(id: string, isi: IsiTemani, opsi: { catatan?: string; ajukan?: boolean } = {}): Promise<void> {
  const uid = await uidWajib();
  const bersih = normalisasiIsi(isi);
  const { error } = await sb
    .from('konten_draf')
    .update({
      judul: bersih.judul,
      isi: bersih,
      catatan_penulis: opsi.catatan?.trim() || null,
      status: opsi.ajukan ? 'diajukan' : 'draf',
    })
    .eq('id', id)
    .eq('id_penulis', uid);
  if (error) throw error;
  if (opsi.ajukan) {
    await sb.from('riwayat_tinjauan').insert({ id_draf: id, id_pelaku: uid, tindakan: 'diajukan' });
  }
}

export async function ajukanDrafTemani(id: string): Promise<void> {
  const uid = await uidWajib();
  const { error } = await sb.from('konten_draf').update({ status: 'diajukan' }).eq('id', id).eq('id_penulis', uid);
  if (error) throw error;
  await sb.from('riwayat_tinjauan').insert({ id_draf: id, id_pelaku: uid, tindakan: 'diajukan' });
}

/** Hapus permanen draf (RLS 024: milik sendiri, status draf/ditolak). */
export async function hapusDrafTemani(id: string): Promise<void> {
  const { error, count } = await sb.from('konten_draf').delete({ count: 'exact' }).eq('id', id);
  if (error) throw error;
  if (count === 0) throw new Error('Draf tidak bisa dihapus. Hanya draf milik sendiri yang belum diajukan atau yang ditolak.');
}

// ── Katalog: terapkan & arsip ────────────────────────────────────────────────

export async function terapkanTemani(idDraf: string): Promise<void> {
  const { error } = await sb.rpc('terapkan_temani', { p_id_draf: idDraf });
  if (error) throw new Error(error.message);
}

export async function aturStatusTemani(slug: string, status: 'tayang' | 'diarsipkan'): Promise<void> {
  const { error } = await sb.rpc('atur_status_temani', { p_slug: slug, p_status: status });
  if (error) throw new Error(error.message);
}
