// Lapisan data Kebiasaan Baik + kegiatan template Irama Hari (migrasi 026).
// • kebiasaan_baik: katalog tayang (baca saja); ubah lewat draf pipeline jenis 'kebiasaan_baik'.
// • irama_template: kerangka kegiatan harian; admin menyimpan langsung (tanpa tinjauan).
import { supabase } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { KontenDraf } from './pipeline';
import { NILAI } from '../../features/akar-keluarga/content';
import type { NilaiAkar } from '../../features/akar-keluarga/content';
import type {
  KebiasaanKatalog, KategoriKebiasaan, TemplateIrama, SaranTemplate, Waktu,
} from '../../features/irama-hari/kebiasaanSeed';
import { USIA_MAKS, IKON_TEMPLATE } from '../../features/irama-hari/kebiasaanSeed';
import type { IkonKey } from '../../features/irama-hari/susunanDefault';

const sb = supabase as unknown as SupabaseClient;

export const JENIS_KEBIASAAN = 'kebiasaan_baik' as const;

/** Isi draf = satu baris katalog (tanpa status/versi). */
export type IsiKebiasaan = Omit<KebiasaanKatalog, 'status'>;

export interface KebiasaanTayang extends KebiasaanKatalog { versi: number; diterbitkan_pada: string }

export interface DrafKebiasaan extends Omit<KontenDraf, 'isi'> { isi: IsiKebiasaan }

export function isiKebiasaanKosong(kategori: KategoriKebiasaan = 'rutin', template_key: string | null = null): IsiKebiasaan {
  return {
    id: '', judul: '', deskripsi: '', nilai: [], usia_min_bulan: 0, usia_max_bulan: USIA_MAKS,
    kategori, template_key: kategori === 'rutin' ? template_key : null, kapan: kategori === 'situasional' ? '' : null, urutan: 100,
    sumber: '',
  };
}

const bulat = (v: unknown, d: number) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : d);
const jepit = (v: number) => Math.min(USIA_MAKS, Math.max(0, v));

export function normalisasiKebiasaan(isi: Partial<IsiKebiasaan>): IsiKebiasaan {
  const t = (s: unknown) => (typeof s === 'string' ? s.trim() : '');
  const kategori: KategoriKebiasaan = isi.kategori === 'situasional' ? 'situasional' : 'rutin';
  const nilai = (Array.isArray(isi.nilai) ? isi.nilai : [])
    .map(n => t(n))
    .filter((n, i, a): n is NilaiAkar => (NILAI as readonly string[]).includes(n) && a.indexOf(n) === i)
    .slice(0, 3);
  let min = jepit(bulat(isi.usia_min_bulan, 0));
  let max = jepit(bulat(isi.usia_max_bulan, USIA_MAKS));
  if (min > max) [min, max] = [max, min];
  return {
    id: t(isi.id).toLowerCase(),
    judul: t(isi.judul),
    deskripsi: t(isi.deskripsi),
    nilai,
    usia_min_bulan: min,
    usia_max_bulan: max,
    kategori,
    template_key: kategori === 'rutin' ? (t(isi.template_key) || null) : null,
    kapan: kategori === 'situasional' ? t(isi.kapan) : null,
    urutan: bulat(isi.urutan, 100),
    sumber: t(isi.sumber),
  };
}

export function isiDariKebiasaan(k: KebiasaanKatalog): IsiKebiasaan {
  const { status: _s, ...isi } = k;
  return normalisasiKebiasaan(isi);
}

export function normalisasiTemplate(r: Partial<TemplateIrama>): TemplateIrama {
  const t = (s: unknown) => (typeof s === 'string' ? s.trim() : '');
  const waktu: Waktu = r.waktu === 'siang' || r.waktu === 'malam' ? r.waktu : 'pagi';
  const ikon = (IKON_TEMPLATE.map(i => i.key) as readonly string[]).includes(t(r.ikon)) ? (t(r.ikon) as IkonKey) : 'main';
  const saran: SaranTemplate[] = (Array.isArray(r.saran) ? r.saran : [])
    .map(s => ({ id: t(s?.id), tipe: (s?.tipe === 'buku' ? 'buku' : 'main') as 'main' | 'buku', t: t(s?.t) }))
    .filter(s => s.id && s.t);
  return {
    key: t(r.key).toLowerCase(), waktu, nama: t(r.nama), jam: /^[0-2]\d:[0-5]\d$/.test(t(r.jam)) ? t(r.jam) : '',
    ikon, urutan: bulat(r.urutan, 100), aktif: r.aktif !== false, saran,
  };
}

// ─── Katalog ─────────────────────────────────────────────────────────────────

export async function muatKatalogKebiasaan(opsi: { sertakanArsip?: boolean } = {}): Promise<KebiasaanTayang[] | null> {
  try {
    let q = sb.from('kebiasaan_baik').select('*');
    if (!opsi.sertakanArsip) q = q.eq('status', 'tayang');
    const { data, error } = await q.order('urutan', { ascending: true }).order('id', { ascending: true });
    if (error) { console.warn('[kebiasaan] katalog belum tersedia:', error.message); return null; }
    return (data ?? []).map((r: any) => ({
      ...normalisasiKebiasaan(r), status: r.status, versi: r.versi, diterbitkan_pada: r.diterbitkan_pada,
    }));
  } catch (e) {
    console.warn('[kebiasaan] gagal memuat katalog:', e);
    return null;
  }
}

export async function muatTemplateIrama(): Promise<TemplateIrama[] | null> {
  try {
    const { data, error } = await sb.from('irama_template').select('*').order('urutan', { ascending: true });
    if (error) { console.warn('[irama] template belum tersedia:', error.message); return null; }
    return (data ?? []).map((r: any) => normalisasiTemplate(r));
  } catch (e) {
    console.warn('[irama] gagal memuat template:', e);
    return null;
  }
}

/** Simpan (tambah/ubah) satu kegiatan template. Langsung tayang — khusus admin. */
export async function simpanTemplate(tpl: TemplateIrama, keyLama?: string): Promise<void> {
  const b = normalisasiTemplate(tpl);
  if (!b.key || !b.nama) throw new Error('Kunci dan nama kegiatan wajib diisi.');
  const baris = { waktu: b.waktu, nama: b.nama, jam: b.jam, ikon: b.ikon, urutan: b.urutan, aktif: b.aktif, saran: b.saran };
  if (keyLama) {
    const { error } = await sb.from('irama_template').update({ key: b.key, ...baris }).eq('key', keyLama);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await sb.from('irama_template').insert({ key: b.key, ...baris });
    if (error) throw new Error(error.message.includes('duplicate') ? `Kunci "${b.key}" sudah dipakai.` : error.message);
  }
}

/** Simpan urutan banyak template sekaligus (setelah naik/turun). */
export async function simpanUrutanTemplate(daftar: { key: string; waktu: Waktu; urutan: number }[]): Promise<void> {
  for (const d of daftar) {
    const { error } = await sb.from('irama_template').update({ urutan: d.urutan, waktu: d.waktu }).eq('key', d.key);
    if (error) throw new Error(error.message);
  }
}

export async function hapusTemplate(key: string): Promise<void> {
  const { error } = await sb.from('irama_template').delete().eq('key', key);
  if (error) throw new Error(error.message);
}

// ─── Draf (pipeline tinjauan) ────────────────────────────────────────────────

export async function muatDrafKebiasaan(): Promise<DrafKebiasaan[]> {
  const { data, error } = await sb.from('konten_draf').select('*').eq('jenis', JENIS_KEBIASAAN).order('diperbarui_pada', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((d: any) => ({ ...d, isi: normalisasiKebiasaan(d.isi ?? {}) })) as DrafKebiasaan[];
}

export async function muatSatuDrafKebiasaan(id: string): Promise<DrafKebiasaan | null> {
  const { data, error } = await sb.from('konten_draf').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? ({ ...(data as any), isi: normalisasiKebiasaan((data as any).isi ?? {}) } as DrafKebiasaan) : null;
}

async function uidWajib(): Promise<string> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Sesi tidak ditemukan. Masuk lagi sebagai admin.');
  return user.id;
}

export async function buatDrafKebiasaan(isi: IsiKebiasaan, opsi: { idSumber?: string | null; catatan?: string; ajukan?: boolean } = {}): Promise<DrafKebiasaan> {
  const uid = await uidWajib();
  const bersih = normalisasiKebiasaan(isi);
  const { data, error } = await sb.from('konten_draf').insert({
    jenis: JENIS_KEBIASAAN, judul: bersih.judul, isi: bersih, id_konten_sumber: opsi.idSumber ?? null,
    catatan_penulis: opsi.catatan?.trim() || null, id_penulis: uid, status: opsi.ajukan ? 'diajukan' : 'draf',
  }).select('*').single();
  if (error) throw error;
  if (opsi.ajukan) await sb.from('riwayat_tinjauan').insert({ id_draf: (data as any).id, id_pelaku: uid, tindakan: 'diajukan' });
  return { ...(data as any), isi: bersih } as DrafKebiasaan;
}

export async function perbaruiDrafKebiasaan(id: string, isi: IsiKebiasaan, opsi: { catatan?: string; ajukan?: boolean } = {}): Promise<void> {
  const uid = await uidWajib();
  const bersih = normalisasiKebiasaan(isi);
  const { error } = await sb.from('konten_draf').update({
    judul: bersih.judul, isi: bersih, catatan_penulis: opsi.catatan?.trim() || null, status: opsi.ajukan ? 'diajukan' : 'draf',
  }).eq('id', id).eq('id_penulis', uid);
  if (error) throw error;
  if (opsi.ajukan) await sb.from('riwayat_tinjauan').insert({ id_draf: id, id_pelaku: uid, tindakan: 'diajukan' });
}

export async function ajukanDrafKebiasaan(id: string): Promise<void> {
  const uid = await uidWajib();
  const { error } = await sb.from('konten_draf').update({ status: 'diajukan' }).eq('id', id).eq('id_penulis', uid);
  if (error) throw error;
  await sb.from('riwayat_tinjauan').insert({ id_draf: id, id_pelaku: uid, tindakan: 'diajukan' });
}

export async function hapusDrafKebiasaan(id: string): Promise<void> {
  const { error, count } = await sb.from('konten_draf').delete({ count: 'exact' }).eq('id', id);
  if (error) throw error;
  if (count === 0) throw new Error('Draf tidak bisa dihapus. Hanya draf milik sendiri yang belum diajukan atau yang ditolak.');
}

export async function terapkanKebiasaan(idDraf: string): Promise<void> {
  const { error } = await sb.rpc('terapkan_kebiasaan', { p_id_draf: idDraf });
  if (error) throw new Error(error.message);
}

export async function aturStatusKebiasaan(id: string, status: 'tayang' | 'diarsipkan'): Promise<void> {
  const { error } = await sb.rpc('atur_status_kebiasaan', { p_id: id, p_status: status });
  if (error) throw new Error(error.message);
}

/** ID baru berikutnya: kb-058, kb-059, … (melompati yang sudah dipakai). */
export function idKebiasaanBerikutnya(terpakai: Iterable<string>): string {
  let maks = 0;
  for (const id of terpakai) { const m = /^kb-(\d+)$/.exec(id); if (m) maks = Math.max(maks, Number(m[1])); }
  return `kb-${String(maks + 1).padStart(3, '0')}`;
}
