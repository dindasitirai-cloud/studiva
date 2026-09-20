// =============================================================
// useFokusMingguIni — "Current Focus" untuk Family Journey Map.
// Fokus ditentukan dari Kompas Keluarga (disarankan dari nilai keluarga),
// dan orang tua dapat mengupdatenya. Fokus inilah yang menyaring ide Bekal.
//
// v1: disimpan lokal per anak (localStorage) — additive, tanpa perubahan
// skema DB / artefak frozen. Bisa dipromosikan ke Supabase di fase berikut.
// =============================================================
import { useCallback, useEffect, useState } from 'react';
import type { NilaiAkar } from '../features/akar-keluarga/content';
import { NILAI } from '../features/akar-keluarga/content';

const NILAI_SET = new Set<string>(NILAI);

function kunci(idAnak: string): string {
  return `rekah_fokus_minggu_${idAnak}`;
}

function bacaLocal(idAnak: string): NilaiAkar | null {
  try {
    const v = window.localStorage.getItem(kunci(idAnak));
    return v && NILAI_SET.has(v) ? (v as NilaiAkar) : null;
  } catch {
    return null;
  }
}

export interface FokusMingguHook {
  /** Fokus efektif: tersimpan bila ada, jika belum → saran default. */
  fokus: NilaiAkar | null;
  /** Fokus yang benar-benar dipilih orang tua (null bila belum pernah). */
  fokusTersimpan: NilaiAkar | null;
  /** Saran default dari nilai keluarga. */
  saran: NilaiAkar | null;
  setFokus: (n: NilaiAkar | null) => void;
}

export function useFokusMingguIni(
  idAnak: string,
  nilaiKeluarga: readonly NilaiAkar[],
): FokusMingguHook {
  const saran: NilaiAkar | null = nilaiKeluarga.length > 0 ? nilaiKeluarga[0] : null;
  const [tersimpan, setTersimpan] = useState<NilaiAkar | null>(() => bacaLocal(idAnak));

  // Muat ulang saat anak aktif berganti.
  useEffect(() => {
    setTersimpan(bacaLocal(idAnak));
  }, [idAnak]);

  const setFokus = useCallback(
    (n: NilaiAkar | null) => {
      setTersimpan(n);
      try {
        if (n) window.localStorage.setItem(kunci(idAnak), n);
        else window.localStorage.removeItem(kunci(idAnak));
      } catch {
        /* mode privat / storage tidak tersedia — abaikan */
      }
    },
    [idAnak],
  );

  return { fokus: tersimpan ?? saran, fokusTersimpan: tersimpan, saran, setFokus };
}
