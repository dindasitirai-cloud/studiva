import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { ComposedPlan, ActivityModuleId } from '@studiva/shared';
import { api } from '../api/client';
import { useAuth } from './AuthContext';
import { useRekahProfile } from './RekahProfileContext';
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

export function RekahPlanProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { serverCurrentWeek, serverMusimKe, profileLoading } = useRekahProfile();

  const [plan, setPlan] = useState<ComposedPlan | null>(null);
  const [currentWeek, setCurrentWeekState] = useState(1);
  const [musimKe, setMusimKeState] = useState(1);
  const [completions, setCompletions] = useState<CompletionRecord[]>([]);
  const [swappedIds, setSwappedIds] = useState<Set<ActivityModuleId>>(new Set());

  // Sync currentWeek + musimKe from server once profile loads
  useEffect(() => {
    if (!profileLoading) {
      setCurrentWeekState(serverCurrentWeek);
      setMusimKeState(serverMusimKe);
    }
  }, [serverCurrentWeek, serverMusimKe, profileLoading]);

  // Load completions for current week when profile loads
  useEffect(() => {
    if (!user || profileLoading) return;
    api.get('/rekah/completions', { params: { mingguKe: serverCurrentWeek, musimKe: serverMusimKe } })
      .then(res => {
        setCompletions(
          (res.data.completions ?? []).map((c: { moduleId: string; completedAt: string }) => ({
            moduleId: c.moduleId as ActivityModuleId,
            completedAt: c.completedAt,
          })),
        );
      })
      .catch(() => { /* gagal muat completions — mulai dari kosong */ });
  }, [user?.id, serverCurrentWeek, serverMusimKe, profileLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const setCurrentWeek = useCallback((n: number) => {
    setCurrentWeekState(n);
    setCompletions([]); // reset completions untuk pekan baru
    api.patch('/rekah/profile/state', { currentWeek: n }).catch(() => {
      dispatchRekahError('Koneksi terputus — pekan tidak tersimpan. Coba lagi ya.');
    });
  }, []);

  const setMusimKe = useCallback((n: number) => {
    setMusimKeState(n);
    api.patch('/rekah/profile/state', { musimKe: n }).catch(() => {
      dispatchRekahError('Koneksi terputus — musim tidak tersimpan. Coba lagi ya.');
    });
  }, []);

  const markComplete = useCallback(
    (moduleId: ActivityModuleId) => {
      setCompletions(prev => {
        if (prev.some(c => c.moduleId === moduleId)) return prev;
        const record: CompletionRecord = { moduleId, completedAt: new Date().toISOString() };
        // Fire-and-forget; tidak rollback UI supaya pengalaman tetap lancar
        api.post('/rekah/completions', { moduleId, mingguKe: currentWeek, musimKe }).catch(() => {
          dispatchRekahError('Koneksi terputus — cerita tadi belum tersimpan. Coba lagi ya.');
        });
        return [...prev, record];
      });
    },
    [currentWeek, musimKe],
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
      const newSteps = plan.steps.map(s =>
        s.moduleId === oldId ? { ...s, moduleId: newId } : s,
      );
      setPlan({ ...plan, steps: newSteps });
      // TODO: persist week plan to backend — PUT /api/rekah/week-plan
    },
    [plan, setPlan],
  );

  const addStep = useCallback(
    (moduleId: ActivityModuleId): 'ok' | 'penuh' | 'duplikat' => {
      if (!plan) return 'duplikat';
      if (plan.steps.length >= 7) return 'penuh';
      if (plan.steps.some(s => s.moduleId === moduleId)) return 'duplikat';
      const newSteps = [
        ...plan.steps,
        { moduleId, posisi: plan.steps.length + 1 },
      ];
      setPlan({ ...plan, steps: newSteps });
      // TODO: persist week plan to backend — PUT /api/rekah/week-plan
      return 'ok';
    },
    [plan, setPlan],
  );

  const value: RekahPlanContextValue = {
    plan, setPlan,
    currentWeek, setCurrentWeek,
    musimKe, setMusimKe,
    completions, swappedIds,
    markComplete, markSwap,
    isComplete, isSwapped,
    allDone,
    swapStep, addStep,
  };

  return <RekahPlanContext.Provider value={value}>{children}</RekahPlanContext.Provider>;
}

export function useRekahPlan(): RekahPlanContextValue {
  const ctx = useContext(RekahPlanContext);
  if (!ctx) throw new Error('useRekahPlan harus digunakan di dalam RekahPlanProvider');
  return ctx;
}
