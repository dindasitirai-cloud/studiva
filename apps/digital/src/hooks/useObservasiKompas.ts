// =============================================================
// useObservasiKompas — pengamatan Development Compass per anak.
// Menyimpan id prompt observasi (tahap perkembangan) yang ditandai caregiver.
// Berubah sesuai usia anak (daftar prompt) + pengamatan caregiver (pilihan).
//
// Persistensi: Supabase (tabel pengamatan_kompas, per anak) sebagai sumber utama,
// dengan localStorage sebagai cache offline / fallback bila migration belum jalan
// atau tidak ada sesi. Fokus minggu ini (turunan) otomatis ikut lintas perangkat.
// =============================================================
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getPengamatanKompas,
  tandaiPengamatan,
  hapusPengamatan,
  catatJejakPengamatan,
} from '../lib/supabase/rekah';
import { appendJejakLocal } from './useJejakPengamatan';

function kunci(idAnak: string): string {
  return `rekah_observasi_kompas_${idAnak}`;
}

function bacaLocal(idAnak: string): string[] {
  try {
    const raw = window.localStorage.getItem(kunci(idAnak));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function tulisLocal(idAnak: string, ids: string[]): void {
  try {
    window.localStorage.setItem(kunci(idAnak), JSON.stringify(ids));
  } catch {
    /* mode privat / storage tidak tersedia — abaikan */
  }
}

export interface ObservasiKompasHook {
  dipilih: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
}

export function useObservasiKompas(idAnak: string): ObservasiKompasHook {
  const { supabaseUser } = useAuth();
  const [ids, setIds] = useState<string[]>(() => bacaLocal(idAnak));

  // Muat dari Supabase (sumber utama); fallback ke cache lokal yang sudah di-seed.
  useEffect(() => {
    let batal = false;
    setIds(bacaLocal(idAnak)); // seed cepat dari cache
    if (!supabaseUser || !idAnak) return;
    getPengamatanKompas(idAnak)
      .then(rows => {
        if (batal) return;
        const serverIds = rows.map(r => r.id_prompt);
        setIds(serverIds);
        tulisLocal(idAnak, serverIds);
      })
      .catch(() => {
        /* tabel belum ada / offline → tetap pakai cache lokal */
      });
    return () => { batal = true; };
  }, [idAnak, supabaseUser]);

  const toggle = useCallback(
    (id: string) => {
      setIds(prev => {
        const ada = prev.includes(id);
        const next = ada ? prev.filter(x => x !== id) : [...prev, id];
        tulisLocal(idAnak, next); // cache optimistik
        const aksi: 'tandai' | 'lepas' = ada ? 'lepas' : 'tandai';
        appendJejakLocal(idAnak, id, aksi); // log kontinuitas (lokal)
        if (supabaseUser && idAnak) {
          (ada ? hapusPengamatan(idAnak, id) : tandaiPengamatan(idAnak, id)).catch(() => {
            /* gagal sync — cache lokal tetap tersimpan */
          });
          catatJejakPengamatan(idAnak, id, aksi).catch(() => {
            /* gagal sync jejak — log lokal tetap tersimpan */
          });
        }
        return next;
      });
    },
    [idAnak, supabaseUser],
  );

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { dipilih: ids, has, toggle };
}
