// Katalog Ajak Main & Sikap per Fase yang tayang lewat Supabase (migrasi 028).
// Draf tetap lewat pipeline konten_draf; setelah disetujui peninjau, admin menerapkan dengan RPC
// terapkan_ajak_main / terapkan_sikap → dibaca website online (tanpa backend Express).
import { supabase } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Activity } from '../../data/learningStrategies';
import { NILAI } from '../../features/akar-keluarga/content';
import type { NilaiAkar } from '../../features/akar-keluarga/content';
import type { ItemSikap } from '../../features/beranda-usia/adapter/sikapAdapter';

const sb = supabase as unknown as SupabaseClient;

function pesanRpc(e: { message: string }, migrasi: string): Error {
  if (/schema cache|does not exist|Could not find the function/i.test(e.message)) {
    return new Error(`Fungsi tayang belum ada di Supabase. Jalankan migrasi ${migrasi} dulu, lalu klik Terapkan lagi.`);
  }
  return new Error(e.message);
}

// ─── Ajak Main ───────────────────────────────────────────────────────────────

/** Kegiatan Ajak Main tayang dari Supabase. null = tabel belum ada / gagal. */
export async function muatKatalogAjakMain(): Promise<Activity[] | null> {
  try {
    const { data, error } = await sb.from('ajak_main_kegiatan').select('id_kegiatan,isi').eq('status', 'tayang');
    if (error) { console.warn('[ajak-main] katalog belum tersedia:', error.message); return null; }
    return (data ?? []).map((r: any) => {
      const a = (r.isi ?? {}) as Partial<Activity>;
      return {
        icon: '', domain: [], durasiMenit: 15, isDIY: true, deskripsi: '', sci: '', sumber: '', tujuan: '',
        bahan: [], langkah: [], variasiMudah: '', variasiMenantang: '', adaptasiABK: '',
        ...a,
        id: Number(r.id_kegiatan),
        judul: a.judul ?? '',
        ageId: a.ageId ?? '',
        status: 'published',
      } as Activity;
    });
  } catch (e) {
    console.warn('[ajak-main] gagal memuat katalog:', e);
    return null;
  }
}

export async function terapkanAjakMain(idDraf: string): Promise<void> {
  const { error } = await sb.rpc('terapkan_ajak_main', { p_id_draf: idDraf });
  if (error) throw pesanRpc(error, '028_ajak_main_sikap.sql');
}

export async function aturStatusAjakMain(id: number, status: 'tayang' | 'diarsipkan'): Promise<void> {
  const { error } = await sb.rpc('atur_status_ajak_main', { p_id: id, p_status: status });
  if (error) throw new Error(error.message);
}

// ─── Sikap per Fase ──────────────────────────────────────────────────────────

/** Sikap tayang dari Supabase (tabel sikap), dalam bentuk ItemSikap untuk Bekal. */
export async function muatKatalogSikap(): Promise<ItemSikap[]> {
  try {
    const { data, error } = await sb.from('sikap').select('id,judul,nilai,fase_mulai,fase_selesai');
    if (error) { console.warn('[sikap] katalog belum tersedia:', error.message); return []; }
    return (data ?? []).map((r: any) => ({
      id: `sikap-${r.id}`,
      judul: String(r.judul ?? ''),
      nilai: (Array.isArray(r.nilai) ? r.nilai : []).filter((n: string): n is NilaiAkar => (NILAI as readonly string[]).includes(n)),
      faseMulai: Number(r.fase_mulai),
      faseSelesai: Number(r.fase_selesai),
      sumberId: `supabase:sikap/${r.id}`,
    })).filter(s => s.judul && s.nilai.length);
  } catch (e) {
    console.warn('[sikap] gagal memuat katalog:', e);
    return [];
  }
}

export async function terapkanSikap(idDraf: string): Promise<void> {
  const { error } = await sb.rpc('terapkan_sikap', { p_id_draf: idDraf });
  if (error) {
    if (/Hanya admin|permission denied/i.test(error.message)) throw pesanRpc({ message: 'schema cache' }, '028_ajak_main_sikap.sql');
    throw pesanRpc(error, '028_ajak_main_sikap.sql');
  }
}
