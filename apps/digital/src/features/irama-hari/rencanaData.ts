// =============================================================
// rencanaData — store bersama Rencana Minggu (Phase 15 · Tahap 2, v3).
// Dipakai oleh tab "Rencana Minggu" (menyusun rencana per hari) dan panel
// "Hari Ini" (menampilkan rencana hari berjalan ke kolom pagi/siang/malam
// + Untuk Dikelola). Slot = pagi | siang | malam (kegiatan) atau kelola.
// Persistensi localStorage per anak per minggu (Supabase menyusul).
// =============================================================
import { useMemo, useState } from 'react';

export type Slot = 'pagi' | 'siang' | 'malam' | 'kelola';
export interface PlanItem { id: string; hari: number; slot: Slot; teks: string; done: boolean }

/** Senin (awal minggu) dari tanggal d, jam 00:00 lokal. */
export function awalMinggu(d: Date): Date {
  const s = new Date(d); s.setDate(d.getDate() - ((d.getDay() + 6) % 7)); s.setHours(0, 0, 0, 0); return s;
}
/** Y-M-D lokal (tanpa pergeseran zona waktu, beda dengan toISOString). */
export function localISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function seninISO(d: Date): string { return localISO(awalMinggu(d)); }
/** Index hari ala Senin=0 … Minggu=6. */
export function hariIndex(d: Date): number { return (d.getDay() + 6) % 7; }
/** Parse 'YYYY-MM-DD' jadi Date lokal (hindari pergeseran UTC). */
export function dariISO(s: string): Date { const [y, m, d] = s.split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); }

function kunciFor(idAnak: string, senin: string) { return `rekah_rencana_v3_${idAnak}_${senin}`; }

export interface RencanaStore {
  items: PlanItem[];
  tambah: (hari: number, slot: Slot, teks: string) => void;
  toggle: (id: string) => void;
  hapus: (id: string) => void;
}

/** Hook Rencana Minggu — dibaca ulang saat minggu (kunci) berganti. */
export function useRencanaMinggu(idAnak: string, senin: string): RencanaStore {
  const kunci = kunciFor(idAnak, senin);
  const awal = useMemo(() => {
    try { const r = localStorage.getItem(kunci); if (r) return JSON.parse(r) as PlanItem[]; } catch { /* abaikan */ }
    return [] as PlanItem[];
  }, [kunci]);

  const [items, setItems] = useState<PlanItem[]>(awal);
  const [kAktif, setKAktif] = useState(kunci);
  if (kAktif !== kunci) {
    setKAktif(kunci);
    try { const r = localStorage.getItem(kunci); setItems(r ? (JSON.parse(r) as PlanItem[]) : []); } catch { setItems([]); }
  }

  const simpan = (n: PlanItem[]) => { setItems(n); try { localStorage.setItem(kunci, JSON.stringify(n)); } catch { /* abaikan */ } };
  const tambah = (hari: number, slot: Slot, teks: string) => {
    const t = teks.trim(); if (!t) return;
    simpan([...items, { id: `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`, hari, slot, teks: t, done: false }]);
  };
  const toggle = (id: string) => simpan(items.map(p => p.id === id ? { ...p, done: !p.done } : p));
  const hapus = (id: string) => simpan(items.filter(p => p.id !== id));
  return { items, tambah, toggle, hapus };
}
