// =============================================================
// useRingkasanMinggu — bahan Weekly Review (menutup loop Family Journey).
// Mengagregasi refleksi kegiatan 7 hari terakhir per anak menjadi hitungan per hasil.
// Supabase (rentang tanggal) + fallback localStorage (cache harian refleksi).
// =============================================================
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRefleksiRentang } from '../lib/supabase/rekah';
import { OPSI_REFLEKSI, type HasilRefleksi } from './useRefleksiKegiatan';

const HASIL_VALID = new Set<string>(OPSI_REFLEKSI.map(o => o.id));

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function hitungKosong(): Record<HasilRefleksi, number> {
  return { menyenangkan: 0, terlalu_sulit: 0, kurang_cocok: 0, ingin_ulang: 0 };
}

function bacaLocal(idAnak: string, hari: string[]): Record<HasilRefleksi, number> {
  const h = hitungKosong();
  for (const tgl of hari) {
    try {
      const raw = window.localStorage.getItem(`rekah_refleksi_${idAnak}_${tgl}`);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') {
        for (const v of Object.values(obj)) {
          if (typeof v === 'string' && HASIL_VALID.has(v)) h[v as HasilRefleksi] += 1;
        }
      }
    } catch {
      /* abaikan */
    }
  }
  return h;
}

export interface RingkasanMinggu {
  total: number;
  hitung: Record<HasilRefleksi, number>;
  tglAwal: string;
  tglAkhir: string;
}

export function useRingkasanMinggu(idAnak: string): RingkasanMinggu {
  const { supabaseUser } = useAuth();

  const hari = useMemo(() => {
    const arr: string[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      arr.push(fmt(d));
    }
    return arr;
  }, []);

  const tglAwal = hari[0];
  const tglAkhir = hari[hari.length - 1];

  const [hitung, setHitung] = useState<Record<HasilRefleksi, number>>(() => bacaLocal(idAnak, hari));

  useEffect(() => {
    let batal = false;
    setHitung(bacaLocal(idAnak, hari));
    if (!supabaseUser || !idAnak) return;
    getRefleksiRentang(idAnak, tglAwal, tglAkhir)
      .then(rows => {
        if (batal) return;
        const h = hitungKosong();
        for (const r of rows) {
          if (HASIL_VALID.has(r.hasil)) h[r.hasil as HasilRefleksi] += 1;
        }
        setHitung(h);
      })
      .catch(() => {
        /* tabel belum ada / offline → pakai cache lokal */
      });
    return () => { batal = true; };
  }, [idAnak, supabaseUser, tglAwal, tglAkhir]);

  const total = hitung.menyenangkan + hitung.terlalu_sulit + hitung.kurang_cocok + hitung.ingin_ulang;

  return { total, hitung, tglAwal, tglAkhir };
}
