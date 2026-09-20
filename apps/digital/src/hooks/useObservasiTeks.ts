// =============================================================
// useObservasiTeks — catatan pengamatan teks bebas per anak.
// Caregiver menulis lalu menyimpan → masuk Jejak Perkembangan; keyword-nya
// dipakai memunculkan kegiatan cocok di Fokus. Supabase + fallback localStorage.
// =============================================================
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { catatObservasiTeks, getObservasiTeks } from '../lib/supabase/rekah';

export interface CatatanObs { teks: string; pada: string }

function kunci(idAnak: string): string {
  return `rekah_catatan_teks_${idAnak}`;
}

function bacaLocal(idAnak: string): CatatanObs[] {
  try {
    const raw = window.localStorage.getItem(kunci(idAnak));
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((e): e is CatatanObs => e && typeof e.teks === 'string' && typeof e.pada === 'string')
      .sort((a, b) => b.pada.localeCompare(a.pada));
  } catch {
    return [];
  }
}

function tulisLocal(idAnak: string, daftar: CatatanObs[]): void {
  try {
    window.localStorage.setItem(kunci(idAnak), JSON.stringify(daftar.slice(0, 200)));
  } catch {
    /* abaikan */
  }
}

export interface ObservasiTeksHook {
  daftar: CatatanObs[];
  tambah: (teks: string) => void;
}

export function useObservasiTeks(idAnak: string): ObservasiTeksHook {
  const { supabaseUser } = useAuth();
  const [daftar, setDaftar] = useState<CatatanObs[]>(() => bacaLocal(idAnak));

  useEffect(() => {
    let batal = false;
    setDaftar(bacaLocal(idAnak));
    if (!supabaseUser || !idAnak) return;
    getObservasiTeks(idAnak)
      .then(rows => {
        if (batal) return;
        const d = rows.map(r => ({ teks: r.teks, pada: r.pada }));
        setDaftar(d);
        tulisLocal(idAnak, d);
      })
      .catch(() => {
        /* tabel belum ada / offline → cache lokal */
      });
    return () => { batal = true; };
  }, [idAnak, supabaseUser]);

  const tambah = useCallback(
    (teks: string) => {
      const bersih = teks.trim();
      if (!bersih) return;
      const baru: CatatanObs = { teks: bersih, pada: new Date().toISOString() };
      setDaftar(prev => {
        const next = [baru, ...prev];
        tulisLocal(idAnak, next);
        return next;
      });
      if (supabaseUser && idAnak) {
        catatObservasiTeks(idAnak, bersih).catch(() => {
          /* gagal sync — cache lokal tetap tersimpan */
        });
      }
    },
    [idAnak, supabaseUser],
  );

  return { daftar, tambah };
}
