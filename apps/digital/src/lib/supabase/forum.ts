// Lapisan akses data Forum komunitas (Bantu) — tabel migrasi 021 + moderasi 022.
// Forum PUBLIK untuk pengguna terautentikasi. Admin (app_metadata.role='admin')
// bermoderasi via RLS (bukan service_role). Memetakan baris DB → ForumThread/ForumReply.
import { supabase } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ForumThread, ForumReply, ForumThreadStatus } from '../../context/DashboardTier2Context';

// Tabel forum belum ada di Database types (generated) → klien untyped khusus modul ini.
const sb = supabase as unknown as SupabaseClient;

function mapReply(r: any): ForumReply {
  return { id: r.id, author: r.author_nama, isSupport: r.is_support, content: r.isi, createdAt: r.dibuat_pada };
}
function mapThread(t: any, replies: any[]): ForumThread {
  return {
    id: t.id, title: t.judul, author: t.author_nama, content: t.isi, createdAt: t.dibuat_pada,
    isSupportRequest: t.is_support_request, isAnnouncement: t.is_announcement, privasi: t.privasi,
    status: t.status as ForumThreadStatus, pinned: t.pinned, replies: replies.map(mapReply),
  };
}

/** Muat thread + balasan. Admin melihat semua (termasuk disembunyikan). null = belum login/gagal → fallback. */
export async function muatThreads(): Promise<ForumThread[] | null> {
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) return null;
  const isAdmin = ((auth.user.app_metadata as any)?.role) === 'admin';
  let q = sb.from('forum_thread').select('*');
  if (!isAdmin) q = q.neq('status', 'disembunyikan');
  const { data: threads, error } = await q
    .order('pinned', { ascending: false })
    .order('dibuat_pada', { ascending: false });
  if (error || !threads) return null;
  const ids = threads.map((t: any) => t.id);
  let balasan: any[] = [];
  if (ids.length) {
    const { data: b } = await sb.from('forum_balasan').select('*').in('thread_id', ids).order('dibuat_pada', { ascending: true });
    balasan = b ?? [];
  }
  return threads.map((t: any) => mapThread(t, balasan.filter((b: any) => b.thread_id === t.id)));
}

export async function buatThread(judul: string, isi: string, authorNama: string, opts?: { isSupportRequest?: boolean; privasi?: 'publik' | 'privat' }): Promise<ForumThread | null> {
  const row: Record<string, unknown> = { judul, isi, author_nama: authorNama };
  if (opts?.isSupportRequest) row.is_support_request = true;
  if (opts?.privasi) row.privasi = opts.privasi;
  const { data, error } = await sb.from('forum_thread').insert(row).select('*').single();
  if (error || !data) return null;
  return mapThread(data, []);
}

export async function buatBalasan(threadId: string, isi: string, authorNama: string): Promise<ForumReply | null> {
  const { data, error } = await sb.from('forum_balasan').insert({ thread_id: threadId, isi, author_nama: authorNama }).select('*').single();
  if (error || !data) return null;
  return mapReply(data);
}

export async function laporThread(threadId: string): Promise<void> {
  await sb.from('forum_laporan').insert({ thread_id: threadId });
}

export async function hapusThread(id: string): Promise<void> {
  await sb.from('forum_thread').delete().eq('id', id);
}
export async function hapusBalasan(id: string): Promise<void> {
  await sb.from('forum_balasan').delete().eq('id', id);
}

// ── Aksi admin (butuh app_metadata.role='admin' → RLS 022) ──────────────────
export async function ubahStatus(id: string, status: ForumThreadStatus): Promise<void> {
  await sb.from('forum_thread').update({ status }).eq('id', id);
}
export async function ubahPin(id: string, pinned: boolean): Promise<void> {
  await sb.from('forum_thread').update({ pinned }).eq('id', id);
}
export async function buatPengumuman(judul: string, isi: string, authorNama: string): Promise<ForumThread | null> {
  const { data, error } = await sb.from('forum_thread').insert({ judul, isi, author_nama: authorNama, is_announcement: true }).select('*').single();
  if (error || !data) return null;
  return mapThread(data, []);
}
export async function balasSupport(threadId: string, isi: string, authorNama: string): Promise<ForumReply | null> {
  const { data, error } = await sb.from('forum_balasan').insert({ thread_id: threadId, isi, author_nama: authorNama, is_support: true }).select('*').single();
  if (error || !data) return null;
  return mapReply(data);
}
/** Daftar laporan (admin) untuk tinjauan. */
export async function muatLaporan(): Promise<any[]> {
  const { data } = await sb.from('forum_laporan').select('*').order('dibuat_pada', { ascending: false });
  return data ?? [];
}
