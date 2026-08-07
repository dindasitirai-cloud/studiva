// ============================================================================
// RekahPlanContext — rencana pekan dan langkah yang sudah selesai, per anak.
//
// Perubahan dari versi Express:
//   - Semua tulisan di-key ke id_anak, bukan user_id.
//   - swapStep/addStep sekarang BENAR-BENAR tersimpan. Dua `// TODO: persist
//     week plan to backend` sebelumnya membuat perubahan rencana hilang begitu
//     halaman dimuat ulang — endpoint PUT /rekah/week-plan sudah ada tapi tidak
//     pernah dipanggil.
//   - markComplete tidak lagi mengecek duplikat sebelum menulis; UNIQUE di
//     database yang menyaring, jadi dua tab tidak bisa berlomba.
// ============================================================================

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import type { ComposedPlan, ActivityModuleId } from '@studiva/shared';
import { useAnak } from './AnakContext';
import { useRekahProfile } from './RekahProfileContext';
import {
  getLangkahSelesai,
  tandaiLangkahSelesai,
  getRencanaPekan,
  simpanRencanaPekan,
  perbaruiMusimBerjalan,
} from '../lib/supabase/rekahMusim';
import { dispatchRekahError } from '../utils/rekahApiError';

export interface CompletionRecord {
  moduleId: ActivityModuleId;
  completedAt: string;
}

interface RekahPlanContextValue {
  plan: ComposedPlan | null;
  setPlan: (plan: ComposedPlan | null) => void;
  currentWeek: number;
  setCurrentWeek: (n: number) => void;
  musimKe: number;
  setMusimKe: (n: number) => void;
  completions: CompletionRecord[];
  swappedIds: Set<ActivityModuleId>;
  markComplete: (moduleId: ActivityModuleId) => void;
  markSwap: (moduleId: ActivityModuleId) => void;
  isComplete: (moduleId: ActivityModuleId) => boolean;
  isSwapped: (moduleId: ActivityModuleId) => boolean;
  allDone: boolean;
  swapStep: (oldId: ActivityModuleId, newId: ActivityModuleId) => void;
  addStep: (moduleId: ActivityModuleId) => 'ok' | 'penuh' | 'duplikat';
}

const RekahPlanContext = createContext<RekahPlanContextValue | null>(null);

const MAKS_LANGKAH_PEKAN = 7;

export function RekahPlanProvider({ children }: { children: React.ReactNode }) {
  const { anakAktif } = useAnak();
  const { serverCurrentWeek, serverMusimKe, profileLoading, idMusimBerjalan } = useRekahProfile();
  const idAnak = anakAktif?.id ?? null;

  const [plan, setPlan] = useState<ComposedPlan | null>(null);
  const [currentWeek, setCurrentWeekState] = useState(1);
  const [musimKe, setMusimKeState] = useState(1);
  const [completions, setCompletions] = useState<CompletionRecord[]>([]);
  const [swappedIds, setSwappedIds] = useState<Set<ActivityModuleId>>(new Set());

  // Ikuti musim yang dimuat RekahProfileContext.
  useEffect(() => {
    if (!profileLoading) {
      setCurrentWeekState(serverCurrentWeek);
      setMusimKeState(serverMusimKe);
    }
  }, [serverCurrentWeek, serverMusimKe, profileLoading]);

  // Ganti anak = buang rencana & langkah anak sebelumnya. Tanpa ini, langkah
  // anak pertama sempat terlihat di layar anak kedua sebelum muatan selesai.
  useEffect(() => {
    setPlan(null);
    setCompletions([]);
    setSwappedIds(new Set());
  }, [idAnak]);

  // Muat langkah selesai untuk pekan berjalan.
  useEffect(() => {
    if (!idAnak || profileLoading) return;
    let batal = false;

    void getLangkahSelesai(idAnak, serverMusimKe, serverCurrentWeek)
      .then(baris => {
        if (batal) return;
        setCompletions(
          baris.map(b => ({
            moduleId: b.id_modul as ActivityModuleId,
            completedAt: b.selesai_pada,
          })),
        );
      })
      .catch(() => { /* gagal muat — mulai dari kosong, bukan galat fatal */ });

    return () => { batal = true; };
  }, [idAnak, serverMusimKe, serverCurrentWeek, profileLoading]);

  /** Simpan urutan modul pekan ini. Dipanggil setiap plan berubah oleh pengguna. */
  const simpanRencana = useCallback(
    (steps: { moduleId: ActivityModuleId }[]) => {
      if (!idAnak) return;
      void simpanRencanaPekan({
        idAnak,
        musimKe,
        mingguKe: currentWeek,
        idModul: steps.map(s => s.moduleId),
      }).catch(() => {
        dispatchRekahError('Koneksi terputus — perubahan rencana belum tersimpan. Coba lagi ya.');
      });
    },
    [idAnak, musimKe, currentWeek],
  );

  const setCurrentWeek = useCallback(
    (n: number) => {
      setCurrentWeekState(n);
      setCompletions([]); // pekan baru, hitungan mulai dari nol
      if (!idMusimBerjalan) return;
      void perbaruiMusimBerjalan(idMusimBerjalan, { mingguKe: n }).catch(() => {
        dispatchRekahError('Koneksi terputus — pekan tidak tersimpan. Coba lagi ya.');
      });
    },
    [idMusimBerjalan],
  );

  // Musim tidak lagi diubah lewat sini — pergantian musim melewati tutupMusim()
  // yang membuat baris baru. Setter ini hanya menyelaraskan state lokal.
  const setMusimKe = useCallback((n: number) => setMusimKeState(n), []);

  const markComplete = useCallback(
    (moduleId: ActivityModuleId) => {
      if (!idAnak) return;
      setCompletions(prev => {
        if (prev.some(c => c.moduleId === moduleId)) return prev;
        return [...prev, { moduleId, completedAt: new Date().toISOString() }];
      });
      void tandaiLangkahSelesai({ idAnak, idModul: moduleId, musimKe, mingguKe: currentWeek })
        .catch(() => {
          dispatchRekahError('Koneksi terputus — langkah tadi belum tersimpan. Coba lagi ya.');
        });
    },
    [idAnak, currentWeek, musimKe],
  );

  const markSwap = useCallback((moduleId: ActivityModuleId) => {
    setSwappedIds(prev => { const n = new Set(prev); n.add(moduleId); return n; });
  }, []);

  const isComplete = useCallback(
    (moduleId: ActivityModuleId) => completions.some(c => c.moduleId === moduleId),
    [completions],
  );
  const isSwapped = useCallback(
    (moduleId: ActivityModuleId) => swappedIds.has(moduleId),
    [swappedIds],
  );

  const allDone = useMemo(() => {
    if (!plan || plan.steps.length === 0) return false;
    return plan.steps.every(s => isComplete(s.moduleId));
  }, [plan, isComplete]);

  const swapStep = useCallback(
    (oldId: ActivityModuleId, newId: ActivityModuleId) => {
      if (!plan) return;
      const newSteps = plan.steps.map(s => (s.moduleId === oldId ? { ...s, moduleId: newId } : s));
      setPlan({ ...plan, steps: newSteps });
      simpanRencana(newSteps);
    },
    [plan, simpanRencana],
  );

  const addStep = useCallback(
    (moduleId: ActivityModuleId): 'ok' | 'penuh' | 'duplikat' => {
      if (!plan) return 'duplikat';
      if (plan.steps.length >= MAKS_LANGKAH_PEKAN) return 'penuh';
      if (plan.steps.some(s => s.moduleId === moduleId)) return 'duplikat';
      const newSteps = [...plan.steps, { moduleId, posisi: plan.steps.length + 1 }];
      setPlan({ ...plan, steps: newSteps });
      simpanRencana(newSteps);
      return 'ok';
    },
    [plan, simpanRencana],
  );

  const value = useMemo<RekahPlanContextValue>(() => ({
    plan, setPlan,
    currentWeek, setCurrentWeek,
    musimKe, setMusimKe,
    completions, swappedIds,
    markComplete, markSwap,
    isComplete, isSwapped,
    allDone,
    swapStep, addStep,
  }), [
    plan, currentWeek, setCurrentWeek, musimKe, setMusimKe, completions, swappedIds,
    markComplete, markSwap, isComplete, isSwapped, allDone, swapStep, addStep,
  ]);

  return <RekahPlanContext.Provider value={value}>{children}</RekahPlanContext.Provider>;
}

export function useRekahPlan(): RekahPlanContextValue {
  const ctx = useContext(RekahPlanContext);
  if (!ctx) throw new Error('useRekahPlan harus digunakan di dalam RekahPlanProvider');
  return ctx;
}

/**
 * Memuat rencana pekan yang tersimpan (hasil Ganti/Tambah langkah).
 * Dipisah dari provider supaya layar yang menyusun ComposedPlan bisa
 * memutuskan sendiri kapan menimpa hasil rotasi dengan rencana tersimpan.
 */
export async function muatRencanaTersimpan(
  idAnak: string,
  musimKe: number,
  mingguKe: number,
): Promise<ActivityModuleId[] | null> {
  const ids = await getRencanaPekan(idAnak, musimKe, mingguKe);
  return ids as ActivityModuleId[] | null;
}
