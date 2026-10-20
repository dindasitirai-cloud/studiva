// =============================================================
// terlihatData — "Yang terlihat hari ini" (Phase 22).
// Checklist Kompas Perkembangan pindah ke Jurnal (tab Kelola) dan maknanya
// menjadi "terlihat hari ini" (bertanggal, bukti) — bukan "sedang diamati" (niat).
//
// Penyimpanan: Supabase `jurnal_hari.terlihat` (migration 032) + cache lokal
// `rekah_terlihat_<idAnak>` (dipakai juga sebagai cadangan bila 032 belum jalan).
// Penyetir saran Rekah (kurasiPapan) = id yang terlihat dalam 21 hari terakhir;
// selama belum ada catatan "terlihat" sama sekali, memakai pilihan Kompas lama
// (pengamatan_kompas) agar saran tidak tiba-tiba kehilangan arah.
// INVARIANT: tanpa skor/angka progres; bukan daftar target. Copy DRAFT → Fitri.
// =============================================================
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTerlihatRentang, simpanTerlihatHari } from '../../lib/supabase/rekah';
import { useObservasiKompas } from '../../hooks/useObservasiKompas';
import { localISO, dariISO } from './rencanaData';
import { promptById } from '../rekah-journey/observation/observationPrompts';

export type PetaTerlihat = Record<string, string[]>; // tanggal → id prompt
export const JENDELA_PENYETIR_HARI = 21;

/** Hal yang ditulis sendiri orang tua disimpan sebagai id berawalan 'tulis:'. */
export const PREFIX_TULIS = 'tulis:';
export const idTulis = (teks: string) => PREFIX_TULIS + teks.trim();
export const adalahTulis = (id: string) => id.startsWith(PREFIX_TULIS);
/** Label tampilan untuk id terlihat (prompt usia atau tulisan sendiri). */
export function labelTerlihat(id: string): string | null {
  if (adalahTulis(id)) return id.slice(PREFIX_TULIS.length) || null;
  return promptById(id)?.label ?? null;
}
const EVENT = 'rekah-terlihat';
const kunci = (idAnak: string) => `rekah_terlihat_${idAnak}`;

export function bacaCacheTerlihat(idAnak: string): PetaTerlihat {
  try { const r = localStorage.getItem(kunci(idAnak)); if (r) { const p = JSON.parse(r); if (p && typeof p === 'object') return p as PetaTerlihat; } } catch { /* abaikan */ }
  return {};
}
function tulisCache(idAnak: string, peta: PetaTerlihat): void {
  try { localStorage.setItem(kunci(idAnak), JSON.stringify(peta)); } catch { /* abaikan */ }
  try { window.dispatchEvent(new CustomEvent(EVENT, { detail: idAnak })); } catch { /* abaikan */ }
}

function tanggalMundur(dari: string, n: number): string[] {
  const out: string[] = [];
  const d = dariISO(dari);
  for (let i = 0; i < n; i += 1) { const x = new Date(d); x.setDate(d.getDate() - i); out.push(localISO(x)); }
  return out;
}

/** id → tanggal-tanggal terlihat (terbaru dulu) dalam n hari terakhir s.d. `sampai` (inklusif). */
export function terlihatDalam(peta: PetaTerlihat, sampai: string, n: number): Record<string, string[]> {
  const jendela = new Set(tanggalMundur(sampai, n));
  const out: Record<string, string[]> = {};
  for (const [tgl, ids] of Object.entries(peta)) {
    if (!jendela.has(tgl)) continue;
    for (const id of ids) { if (!out[id]) out[id] = []; out[id].push(tgl); }
  }
  for (const id of Object.keys(out)) out[id].sort((a, b) => b.localeCompare(a));
  return out;
}

let peringatanSekali = false;

export interface TerlihatStore {
  peta: PetaTerlihat;
  diHari: (tanggal: string) => string[];
  toggle: (tanggal: string, id: string) => void;
  /** Sumber penyimpanan saat ini: 'supabase' (032 aktif) atau 'lokal' (cadangan). */
  sumber: 'supabase' | 'lokal';
}

export function useTerlihat(idAnak: string): TerlihatStore {
  const [peta, setPeta] = useState<PetaTerlihat>(() => bacaCacheTerlihat(idAnak));
  const [sumber, setSumber] = useState<'supabase' | 'lokal'>('lokal');

  // Sinkron antar-komponen (Jurnal ↔ Perjalanan ↔ papan) lewat event.
  useEffect(() => {
    setPeta(bacaCacheTerlihat(idAnak));
    const h = (e: Event) => { if ((e as CustomEvent).detail === idAnak) setPeta(bacaCacheTerlihat(idAnak)); };
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, [idAnak]);

  // Muat 60 hari terakhir dari Supabase (bila 032 sudah jalan) → gabung ke cache.
  useEffect(() => {
    let batal = false;
    const tgl = tanggalMundur(localISO(new Date()), 60);
    getTerlihatRentang(idAnak, tgl)
      .then(server => {
        if (batal) return;
        const gabung: PetaTerlihat = { ...bacaCacheTerlihat(idAnak) };
        for (const t of tgl) {
          if (t in server) gabung[t] = server[t];
        }
        setSumber('supabase');
        tulisCache(idAnak, gabung);
      })
      .catch(err => {
        if (!peringatanSekali) { peringatanSekali = true; console.warn('[Jurnal] kolom jurnal_hari.terlihat belum tersedia — pakai cadangan lokal. Jalankan migration 032.', err); }
      });
    return () => { batal = true; };
  }, [idAnak]);

  const diHari = useCallback((tanggal: string) => peta[tanggal] ?? [], [peta]);

  const toggle = useCallback((tanggal: string, id: string) => {
    const kini = bacaCacheTerlihat(idAnak);
    const set = new Set(kini[tanggal] ?? []);
    if (set.has(id)) set.delete(id); else set.add(id);
    const baru: PetaTerlihat = { ...kini, [tanggal]: [...set] };
    if (baru[tanggal].length === 0) delete baru[tanggal];
    tulisCache(idAnak, baru);
    simpanTerlihatHari(idAnak, tanggal, [...set]).catch(err => {
      if (!peringatanSekali) { peringatanSekali = true; console.warn('[Jurnal] simpan terlihat ke Supabase gagal — tersimpan lokal. Jalankan migration 032.', err); }
    });
  }, [idAnak]);

  return { peta, diHari, toggle, sumber };
}

/**
 * Id pengamatan yang menyetir saran Rekah: terlihat dalam 21 hari terakhir.
 * Bila belum pernah ada catatan "terlihat", memakai pilihan Kompas lama (transisi).
 */
export function useIdPenyetir(idAnak: string): string[] {
  const { peta } = useTerlihat(idAnak);
  const lama = useObservasiKompas(idAnak);
  const kunciLama = lama.dipilih.join(',');
  return useMemo(() => {
    const adaCatatan = Object.keys(peta).length > 0;
    if (!adaCatatan) return kunciLama ? kunciLama.split(',') : [];
    return Object.keys(terlihatDalam(peta, localISO(new Date()), JENDELA_PENYETIR_HARI));
  }, [peta, kunciLama]);
}
