// =============================================================
// usePanenNilai — "mekar" per Nilai Akar Keluarga untuk halaman Panen.
// Menghitung berapa kali kegiatan yang direfleksikan pekan ini mengangkat
// tiap nilai (via TAG_NILAI_LS). Menggantikan sistem "musim" lama agar Panen
// hidup dari satu sistem nilai yang sama dengan Kompas/Bekal.
// Supabase (refleksi 7 hari) + fallback cache localStorage.
// =============================================================
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRefleksiRentang } from '../lib/supabase/rekah';
import { TAG_NILAI_LS } from '../data/tagNilaiLS.generated';
import type { NilaiAkar } from '../features/akar-keluarga/content';

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** id kegiatan (ls-act-N) → Nilai Akar yang diangkatnya. */
function nilaiDari(idKegiatan: string): NilaiAkar[] {
  const m = idKegiatan.match(/^ls-act-(\d+)$/);
  if (!m) return [];
  return TAG_NILAI_LS[`aktivitas:${m[1]}`]?.nilai ?? [];
}

function bacaLocal(idAnak: string, hari: string[]): Record<string, number> {
  const hitung: Record<string, number> = {};
  for (const tgl of hari) {
    try {
      const raw = window.localStorage.getItem(`rekah_refleksi_${idAnak}_${tgl}`);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') {
        for (const idKeg of Object.keys(obj)) {
          for (const n of nilaiDari(idKeg)) hitung[n] = (hitung[n] ?? 0) + 1;
        }
      }
    } catch {
      /* abaikan */
    }
  }
  return hitung;
}

export function usePanenNilai(idAnak: string): Record<string, number> {
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

  const [hitung, setHitung] = useState<Record<string, number>>(() => bacaLocal(idAnak, hari));

  useEffect(() => {
    let batal = false;
    setHitung(bacaLocal(idAnak, hari));
    if (!supabaseUser || !idAnak) return;
    getRefleksiRentang(idAnak, hari[0], hari[hari.length - 1])
      .then(rows => {
        if (batal) return;
        const h: Record<string, number> = {};
        for (const r of rows) {
          for (const n of nilaiDari(r.id_kegiatan)) h[n] = (h[n] ?? 0) + 1;
        }
        setHitung(h);
      })
      .catch(() => {
        /* offline → pakai cache lokal */
      });
    return () => { batal = true; };
  }, [idAnak, supabaseUser, hari]);

  return hitung;
}
