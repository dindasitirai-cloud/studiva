// =============================================================
// useRefleksiKegiatan — tahap REFLECT dalam Family Journey Map.
// Refleksi lembut satu-ketuk setelah kegiatan dilakukan (tanpa skor):
//   Menyenangkan · Terlalu sulit · Kurang cocok · Ingin ulang
// Disimpan per anak per tanggal per kegiatan.
// Persistensi: Supabase (refleksi_kegiatan) + fallback localStorage.
// =============================================================
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getRefleksiKegiatan,
  simpanRefleksi,
  hapusRefleksi,
} from '../lib/supabase/rekah';

export type HasilRefleksi = 'menyenangkan' | 'terlalu_sulit' | 'kurang_cocok' | 'ingin_ulang';

export const OPSI_REFLEKSI: ReadonlyArray<{ id: HasilRefleksi; label: string }> = [
  { id: 'menyenangkan', label: 'Menyenangkan' },
  { id: 'terlalu_sulit', label: 'Terlalu sulit' },
  { id: 'kurang_cocok', label: 'Kurang cocok' },
  { id: 'ingin_ulang', label: 'Ingin ulang' },
];

const HASIL_VALID = new Set<string>(OPSI_REFLEKSI.map(o => o.id));

function kunci(idAnak: string, tanggal: string): string {
  return `rekah_refleksi_${idAnak}_${tanggal}`;
}

function bacaLocal(idAnak: string, tanggal: string): Record<string, HasilRefleksi> {
  try {
    const raw = window.localStorage.getItem(kunci(idAnak, tanggal));
    const obj = raw ? JSON.parse(raw) : {};
    const out: Record<string, HasilRefleksi> = {};
    if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'string' && HASIL_VALID.has(v)) out[k] = v as HasilRefleksi;
      }
    }
    return out;
  } catch {
    return {};
  }
}

function tulisLocal(idAnak: string, tanggal: string, map: Record<string, HasilRefleksi>): void {
  try {
    window.localStorage.setItem(kunci(idAnak, tanggal), JSON.stringify(map));
  } catch {
    /* abaikan */
  }
}

export interface RefleksiKegiatanHook {
  get: (idKegiatan: string) => HasilRefleksi | null;
  /** hasil = null untuk menghapus refleksi. */
  set: (idKegiatan: string, hasil: HasilRefleksi | null) => void;
}

export function useRefleksiKegiatan(idAnak: string, tanggal: string): RefleksiKegiatanHook {
  const { supabaseUser } = useAuth();
  const [map, setMap] = useState<Record<string, HasilRefleksi>>(() => bacaLocal(idAnak, tanggal));

  useEffect(() => {
    let batal = false;
    setMap(bacaLocal(idAnak, tanggal)); // seed cepat dari cache
    if (!supabaseUser || !idAnak) return;
    getRefleksiKegiatan(idAnak, tanggal)
      .then(rows => {
        if (batal) return;
        const next: Record<string, HasilRefleksi> = {};
        for (const r of rows) {
          if (HASIL_VALID.has(r.hasil)) next[r.id_kegiatan] = r.hasil as HasilRefleksi;
        }
        setMap(next);
        tulisLocal(idAnak, tanggal, next);
      })
      .catch(() => {
        /* tabel belum ada / offline → pakai cache lokal */
      });
    return () => { batal = true; };
  }, [idAnak, tanggal, supabaseUser]);

  const set = useCallback(
    (idKegiatan: string, hasil: HasilRefleksi | null) => {
      setMap(prev => {
        const next = { ...prev };
        if (hasil === null) delete next[idKegiatan];
        else next[idKegiatan] = hasil;
        tulisLocal(idAnak, tanggal, next);
        if (supabaseUser && idAnak) {
          (hasil === null
            ? hapusRefleksi(idAnak, tanggal, idKegiatan)
            : simpanRefleksi(idAnak, tanggal, idKegiatan, hasil)
          ).catch(() => {
            /* gagal sync — cache lokal tetap tersimpan */
          });
        }
        return next;
      });
    },
    [idAnak, tanggal, supabaseUser],
  );

  const get = useCallback((idKegiatan: string) => map[idKegiatan] ?? null, [map]);

  return { get, set };
}
