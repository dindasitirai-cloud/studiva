// =============================================================
// inboxData — sumber tunggal data Inbox Kelola (Phase 15 · Tahap 4).
// Dipakai bersama oleh tab Inbox (InboxKelola) dan kartu "Untuk Dikelola"
// di panel Hari Ini, agar isinya selalu sinkron (localStorage per anak).
// Supabase menyusul. Konten SEED = contoh (DRAFT, review Fitri).
// =============================================================
import { useMemo, useState } from 'react';
import { tanggalDariTimestampWIB } from '@studiva/shared';

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

export interface InboxStore {
  semua: InboxItem[];
  todo: InboxItem[];
  rampung: InboxItem[];
  done: Set<string>;
  toggle: (id: string) => void;
  tambah: (judul: string) => void;
}

/** Baca simpanan Inbox (doneAt + tambahan) dari localStorage, dengan migrasi
 *  bentuk lama { done: string[] } → doneAt tanpa tanggal (id → ''). */
interface Simpanan { doneAt: Record<string, string>; tambahan: InboxItem[] }
function bacaSimpanan(kunci: string): Simpanan {
  try {
    const raw = localStorage.getItem(kunci);
    if (raw) {
      const p = JSON.parse(raw) as { doneAt?: Record<string, string>; done?: string[]; tambahan?: InboxItem[] };
      const doneAt: Record<string, string> = { ...(p.doneAt ?? {}) };
      if (Array.isArray(p.done)) for (const id of p.done) if (!(id in doneAt)) doneAt[id] = ''; // migrasi tanpa tanggal
      return { doneAt, tambahan: p.tambahan ?? [] };
    }
  } catch { /* abaikan */ }
  return { doneAt: {}, tambahan: [] };
}

/** Hook Inbox bersama — dibaca ulang tiap mount, ditulis ke localStorage per anak.
 *  Status selesai kini menyimpan TANGGAL (doneAt) supaya bisa dicatat di Jurnal. */
export function useInboxStore(idAnak: string): InboxStore {
  const kunci = `rekah_inbox_${idAnak}`;
  const awal = useMemo(() => bacaSimpanan(kunci), [kunci]);

  const [doneAt, setDoneAt] = useState<Record<string, string>>(awal.doneAt);
  const [tambahan, setTambahan] = useState<InboxItem[]>(awal.tambahan);

  const simpan = (d: Record<string, string>, t: InboxItem[]) => {
    try { localStorage.setItem(kunci, JSON.stringify({ doneAt: d, tambahan: t })); } catch { /* abaikan */ }
  };
  const toggle = (id: string) => setDoneAt(prev => {
    const n = { ...prev };
    if (id in n) delete n[id]; else n[id] = tanggalDariTimestampWIB(new Date().toISOString());
    simpan(n, tambahan); return n;
  });
  const tambah = (judul: string) => {
    const j = judul.trim(); if (!j) return;
    const it: InboxItem = { id: `m-${Date.now().toString(36)}`, judul: j, src: 'manual' };
    const t = [it, ...tambahan]; setTambahan(t); simpan(doneAt, t);
  };

  const done = new Set(Object.keys(doneAt));
  const semua = [...tambahan, ...INBOX_SEED];
  const todo = semua.filter(i => !done.has(i.id));
  const rampung = semua.filter(i => done.has(i.id));
  return { semua, todo, rampung, done, toggle, tambah };
}

/** Read-only: daftar item "Untuk Dikelola" yang sudah ditandai selesai, beserta
 *  tanggalnya — dipakai Jurnal Temani untuk mencatat otomatis per hari. */
export function bacaInboxSelesai(idAnak: string): { judul: string; tanggal: string }[] {
  const { doneAt, tambahan } = bacaSimpanan(`rekah_inbox_${idAnak}`);
  const judulById = new Map<string, string>();
  for (const it of INBOX_SEED) judulById.set(it.id, it.judul);
  for (const it of tambahan) judulById.set(it.id, it.judul);
  const out: { judul: string; tanggal: string }[] = [];
  for (const id of Object.keys(doneAt)) {
    const tanggal = doneAt[id];
    const judul = judulById.get(id);
    if (judul && tanggal) out.push({ judul, tanggal });
  }
  return out;
}
