// Lapisan data konten situasi Bantu (migrasi 025). Pola sama dengan temani.ts:
// katalog tayang (bantu_situasi, baca saja) + draf di pipeline konten_draf (jenis 'bantu_situasi').
import { supabase } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { KontenDraf } from './pipeline';

const sb = supabase as unknown as SupabaseClient;

export const JENIS_BANTU = 'bantu_situasi' as const;
export type KategoriBantu = 'perilaku_anak' | 'relasional' | 'caregiver' | 'meta';
export const LABEL_KATEGORI: Record<KategoriBantu, string> = {
  perilaku_anak: 'Perilaku anak', relasional: 'Relasional', caregiver: 'Caregiver', meta: 'Meta (tidak tampil di kartu)',
};

export interface ClarifyBantu {
  pertanyaan: string;
  opsi: string[];
  /** Opsi yang, bila dipilih orang tua, langsung membuka layar keselamatan (B5). */
  opsi_keselamatan: string[];
}

/** Payload satu situasi (isi draf = baris katalog). */
export interface IsiBantu {
  slug: string;
  label: string;
  ringkas: string;
  kategori: KategoriBantu;
  sensitif_keselamatan: boolean;
  urutan: number;
  clarify: ClarifyBantu[];
  validasi: string;
  langkah: string[];
  yang_diamati: string;
  kenapa_sederhana: string;
  kenapa_sumber: string;
}

export interface SituasiKatalog extends IsiBantu {
  id: string;
  status: 'tayang' | 'diarsipkan';
  versi: number;
  diterbitkan_pada: string;
}

export interface DrafBantu extends Omit<KontenDraf, 'isi'> {
  isi: IsiBantu;
}

export function isiBantuKosong(): IsiBantu {
  return {
    slug: '', label: '', ringkas: '', kategori: 'perilaku_anak', sensitif_keselamatan: false, urutan: 100,
    clarify: [], validasi: '', langkah: ['', ''], yang_diamati: '', kenapa_sederhana: '', kenapa_sumber: '',
  };
}

const KATEGORI: KategoriBantu[] = ['perilaku_anak', 'relasional', 'caregiver', 'meta'];

export function normalisasiBantu(isi: Partial<IsiBantu>): IsiBantu {
  const t = (s: unknown) => (typeof s === 'string' ? s.trim() : '');
  const daftar = (a: unknown) => (Array.isArray(a) ? a.map(t).filter(Boolean) : []);
  return {
    slug: t(isi.slug).toLowerCase(),
    label: t(isi.label),
    ringkas: t(isi.ringkas),
    kategori: KATEGORI.includes(isi.kategori as KategoriBantu) ? (isi.kategori as KategoriBantu) : 'perilaku_anak',
    sensitif_keselamatan: !!isi.sensitif_keselamatan,
    urutan: Number.isFinite(Number(isi.urutan)) ? Number(isi.urutan) : 100,
    clarify: (Array.isArray(isi.clarify) ? isi.clarify : [])
      .map(c => {
        const opsi = daftar(c?.opsi);
        return { pertanyaan: t(c?.pertanyaan), opsi, opsi_keselamatan: daftar(c?.opsi_keselamatan).filter(o => opsi.includes(o)) };
      })
      .filter(c => c.pertanyaan || c.opsi.length),
    validasi: t(isi.validasi),
    langkah: daftar(isi.langkah),
    yang_diamati: t(isi.yang_diamati),
    kenapa_sederhana: t(isi.kenapa_sederhana),
    kenapa_sumber: t(isi.kenapa_sumber),
  };
}

export function isiDariSituasi(s: SituasiKatalog): IsiBantu {
  return normalisasiBantu(s); // hanya mengambil kolom isi, metadata katalog terbuang
}

export async function muatKatalogBantu(opsi: { sertakanArsip?: boolean } = {}): Promise<SituasiKatalog[] | null> {
  try {
    let q = sb.from('bantu_situasi').select('*');
    if (!opsi.sertakanArsip) q = q.eq('status', 'tayang');
    const { data, error } = await q.order('urutan', { ascending: true }).order('label', { ascending: true });
    if (error) { console.warn('[bantu] katalog belum tersedia:', error.message); return null; }
    return (data ?? []).map((r: any) => ({
      ...normalisasiBantu(r),
      id: r.id, status: r.status, versi: r.versi, diterbitkan_pada: r.diterbitkan_pada,
    }));
  } catch (e) {
    console.warn('[bantu] gagal memuat katalog:', e);
    return null;
  }
}

export async function muatDrafBantu(): Promise<DrafBantu[]> {
  const { data, error } = await sb.from('konten_draf').select('*').eq('jenis', JENIS_BANTU).order('diperbarui_pada', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((d: any) => ({ ...d, isi: normalisasiBantu(d.isi ?? {}) })) as DrafBantu[];
}

export async function muatSatuDrafBantu(id: string): Promise<DrafBantu | null> {
  const { data, error } = await sb.from('konten_draf').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? ({ ...(data as any), isi: normalisasiBantu((data as any).isi ?? {}) } as DrafBantu) : null;
}

async function uidWajib(): Promise<string> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Sesi tidak ditemukan. Masuk lagi sebagai admin.');
  return user.id;
}

export async function buatDrafBantu(isi: IsiBantu, opsi: { idSumber?: string | null; catatan?: string; ajukan?: boolean } = {}): Promise<DrafBantu> {
  const uid = await uidWajib();
  const bersih = normalisasiBantu(isi);
  const { data, error } = await sb.from('konten_draf').insert({
    jenis: JENIS_BANTU, judul: bersih.label, isi: bersih, id_konten_sumber: opsi.idSumber ?? null,
    catatan_penulis: opsi.catatan?.trim() || null, id_penulis: uid, status: opsi.ajukan ? 'diajukan' : 'draf',
  }).select('*').single();
  if (error) throw error;
  if (opsi.ajukan) await sb.from('riwayat_tinjauan').insert({ id_draf: (data as any).id, id_pelaku: uid, tindakan: 'diajukan' });
  return { ...(data as any), isi: bersih } as DrafBantu;
}

export async function perbaruiDrafBantu(id: string, isi: IsiBantu, opsi: { catatan?: string; ajukan?: boolean } = {}): Promise<void> {
  const uid = await uidWajib();
  const bersih = normalisasiBantu(isi);
  const { error } = await sb.from('konten_draf').update({
    judul: bersih.label, isi: bersih, catatan_penulis: opsi.catatan?.trim() || null, status: opsi.ajukan ? 'diajukan' : 'draf',
  }).eq('id', id).eq('id_penulis', uid);
  if (error) throw error;
  if (opsi.ajukan) await sb.from('riwayat_tinjauan').insert({ id_draf: id, id_pelaku: uid, tindakan: 'diajukan' });
}

export async function ajukanDrafBantu(id: string): Promise<void> {
  const uid = await uidWajib();
  const { error } = await sb.from('konten_draf').update({ status: 'diajukan' }).eq('id', id).eq('id_penulis', uid);
  if (error) throw error;
  await sb.from('riwayat_tinjauan').insert({ id_draf: id, id_pelaku: uid, tindakan: 'diajukan' });
}

export async function hapusDrafBantu(id: string): Promise<void> {
  const { error, count } = await sb.from('konten_draf').delete({ count: 'exact' }).eq('id', id);
  if (error) throw error;
  if (count === 0) throw new Error('Draf tidak bisa dihapus. Hanya draf milik sendiri yang belum diajukan atau yang ditolak.');
}

export async function terapkanBantu(idDraf: string): Promise<void> {
  const { error } = await sb.rpc('terapkan_bantu', { p_id_draf: idDraf });
  if (error) throw new Error(error.message);
}

export async function aturStatusBantu(slug: string, status: 'tayang' | 'diarsipkan'): Promise<void> {
  const { error } = await sb.rpc('atur_status_bantu', { p_slug: slug, p_status: status });
  if (error) throw new Error(error.message);
}
