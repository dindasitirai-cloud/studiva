import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CatatanHarianIbu } from '../types';
import type { CatatanHarianRepository } from './kontrak';
import { CatatanHarianDalamMemori } from './dalamMemori';
import { SEED_CERMIN_POLA, seedCerminPola } from './fixtureDev';

// ─── Konteks ─────────────────────────────────────────────────────────────────

interface NilaiKonteksPenyimpanan {
  repo: CatatanHarianRepository;
  caregiverId: string;
  /** Bertambah satu setiap kali ada simpanDiff. Hook pakai ini sebagai dep re-fetch. */
  versi: number;
  invalidasi: () => void;
}

const KonteksPenyimpanan = createContext<NilaiKonteksPenyimpanan | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface PropsPenyimpananProvider {
  caregiverId: string;
  /**
   * Implementasi repository opsional.
   * Jika tidak diisi, pakai implementasi dalam memori.
   * Isi saat testing atau Storybook untuk menyuntikkan data tiruan.
   */
  repository?: CatatanHarianRepository;
  children: React.ReactNode;
}

export function PenyimpananProvider({
  caregiverId,
  repository,
  children,
}: PropsPenyimpananProvider) {
  // Buat instance satu kali dan biarkan stabil.
  // Menggunakan useRef supaya tidak buat ulang saat re-render.
  const repoRef = useRef<CatatanHarianRepository>(
    repository ?? new CatatanHarianDalamMemori(),
  );
  // Kalau prop repository berubah (misalnya di test), pakai yang baru.
  if (repository && repository !== repoRef.current) {
    repoRef.current = repository;
  }
  const repo = repoRef.current;

  const [versi, setVersi] = useState(0);
  const invalidasi = useCallback(() => setVersi(v => v + 1), []);

  // Fixture dev: isi 14 hari cuaca gelap jika SEED_CERMIN_POLA aktif.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!SEED_CERMIN_POLA) return;
    const hariIni = new Date().toISOString().slice(0, 10);
    seedCerminPola(repo, caregiverId, hariIni).then(invalidasi);
    // Dijalankan satu kali saat mount. Dep sengaja kosong.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nilai = useMemo<NilaiKonteksPenyimpanan>(
    () => ({ repo, caregiverId, versi, invalidasi }),
    [repo, caregiverId, versi, invalidasi],
  );

  return (
    <KonteksPenyimpanan.Provider value={nilai}>
      {children}
    </KonteksPenyimpanan.Provider>
  );
}

// ─── Hook dasar ───────────────────────────────────────────────────────────────

export function usePenyimpanan(): NilaiKonteksPenyimpanan {
  const ctx = useContext(KonteksPenyimpanan);
  if (ctx === null) {
    throw new Error('usePenyimpanan harus dipakai di dalam PenyimpananProvider');
  }
  return ctx;
}

// ─── Hook turunan: satu hari ──────────────────────────────────────────────────

/**
 * Kembalikan catatan hari itu dan fungsi simpan.
 * sedangMemuat selalu false pada implementasi dalam memori (seketika),
 * tapi ada untuk kompatibilitas saat implementasi nyata datang.
 */
export function useCatatanHari(
  caregiverId: string,
  tanggal: string,
): {
  catatan: CatatanHarianIbu | null;
  simpan: (diff: Omit<CatatanHarianIbu, 'tanggal'>) => Promise<void>;
  sedangMemuat: boolean;
} {
  const { repo, versi, invalidasi } = usePenyimpanan();
  const [catatan, setCatatan] = useState<CatatanHarianIbu | null>(null);

  useEffect(() => {
    let batal = false;
    repo.ambilRentang(caregiverId, tanggal, tanggal).then(arr => {
      if (!batal) setCatatan(arr[0] ?? null);
    });
    return () => {
      batal = true;
    };
  }, [repo, caregiverId, tanggal, versi]);

  const simpan = useCallback(
    async (diff: Omit<CatatanHarianIbu, 'tanggal'>) => {
      await repo.simpanDiff(caregiverId, { ...diff, tanggal });
      invalidasi();
    },
    [repo, caregiverId, tanggal, invalidasi],
  );

  return { catatan, simpan, sedangMemuat: false };
}

// ─── Hook turunan: rentang ────────────────────────────────────────────────────

/**
 * Kembalikan catatan dalam rentang tanggal inklusif, terurut naik.
 * Hari tanpa catatan tidak ada dalam array.
 */
export function useRiwayat(
  caregiverId: string,
  dariTanggal: string,
  sampaiTanggal: string,
): {
  catatan: CatatanHarianIbu[];
  sedangMemuat: boolean;
} {
  const { repo, versi } = usePenyimpanan();
  const [catatan, setCatatan] = useState<CatatanHarianIbu[]>([]);

  useEffect(() => {
    let batal = false;
    repo.ambilRentang(caregiverId, dariTanggal, sampaiTanggal).then(arr => {
      if (!batal) setCatatan(arr);
    });
    return () => {
      batal = true;
    };
  }, [repo, caregiverId, dariTanggal, sampaiTanggal, versi]);

  return { catatan, sedangMemuat: false };
}
