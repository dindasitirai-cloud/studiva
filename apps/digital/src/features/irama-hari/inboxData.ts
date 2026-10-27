// =============================================================
// inboxData — sumber tunggal data "Untuk Dikelola" (Kelola).
// Dipakai kartu Untuk Dikelola (Irama Keseharian) + jendela "Lihat semua"
// (DaftarDikelola), Kehidupan Keluarga, Beranda, dan Jurnal. Tab Inbox
// dihapus 2026-10-27; nama berkas dipertahankan supaya impor lama tetap jalan.
//
// Penyimpanan (2026-10-27): tabel Supabase `untuk_dikelola` (migration 034) +
// cache lokal `rekah_inbox_<idAnak>` (bentuk v2). Setiap item menyimpan KAPAN
// ditandai (ditandaiPada, ISO). Item hanya hilang bila dihapus orang tua.
// Sebelum 034 dijalankan, semuanya tetap bekerja dari cache lokal dan diunggah
// otomatis begitu tabelnya tersedia. Konten SEED = contoh (DRAFT, review Fitri).
// =============================================================
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { tanggalDariTimestampWIB } from '@studiva/shared';
import { supabase } from '../../lib/supabase/client';

export type Sumber = 'anak' | 'caregiver' | 'rumah' | 'bantu' | 'bekal' | 'manual';

export const SUMBER: Record<Sumber, { label: string; warna: string }> = {
  anak: { label: 'Anak', warna: '#F8B9D4' },
  caregiver: { label: 'Caregiver', warna: '#8FB8F7' },
  rumah: { label: 'Rumah', warna: '#C9B8F0' },
  bantu: { label: 'Bantu', warna: '#4E9C6E' },
  bekal: { label: 'Bekal', warna: '#8FB8F7' },
  manual: { label: 'Catatan', warna: '#D7C7D2' },
};

export interface InboxItem { id: string; judul: string; ket?: string; src: Sumber; due?: string }

export const INBOX_SEED: InboxItem[] = [
  { id: 's1', judul: 'Beli buku baru', ket: 'Dukung minat baca anak', src: 'anak' },
  { id: 's2', judul: 'Diskusikan bedtime dengan Ayah', ket: 'Untuk rutinitas tidur lebih konsisten', src: 'caregiver', due: 'Hari ini' },
  { id: 's3', judul: 'Coba aktivitas sensory play', ket: 'Membantu regulasi emosi', src: 'bantu', due: 'Besok' },
  { id: 's4', judul: 'Jadwalkan kontrol kesehatan', ket: 'Kontrol tumbuh kembang bulan depan', src: 'anak', due: 'Jumat' },
  { id: 's5', judul: 'Belanja kebutuhan MPASI', ket: 'Stok menipis', src: 'rumah', due: 'Minggu ini' },
];
const ID_SEED = new Set(INBOX_SEED.map(s => s.id));

/** Item tersimpan. `ditandaiPada` = waktu ditandai (ISO); data lama bisa berupa
 *  tanggal saja (YYYY-MM-DD) atau kosong bila waktu tidak tercatat. */
export interface ItemDikelolaSimpan extends InboxItem {
  selesai: boolean;
  ditandaiPada?: string;
  dibuat: string;
  diperbarui: string;
  /** Hanya untuk contoh bawaan yang dihapus (supaya tidak muncul lagi). */
  dihapus?: boolean;
}

export interface InboxStore {
  /** Semua item aktif (tanpa yang dihapus), terbaru dulu. */
  semua: InboxItem[];
  todo: InboxItem[];
  rampung: InboxItem[];
  done: Set<string>;
  /** id → tanggal ditandai (YYYY-MM-DD WIB; '' bila tidak tercatat). */
  selesaiPada: Record<string, string>;
  /** id → waktu ditandai apa adanya (ISO, atau tanggal saja untuk data lama). */
  ditandaiPada: Record<string, string>;
  toggle: (id: string) => void;
  tambah: (judul: string) => void;
  hapus: (id: string) => void;
  /** 'supabase' bila tabel 034 tersedia, 'lokal' bila masih cadangan perangkat. */
  sumberData: 'supabase' | 'lokal';
}

// ── Cache lokal ──────────────────────────────────────────────────────────────
const EVENT = 'rekah-untuk-dikelola';
const kunci = (idAnak: string) => `rekah_inbox_${idAnak}`;
const kini = () => new Date().toISOString();

/** Baca cache. Bentuk lama { doneAt | done, tambahan } dimigrasi ke v2 tanpa kehilangan data. */
function bacaCache(idAnak: string): ItemDikelolaSimpan[] {
  const sekarang = kini();
  try {
    const raw = localStorage.getItem(kunci(idAnak));
    if (raw) {
      const p = JSON.parse(raw) as { v?: number; items?: ItemDikelolaSimpan[]; doneAt?: Record<string, string>; done?: string[]; tambahan?: InboxItem[] };
      if (p.v === 2 && Array.isArray(p.items)) return p.items;
      const doneAt: Record<string, string> = { ...(p.doneAt ?? {}) };
      if (Array.isArray(p.done)) for (const id of p.done) if (!(id in doneAt)) doneAt[id] = '';
      const lama = [...(p.tambahan ?? []), ...INBOX_SEED];
      return lama.map(it => ({ ...it, selesai: it.id in doneAt, ditandaiPada: doneAt[it.id] || undefined, dibuat: sekarang, diperbarui: sekarang }));
    }
  } catch { /* abaikan */ }
  return INBOX_SEED.map(it => ({ ...it, selesai: false, dibuat: sekarang, diperbarui: sekarang }));
}

function tulisCache(idAnak: string, items: ItemDikelolaSimpan[]): void {
  try { localStorage.setItem(kunci(idAnak), JSON.stringify({ v: 2, items })); } catch { /* abaikan */ }
  try { window.dispatchEvent(new CustomEvent(EVENT, { detail: idAnak })); } catch { /* abaikan */ }
}

// ── Supabase ─────────────────────────────────────────────────────────────────
const sb = supabase as unknown as SupabaseClient;
interface Baris {
  id_anak: string; id: string; judul: string; keterangan: string | null; sumber: string; tenggat: string | null;
  selesai: boolean; ditandai_pada: string | null; dibuat_pada: string; diperbarui_pada: string; dihapus_pada: string | null;
}
const keBaris = (idAnak: string, it: ItemDikelolaSimpan): Baris => ({
  id_anak: idAnak, id: it.id, judul: it.judul, keterangan: it.ket ?? null, sumber: it.src, tenggat: it.due ?? null,
  selesai: it.selesai,
  // Data lama bertanggal saja disimpan sebagai tengah hari WIB supaya tanggalnya tidak bergeser.
  ditandai_pada: it.selesai && it.ditandaiPada ? (it.ditandaiPada.length === 10 ? `${it.ditandaiPada}T12:00:00+07:00` : it.ditandaiPada) : null,
  dibuat_pada: it.dibuat, diperbarui_pada: it.diperbarui, dihapus_pada: it.dihapus ? it.diperbarui : null,
});
const dariBaris = (b: Baris): ItemDikelolaSimpan => ({
  id: b.id, judul: b.judul, ket: b.keterangan ?? undefined, src: (b.sumber in SUMBER ? b.sumber : 'manual') as Sumber, due: b.tenggat ?? undefined,
  selesai: b.selesai, ditandaiPada: b.ditandai_pada ?? undefined, dibuat: b.dibuat_pada, diperbarui: b.diperbarui_pada, dihapus: !!b.dihapus_pada,
});

let peringatanSekali = false;
const peringatan = (err: unknown) => {
  if (peringatanSekali) return;
  peringatanSekali = true;
  console.warn('[Untuk Dikelola] tabel untuk_dikelola belum tersedia — tersimpan di perangkat ini dulu. Jalankan migration 034.', err);
};

async function unggah(idAnak: string, items: ItemDikelolaSimpan[]): Promise<void> {
  if (!items.length || idAnak === 'anon') return;
  const { error } = await sb.from('untuk_dikelola').upsert(items.map(it => keBaris(idAnak, it)), { onConflict: 'id_anak,id' });
  if (error) throw error;
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useInboxStore(idAnak: string): InboxStore {
  const [items, setItems] = useState<ItemDikelolaSimpan[]>(() => bacaCache(idAnak));
  const [sumberData, setSumberData] = useState<'supabase' | 'lokal'>('lokal');

  // Sinkron antar-komponen di halaman yang sama.
  useEffect(() => {
    setItems(bacaCache(idAnak));
    const h = (e: Event) => { if ((e as CustomEvent).detail === idAnak) setItems(bacaCache(idAnak)); };
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, [idAnak]);

  // Ambil dari akun, gabung dengan cache (yang terakhir diubah menang), unggah sisanya.
  useEffect(() => {
    if (idAnak === 'anon') return;
    let batal = false;
    (async () => {
      const { data, error } = await sb.from('untuk_dikelola').select('*').eq('id_anak', idAnak);
      if (error) throw error;
      if (batal) return;
      const server = new Map((data as Baris[]).map(b => [b.id, dariBaris(b)]));
      const lokal = bacaCache(idAnak);
      const lokalMap = new Map(lokal.map(it => [it.id, it]));
      const perluUnggah: ItemDikelolaSimpan[] = [];
      const gabung: ItemDikelolaSimpan[] = [];
      // Akun belum punya data sama sekali → seluruh cache (termasuk contoh) jadi data awal.
      if (server.size === 0) { gabung.push(...lokal); perluUnggah.push(...lokal); }
      else {
        for (const s of server.values()) {
          const l = lokalMap.get(s.id);
          if (l && l.diperbarui > s.diperbarui) { gabung.push(l); perluUnggah.push(l); } else gabung.push(s);
        }
        // Item yang dibuat di perangkat ini dan belum pernah terunggah (contoh bawaan tidak
        // dibuat ulang bila akun sudah punya data).
        for (const l of lokal) if (!server.has(l.id) && !ID_SEED.has(l.id)) { gabung.push(l); perluUnggah.push(l); }
      }
      gabung.sort((a, b) => b.dibuat.localeCompare(a.dibuat));
      tulisCache(idAnak, gabung);
      setSumberData('supabase');
      if (perluUnggah.length) await unggah(idAnak, perluUnggah);
    })().catch(peringatan);
    return () => { batal = true; };
  }, [idAnak]);

  const ubah = useCallback((fn: (daftar: ItemDikelolaSimpan[]) => { baru: ItemDikelolaSimpan[]; unggah?: ItemDikelolaSimpan[]; hapusId?: string }) => {
    const hasil = fn(bacaCache(idAnak));
    tulisCache(idAnak, hasil.baru);
    if (hasil.unggah?.length) unggah(idAnak, hasil.unggah).catch(peringatan);
    if (hasil.hapusId && idAnak !== 'anon') {
      sb.from('untuk_dikelola').delete().eq('id_anak', idAnak).eq('id', hasil.hapusId)
        .then(({ error }) => { if (error) peringatan(error); });
    }
  }, [idAnak]);

  const toggle = useCallback((id: string) => ubah(daftar => {
    const t = kini();
    let diubah: ItemDikelolaSimpan | undefined;
    const baru = daftar.map(it => {
      if (it.id !== id) return it;
      diubah = { ...it, selesai: !it.selesai, ditandaiPada: it.selesai ? undefined : t, diperbarui: t };
      return diubah;
    });
    return { baru, unggah: diubah ? [diubah] : [] };
  }), [ubah]);

  const tambah = useCallback((judul: string) => {
    const j = judul.trim(); if (!j) return;
    ubah(daftar => {
      const t = kini();
      const it: ItemDikelolaSimpan = { id: `m-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, judul: j, src: 'manual', selesai: false, dibuat: t, diperbarui: t };
      return { baru: [it, ...daftar], unggah: [it] };
    });
  }, [ubah]);

  const hapus = useCallback((id: string) => ubah(daftar => {
    // Contoh bawaan ditandai dihapus (supaya tidak muncul lagi di perangkat lain);
    // item buatan sendiri dihapus permanen.
    if (ID_SEED.has(id)) {
      const t = kini();
      let diubah: ItemDikelolaSimpan | undefined;
      const baru = daftar.map(it => (it.id === id ? (diubah = { ...it, dihapus: true, diperbarui: t }) : it));
      return { baru, unggah: diubah ? [diubah] : [] };
    }
    return { baru: daftar.filter(it => it.id !== id), hapusId: id };
  }), [ubah]);

  return useMemo(() => {
    const aktif = items.filter(it => !it.dihapus);
    const done = new Set(aktif.filter(it => it.selesai).map(it => it.id));
    const ditandaiPada: Record<string, string> = {};
    const selesaiPada: Record<string, string> = {};
    for (const it of aktif) if (it.selesai) {
      ditandaiPada[it.id] = it.ditandaiPada ?? '';
      selesaiPada[it.id] = tanggalDari(it.ditandaiPada);
    }
    const polos = (it: ItemDikelolaSimpan): InboxItem => ({ id: it.id, judul: it.judul, ket: it.ket, src: it.src, due: it.due });
    return {
      semua: aktif.map(polos),
      todo: aktif.filter(it => !it.selesai).map(polos),
      rampung: aktif.filter(it => it.selesai).map(polos),
      done, selesaiPada, ditandaiPada, toggle, tambah, hapus, sumberData,
    };
  }, [items, toggle, tambah, hapus, sumberData]);
}

/** Tanggal WIB (YYYY-MM-DD) dari waktu ditandai; data lama bertanggal saja dikembalikan apa adanya. */
function tanggalDari(ditandai?: string): string {
  if (!ditandai) return '';
  if (ditandai.length === 10) return ditandai;
  try { return tanggalDariTimestampWIB(ditandai); } catch { return ''; }
}

/** Read-only: item "Untuk Dikelola" yang sudah ditandai beserta tanggalnya —
 *  dipakai Jurnal Temani untuk mencatat otomatis per hari. */
export function bacaInboxSelesai(idAnak: string): { judul: string; tanggal: string }[] {
  const out: { judul: string; tanggal: string }[] = [];
  for (const it of bacaCache(idAnak)) {
    if (it.dihapus || !it.selesai) continue;
    const tanggal = tanggalDari(it.ditandaiPada);
    if (tanggal) out.push({ judul: it.judul, tanggal });
  }
  return out;
}
