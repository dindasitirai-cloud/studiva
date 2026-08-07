// ============================================================================
// JurnalRekahContext — jurnal per anak (tabel rekah_jurnal).
//
// Perubahan dari versi Express: id entri tidak lagi dibuat klien
// (`jurnal-refleksi-${Date.now()}`). Dua entri yang dibuat pada milidetik yang
// sama akan bertabrakan, dan id itu juga bocor ke UI sebagai key React.
// Sekarang database yang memberi UUID, dan entri hasil simpan dipakai apa
// adanya — jadi id di layar selalu id yang sungguh tersimpan.
// ============================================================================

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react';
import type { NilaiId } from '@studiva/shared';
import { useAnak } from './AnakContext';
import { getJurnal, tambahJurnal, hapusJurnal } from '../lib/supabase/rekahMusim';
import { dispatchRekahError } from '../utils/rekahApiError';

export interface EntriJurnalRekah {
  id: string;
  judul: string;
  catatan: string;
  tanggal: string;
  nilaiId?: NilaiId;
  tag?: 'refleksi' | 'penutup-musim' | 'manual';
}

interface JurnalRekahContextValue {
  entri: EntriJurnalRekah[];
  /** Menyimpan entri baru. Tidak menerima id — database yang memberikannya. */
  addEntri: (entri: Omit<EntriJurnalRekah, 'id'>) => Promise<void>;
  addEntriFromRefleksi: (params: { judul: string; catatan: string; tanggal: string; nilaiId?: NilaiId }) => Promise<void>;
  addEntriFromMusim: (params: { judul: string; catatan: string; tanggal: string }) => Promise<void>;
  hapusEntri: (id: string) => Promise<void>;
}

const JurnalRekahContext = createContext<JurnalRekahContextValue | null>(null);

export function JurnalRekahProvider({ children }: { children: React.ReactNode }) {
  const { anakAktif } = useAnak();
  const idAnak = anakAktif?.id ?? null;
  const [entri, setEntri] = useState<EntriJurnalRekah[]>([]);

  useEffect(() => {
    if (!idAnak) { setEntri([]); return; }
    let batal = false;

    void getJurnal(idAnak)
      .then(baris => {
        if (batal) return;
        setEntri(baris.map(b => ({
          id: b.id,
          judul: b.judul,
          catatan: b.catatan,
          tanggal: b.tanggal,
          nilaiId: (b.id_nilai ?? undefined) as NilaiId | undefined,
          tag: b.tag,
        })));
      })
      .catch(() => { /* gagal muat — mulai dari kosong */ });

    return () => { batal = true; };
  }, [idAnak]);

  const addEntri = useCallback(
    async (baru: Omit<EntriJurnalRekah, 'id'>) => {
      if (!idAnak) return;
      try {
        const baris = await tambahJurnal({
          idAnak,
          judul: baru.judul,
          catatan: baru.catatan,
          tanggal: baru.tanggal,
          idNilai: baru.nilaiId ?? null,
          tag: baru.tag ?? 'manual',
        });
        setEntri(prev => [{
          id: baris.id,
          judul: baris.judul,
          catatan: baris.catatan,
          tanggal: baris.tanggal,
          nilaiId: (baris.id_nilai ?? undefined) as NilaiId | undefined,
          tag: baris.tag,
        }, ...prev]);
      } catch {
        dispatchRekahError('Koneksi terputus — catatan tadi belum tersimpan. Coba lagi ya.');
      }
    },
    [idAnak],
  );

  const addEntriFromRefleksi = useCallback(
    (params: { judul: string; catatan: string; tanggal: string; nilaiId?: NilaiId }) =>
      addEntri({ ...params, tag: 'refleksi' }),
    [addEntri],
  );

  const addEntriFromMusim = useCallback(
    (params: { judul: string; catatan: string; tanggal: string }) =>
      addEntri({ ...params, tag: 'penutup-musim' }),
    [addEntri],
  );

  const hapusEntri = useCallback(async (id: string) => {
    const sebelum = entri;
    setEntri(prev => prev.filter(e => e.id !== id));
    try {
      await hapusJurnal(id);
    } catch {
      setEntri(sebelum);
      dispatchRekahError('Catatan belum terhapus. Coba lagi ya.');
    }
  }, [entri]);

  const value = useMemo<JurnalRekahContextValue>(
    () => ({ entri, addEntri, addEntriFromRefleksi, addEntriFromMusim, hapusEntri }),
    [entri, addEntri, addEntriFromRefleksi, addEntriFromMusim, hapusEntri],
  );

  return (
    <JurnalRekahContext.Provider value={value}>
      {children}
    </JurnalRekahContext.Provider>
  );
}

export function useJurnalRekah(): JurnalRekahContextValue {
  const ctx = useContext(JurnalRekahContext);
  if (!ctx) throw new Error('useJurnalRekah harus digunakan di dalam JurnalRekahProvider');
  return ctx;
}
