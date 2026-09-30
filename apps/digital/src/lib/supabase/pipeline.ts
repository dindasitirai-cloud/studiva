import { supabase } from './client';
import type { Json } from './database.types';

export type StatusPipeline = 'draf' | 'diajukan' | 'disetujui' | 'ditolak' | 'tayang';
export type JenisKonten = 'kegiatan_ajak_main' | 'panduan_tumbuh' | 'sikap' | 'temani_journey' | 'bantu_situasi' | 'kebiasaan_baik';

export interface KontenDraf {
  id: string;
  jenis: JenisKonten;
  id_konten_sumber: string | null;
  judul: string;
  isi: Record<string, unknown>;
  catatan_penulis: string | null;
  status: StatusPipeline;
  id_penulis: string;
  id_penyetuju: string | null;
  catatan_tinjauan: string | null;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface RiwayatTinjauan {
  id: string;
  id_draf: string;
  id_pelaku: string;
  tindakan: string;
  catatan: string | null;
  dibuat_pada: string;
}

// ── Buat draf baru ───────────────────────────────────────────────────────────

export async function buatDraf(params: {
  jenis: JenisKonten;
  judul: string;
  isi: Record<string, unknown>;
  id_konten_sumber?: string;
  catatan_penulis?: string;
}): Promise<KontenDraf> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Harus login sebagai admin untuk membuat draf.');

  const { data, error } = await supabase
    .from('konten_draf')
    .insert({
      jenis: params.jenis,
      judul: params.judul,
      isi: params.isi as unknown as Json,
      id_konten_sumber: params.id_konten_sumber ?? null,
      catatan_penulis: params.catatan_penulis ?? null,
      id_penulis: user.id,
      status: 'draf',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as KontenDraf;
}

// ── Ajukan draf untuk ditinjau ───────────────────────────────────────────────

export async function ajukanDraf(idDraf: string, catatanPenulis?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesi tidak ditemukan.');

  const { error: updateErr } = await supabase
    .from('konten_draf')
    .update({ status: 'diajukan', catatan_penulis: catatanPenulis ?? null })
    .eq('id', idDraf)
    .eq('id_penulis', user.id);

  if (updateErr) throw updateErr;

  const { error: riwayatErr } = await supabase
    .from('riwayat_tinjauan')
    .insert({ id_draf: idDraf, id_pelaku: user.id, tindakan: 'diajukan' });

  if (riwayatErr) console.warn('[pipeline] Gagal catat riwayat ajukan:', riwayatErr);
}

// ── Ajukan draf sekaligus (buat + ajukan dalam satu langkah) ─────────────────

export async function buatDanAjukan(params: {
  jenis: JenisKonten;
  judul: string;
  isi: Record<string, unknown>;
  id_konten_sumber?: string;
  catatan_penulis?: string;
}): Promise<KontenDraf> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Harus login sebagai admin untuk mengajukan konten.');

  const { data, error } = await supabase
    .from('konten_draf')
    .insert({
      jenis: params.jenis,
      judul: params.judul,
      isi: params.isi as unknown as Json,
      id_konten_sumber: params.id_konten_sumber ?? null,
      catatan_penulis: params.catatan_penulis ?? null,
      id_penulis: user.id,
      status: 'diajukan',
    })
    .select('*')
    .single();

  if (error) throw error;

  await supabase.from('riwayat_tinjauan').insert({
    id_draf: data.id,
    id_pelaku: user.id,
    tindakan: 'diajukan',
  });

  return data as KontenDraf;
}

// ── Muat antrean (untuk Fitri: semua yang 'diajukan') ────────────────────────

export async function muatAntrean(): Promise<KontenDraf[]> {
  const { data, error } = await supabase
    .from('konten_draf')
    .select('*')
    .eq('status', 'diajukan')
    .order('diperbarui_pada', { ascending: true }); // yang paling lama menunggu lebih dulu

  if (error) throw error;
  return (data ?? []) as KontenDraf[];
}

// ── Muat semua draf (admin: termasuk draf sendiri) ───────────────────────────

export async function muatSemuaDraf(): Promise<KontenDraf[]> {
  const { data, error } = await supabase
    .from('konten_draf')
    .select('*')
    .order('diperbarui_pada', { ascending: false });

  if (error) throw error;
  return (data ?? []) as KontenDraf[];
}

// ── Muat satu draf (untuk LayarDiff) ─────────────────────────────────────────

export async function muatDraf(id: string): Promise<KontenDraf | null> {
  const { data, error } = await supabase
    .from('konten_draf')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as KontenDraf | null;
}

// ── Riwayat tinjauan satu draf ────────────────────────────────────────────────

export async function muatRiwayat(idDraf: string): Promise<RiwayatTinjauan[]> {
  const { data, error } = await supabase
    .from('riwayat_tinjauan')
    .select('*')
    .eq('id_draf', idDraf)
    .order('dibuat_pada', { ascending: true });

  if (error) throw error;
  return (data ?? []) as RiwayatTinjauan[];
}

// ── Setujui (hanya peninjau_klinis) ──────────────────────────────────────────

export async function setujuiDraf(idDraf: string, catatan?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesi tidak ditemukan.');

  const { error: updateErr } = await supabase
    .from('konten_draf')
    .update({ status: 'disetujui', id_penyetuju: user.id, catatan_tinjauan: catatan ?? null })
    .eq('id', idDraf);

  if (updateErr) throw updateErr;

  await supabase.from('riwayat_tinjauan').insert({
    id_draf: idDraf, id_pelaku: user.id, tindakan: 'disetujui', catatan: catatan ?? null,
  });
}

// ── Tolak atau minta revisi ───────────────────────────────────────────────────

export async function tolakDraf(
  idDraf: string,
  tindakan: 'ditolak' | 'revisi_diminta',
  catatan: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesi tidak ditemukan.');

  // Revisi dikembalikan ke penulis sebagai draf (bisa diedit & diajukan ulang), bukan tetap di antrean.
  // id_penyetuju wajib diisi: kebijakan RLS peninjau memeriksa id_penyetuju = auth.uid().
  const statusBaru: StatusPipeline = tindakan === 'ditolak' ? 'ditolak' : 'draf';
  const { error: updateErr } = await supabase
    .from('konten_draf')
    .update({ status: statusBaru, catatan_tinjauan: catatan, id_penyetuju: user.id })
    .eq('id', idDraf);

  if (updateErr) throw updateErr;

  await supabase.from('riwayat_tinjauan').insert({
    id_draf: idDraf, id_pelaku: user.id, tindakan, catatan,
  });
}

// ── Riwayat keputusan seorang peninjau ───────────────────────────────────────

export interface RiwayatDenganDraf extends RiwayatTinjauan {
  draf: { judul: string; jenis: JenisKonten; status: StatusPipeline } | null;
}

export async function muatRiwayatSaya(batas = 100): Promise<RiwayatDenganDraf[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const sb = supabase as unknown as { from: (t: string) => any };
  const { data, error } = await sb.from('riwayat_tinjauan')
    .select('*, draf:konten_draf(judul, jenis, status)')
    .eq('id_pelaku', user.id)
    .in('tindakan', ['disetujui', 'ditolak', 'revisi_diminta'])
    .order('dibuat_pada', { ascending: false })
    .limit(batas);
  if (error) throw error;
  return (data ?? []) as RiwayatDenganDraf[];
}

// ── Label status untuk UI ─────────────────────────────────────────────────────

export const LABEL_STATUS: Record<StatusPipeline, string> = {
  draf:       'Draf',
  diajukan:   'Menunggu Tinjauan',
  disetujui:  'Disetujui',
  ditolak:    'Ditolak',
  tayang:     'Tayang',
};

export const LABEL_JENIS: Record<JenisKonten, string> = {
  kegiatan_ajak_main: 'Ajak Main',
  panduan_tumbuh:     'Panduan Tumbuh',
  sikap:              'Sikap per Fase (Bekal)',
  temani_journey:     'Temani',
  bantu_situasi:      'Bantu',
  kebiasaan_baik:     'Kebiasaan Baik',
};
