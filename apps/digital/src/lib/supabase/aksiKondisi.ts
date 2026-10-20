// Aksi per Kondisi (Phase 28) — teks/aksi yang TAYANG lewat Supabase (migrasi 033).
// Draf tetap lewat pipeline konten_draf (jenis 'aksi_kondisi'); setelah disetujui peninjau,
// admin menerapkan dengan RPC terapkan_aksi_kondisi → dibaca website online (tanpa backend).
// Logika pemicu tetap di kode; tabel ini hanya menyimpan teks untuk 'kunci' yang dikenali kode.
import { supabase } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';

const sb = supabase as unknown as SupabaseClient;

export interface AksiKondisiRow {
  id: string;
  domain: string;
  kunci: string;
  judul: string;
  detail: string | null;
  meta: Record<string, unknown>;
  urutan: number;
}

/** Semua baris Aksi Kondisi yang tayang. null = tabel belum ada / gagal (pakai default kode). */
export async function muatAksiKondisi(): Promise<AksiKondisiRow[] | null> {
  try {
    const { data, error } = await sb
      .from('aksi_kondisi')
      .select('id,domain,kunci,judul,detail,meta,urutan')
      .eq('status', 'tayang');
    if (error) { console.warn('[aksi-kondisi] belum tersedia:', error.message); return null; }
    return (data ?? []).map((r: any) => ({
      id: String(r.id),
      domain: String(r.domain),
      kunci: String(r.kunci),
      judul: String(r.judul ?? ''),
      detail: r.detail ?? null,
      meta: (r.meta ?? {}) as Record<string, unknown>,
      urutan: Number(r.urutan ?? 0),
    }));
  } catch (e) {
    console.warn('[aksi-kondisi] gagal memuat:', e);
    return null;
  }
}

export async function terapkanAksiKondisi(idDraf: string): Promise<void> {
  const { error } = await sb.rpc('terapkan_aksi_kondisi', { p_id_draf: idDraf });
  if (error) {
    if (/schema cache|does not exist|Could not find the function/i.test(error.message)) {
      throw new Error('Fungsi tayang belum ada di Supabase. Jalankan migrasi 033_aksi_kondisi.sql dulu, lalu klik Terapkan lagi.');
    }
    throw new Error(error.message);
  }
}

export async function aturStatusAksiKondisi(id: string, status: 'tayang' | 'diarsipkan'): Promise<void> {
  const { error } = await sb.rpc('atur_status_aksi_kondisi', { p_id: id, p_status: status });
  if (error) throw new Error(error.message);
}
