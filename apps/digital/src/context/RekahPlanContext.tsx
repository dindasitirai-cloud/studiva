import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { ComposedPlan, ActivityModuleId } from '@studiva/shared';

export interface CompletionRecord {
  moduleId: ActivityModuleId;
  completedAt: string; // ISO datetime
}

interface RekahPlanContextValue {
  plan: ComposedPlan | null;
  setPlan: (plan: ComposedPlan) => void;
  currentWeek: number;
  setCurrentWeek: (n: number) => void;
  completions: CompletionRecord[];
  swappedIds: Set<ActivityModuleId>;
  markComplete: (moduleId: ActivityModuleId) => void;
  markSwap: (moduleId: ActivityModuleId) => void;
  isComplete: (moduleId: ActivityModuleId) => boolean;
  isSwapped: (moduleId: ActivityModuleId) => boolean;
  allDone: boolean;
}

const RekahPlanContext = createContext<RekahPlanContextValue | null>(null);

export function RekahPlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<ComposedPlan | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completions, setCompletions] = useState<CompletionRecord[]>([]);
  const [swappedIds, setSwappedIds] = useState<Set<ActivityModuleId>>(new Set());

  const markComplete = useCallback((moduleId: ActivityModuleId) => {
    setCompletions(prev => {
      if (prev.some(c => c.moduleId === moduleId)) return prev;
      // TODO: POST /api/me/rekah-completions { moduleId, weekNumber: currentWeek }
      return [...prev, { moduleId, completedAt: new Date().toISOString() }];
    });
  }, []);

  const markSwap = useCallback((moduleId: ActivityModuleId) => {
    setSwappedIds(prev => {
      const next = new Set(prev);
      next.add(moduleId);
      return next;
    });
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

  const value: RekahPlanContextValue = {
    plan, setPlan,
    currentWeek, setCurrentWeek,
    completions, swappedIds,
    markComplete, markSwap,
    isComplete, isSwapped,
    allDone,
  };

  return (
    <RekahPlanContext.Provider value={value}>
      {children}
    </RekahPlanContext.Provider>
  );
}

export function useRekahPlan(): RekahPlanContextValue {
  const ctx = useContext(RekahPlanContext);
  if (!ctx) throw new Error('useRekahPlan harus digunakan di dalam RekahPlanProvider');
  return ctx;
}
