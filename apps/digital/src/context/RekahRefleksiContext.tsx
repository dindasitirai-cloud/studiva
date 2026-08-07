// ============================================================================
// RekahRefleksiContext — CeritaHariIni per anak (tabel rekah_refleksi).
//
// Perubahan dari versi Express:
//   - Di-key ke id_anak, bukan user_id.
//   - addEntry tidak lagi menerima `id`. Idempotensi datang dari UNIQUE
//     (id_anak, id_modul, tanggal) di database, bukan dari `refleksi-${Date.now()}`
//     buatan klien yang bisa bertabrakan dan tidak menghalangi duplikat dari
//     dua tab.
//
// refleksiMusim disimpan di kolom rekah_musim.refleksi_musim, bukan di sini —
// ia milik musim, bukan milik satu langkah. Context ini hanya menyimpannya di
// memori sampai PenutupMusimFlow menuliskannya bersama penutupan musim.
// ============================================================================

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react';
import type { RefleksiEntry, RefleksiMusim, NilaiId } from '@studiva/shared';
import { useAnak } from './AnakContext';
import { useRekahProfile } from './RekahProfileContext';
import { getRefleksi, simpanRefleksi } from '../lib/supabase/rekahMusim';
import { dispatchRekahError } from '../utils/rekahApiError';

/** Entri baru dari UI: tanpa id, karena database yang memberikannya. */
export type RefleksiBaru = Omit<RefleksiEntry, 'id'>;

interface RekahRefleksiContextValue {
  entries: RefleksiEntry[];
  refleksiMusim: RefleksiMusim | null;
  addEntry: (entry: RefleksiBaru) => Promise<void>;
  setRefleksiMusim: (r: RefleksiMusim) => void;
}

const RekahRefleksiContext = createContext<RekahRefleksiContextValue | null>(null);

export function RekahRefleksiProvider({ children }: { children: React.ReactNode }) {
  const { anakAktif } = useAnak();
  const { serverMusimKe, profileLoading } = useRekahProfile();
  const idAnak = anakAktif?.id ?? null;

  const [entries, setEntries] = useState<RefleksiEntry[]>([]);
  const [refleksiMusim, setRefleksiMusim] = useState<RefleksiMusim | null>(null);

  useEffect(() => {
    if (!idAnak || profileLoading) { setEntries([]); return; }
    let batal = false;

    void getRefleksi(idAnak, serverMusimKe)
      .then(baris => {
        if (batal) return;
        setEntries(baris.map(b => ({
          id: b.id,
          moduleId: b.id_modul,
          tanggal: b.tanggal,
          responsAnak: b.respon_anak,
          moodCaregiver: b.mood_pendamping ?? undefined,
          catatan: b.catatan ?? undefined,
          nilaiUtama: (b.nilai_utama ?? undefined) as NilaiId | undefined,
          simpanKeJurnal: b.simpan_ke_jurnal,
        })));
      })
      .catch(() => { /* gagal muat — mulai dari kosong */ });

    return () => { batal = true; };
  }, [idAnak, serverMusimKe, profileLoading]);

  // Refleksi musim milik musim; buang saat ganti anak atau ganti musim.
  useEffect(() => { setRefleksiMusim(null); }, [idAnak, serverMusimKe]);

  const addEntry = useCallback(
    async (baru: RefleksiBaru) => {
      if (!idAnak) return;

      // Optimistis dengan id sementara. Diganti id sungguhan saat muat ulang
      // berikutnya; sampai saat itu ia hanya dipakai sebagai key React.
      const idSementara = `sementara-${baru.moduleId}-${baru.tanggal}`;
      setEntries(prev =>
        prev.some(e => e.moduleId === baru.moduleId && e.tanggal === baru.tanggal)
          ? prev
          : [...prev, { ...baru, id: idSementara }],
      );

      try {
        await simpanRefleksi({
          idAnak,
          idModul: baru.moduleId,
          tanggal: baru.tanggal,
          responAnak: baru.responsAnak,
          moodPendamping: baru.moodCaregiver ?? null,
          catatan: baru.catatan ?? null,
          nilaiUtama: baru.nilaiUtama ?? null,
          simpanKeJurnal: baru.simpanKeJurnal ?? false,
          musimKe: serverMusimKe,
        });
      } catch {
        setEntries(prev => prev.filter(e => e.id !== idSementara));
        dispatchRekahError('Koneksi terputus — cerita tadi belum tersimpan. Coba lagi ya.');
      }
    },
    [idAnak, serverMusimKe],
  );

  const value = useMemo<RekahRefleksiContextValue>(
    () => ({ entries, refleksiMusim, addEntry, setRefleksiMusim }),
    [entries, refleksiMusim, addEntry],
  );

  return (
    <RekahRefleksiContext.Provider value={value}>
      {children}
    </RekahRefleksiContext.Provider>
  );
}

export function useRekahRefleksi(): RekahRefleksiContextValue {
  const ctx = useContext(RekahRefleksiContext);
  if (!ctx) throw new Error('useRekahRefleksi harus digunakan di dalam RekahRefleksiProvider');
  return ctx;
}
