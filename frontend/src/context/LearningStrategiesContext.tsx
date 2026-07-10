import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  ACTIVITIES as STATIC_ACTIVITIES,
  WEEKLY_PLANS as STATIC_PLANS,
  EDU_TOOLS as STATIC_TOOLS,
  DOWNLOADABLES as STATIC_DOWNLOADS,
  Activity, WeeklyPlan, EduTool, Downloadable,
} from '../data/learningStrategies';

// TODO: sync all state to backend API once endpoints are ready

// followedPlanIds is keyed by childId (or '__global__' when no child context)
const GLOBAL_KEY = '__global__';

interface SavedIds {
  activities: Set<number>;
  plans: Set<number>;
  tools: Set<number>;
  downloads: Set<number>;
}

interface LearningStrategiesContextValue {
  savedIds: SavedIds;
  doneActivityIds: Set<number>;
  ownedToolIds: Set<number>;
  downloadedIds: Set<number>;
  planProgress: Record<number, Set<number>>; // planId -> set of day indices done
  followedPlanIds: Record<string, number>;   // childId -> planId (per-child)

  toggleSaved: (type: keyof SavedIds, id: number) => void;
  isSaved: (type: keyof SavedIds, id: number) => boolean;
  totalSaved: () => number;
  toggleDone: (activityId: number) => void;
  isDone: (activityId: number) => boolean;
  doneCount: () => number;
  toggleOwned: (toolId: number) => void;
  isOwned: (toolId: number) => boolean;
  toggleDownloaded: (downloadId: number) => void;
  isDownloaded: (downloadId: number) => boolean;
  togglePlanDay: (planId: number, dayIndex: number) => void;
  isPlanDayDone: (planId: number, dayIndex: number) => boolean;
  getPlanProgress: (planId: number) => number; // 0-7
  isPlanDone: (planId: number) => boolean;     // all 7 days checked
  getFollowedPlanId: (childId?: string) => number | null;
  followPlan: (planId: number, childId?: string) => void;
  unfollowPlan: (childId?: string) => void;
  isFollowing: (planId: number, childId?: string) => boolean;

  // Managed content (admin-editable, starts from static data)
  // TODO: load from and persist to backend API
  managedActivities: Activity[];
  managedPlans: WeeklyPlan[];
  managedTools: EduTool[];
  managedDownloads: Downloadable[];
  adminAddActivity: (a: Omit<Activity, 'id'>) => void;
  adminUpdateActivity: (id: number, patch: Partial<Omit<Activity, 'id'>>) => void;
  adminDeleteActivity: (id: number) => void;
  adminAddPlan: (p: Omit<WeeklyPlan, 'id'>) => void;
  adminUpdatePlan: (id: number, patch: Partial<Omit<WeeklyPlan, 'id'>>) => void;
  adminDeletePlan: (id: number) => void;
  adminAddTool: (t: Omit<EduTool, 'id'>) => void;
  adminUpdateTool: (id: number, patch: Partial<Omit<EduTool, 'id'>>) => void;
  adminDeleteTool: (id: number) => void;
  adminAddDownload: (d: Omit<Downloadable, 'id'>) => void;
  adminUpdateDownload: (id: number, patch: Partial<Omit<Downloadable, 'id'>>) => void;
  adminDeleteDownload: (id: number) => void;
}

const LearningStrategiesContext = createContext<LearningStrategiesContextValue | null>(null);

export function LearningStrategiesProvider({ children }: { children: React.ReactNode }) {
  // ── Managed content (admin-editable) ─────────────────────────────────────
  const [managedActivities, setManagedActivities] = useState<Activity[]>(() => STATIC_ACTIVITIES);
  const [managedPlans, setManagedPlans] = useState<WeeklyPlan[]>(() => STATIC_PLANS);
  const [managedTools, setManagedTools] = useState<EduTool[]>(() => STATIC_TOOLS);
  const [managedDownloads, setManagedDownloads] = useState<Downloadable[]>(() => STATIC_DOWNLOADS);

  const adminAddActivity = useCallback((a: Omit<Activity, 'id'>) => {
    setManagedActivities(prev => [...prev, { ...a, id: Math.max(0, ...prev.map(x => x.id)) + 1 }]);
    // TODO: POST /api/admin/learning-strategies/activities
  }, []);
  const adminUpdateActivity = useCallback((id: number, patch: Partial<Omit<Activity, 'id'>>) => {
    setManagedActivities(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
    // TODO: PATCH /api/admin/learning-strategies/activities/:id
  }, []);
  const adminDeleteActivity = useCallback((id: number) => {
    setManagedActivities(prev => prev.filter(a => a.id !== id));
    // TODO: DELETE /api/admin/learning-strategies/activities/:id
  }, []);

  const adminAddPlan = useCallback((p: Omit<WeeklyPlan, 'id'>) => {
    setManagedPlans(prev => [...prev, { ...p, id: Math.max(0, ...prev.map(x => x.id)) + 1 }]);
  }, []);
  const adminUpdatePlan = useCallback((id: number, patch: Partial<Omit<WeeklyPlan, 'id'>>) => {
    setManagedPlans(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  }, []);
  const adminDeletePlan = useCallback((id: number) => {
    setManagedPlans(prev => prev.filter(p => p.id !== id));
  }, []);

  const adminAddTool = useCallback((t: Omit<EduTool, 'id'>) => {
    setManagedTools(prev => [...prev, { ...t, id: Math.max(0, ...prev.map(x => x.id)) + 1 }]);
  }, []);
  const adminUpdateTool = useCallback((id: number, patch: Partial<Omit<EduTool, 'id'>>) => {
    setManagedTools(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }, []);
  const adminDeleteTool = useCallback((id: number) => {
    setManagedTools(prev => prev.filter(t => t.id !== id));
  }, []);

  const adminAddDownload = useCallback((d: Omit<Downloadable, 'id'>) => {
    setManagedDownloads(prev => [...prev, { ...d, id: Math.max(0, ...prev.map(x => x.id)) + 1 }]);
  }, []);
  const adminUpdateDownload = useCallback((id: number, patch: Partial<Omit<Downloadable, 'id'>>) => {
    setManagedDownloads(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
  }, []);
  const adminDeleteDownload = useCallback((id: number) => {
    setManagedDownloads(prev => prev.filter(d => d.id !== id));
  }, []);

  // ── User interaction state ─────────────────────────────────────────────────
  const [savedIds, setSavedIds] = useState<SavedIds>({
    activities: new Set(),
    plans: new Set(),
    tools: new Set(),
    downloads: new Set(),
  });
  const [doneActivityIds, setDoneActivityIds] = useState<Set<number>>(new Set());
  const [ownedToolIds, setOwnedToolIds] = useState<Set<number>>(new Set());
  const [downloadedIds, setDownloadedIds] = useState<Set<number>>(new Set());
  const [planProgress, setPlanProgress] = useState<Record<number, Set<number>>>({});
  const [followedPlanIds, setFollowedPlanIds] = useState<Record<string, number>>({});

  const toggleSaved = useCallback((type: keyof SavedIds, id: number) => {
    setSavedIds(prev => {
      const next = { ...prev, [type]: new Set(prev[type]) };
      if (next[type].has(id)) next[type].delete(id); else next[type].add(id);
      return next;
    });
    // TODO: POST /api/learning-strategies/saved { type, id }
  }, []);

  const isSaved = useCallback((type: keyof SavedIds, id: number) => savedIds[type].has(id), [savedIds]);

  const totalSaved = useCallback(() =>
    savedIds.activities.size + savedIds.plans.size + savedIds.tools.size + savedIds.downloads.size,
  [savedIds]);

  const toggleDone = useCallback((activityId: number) => {
    setDoneActivityIds(prev => {
      const s = new Set(prev);
      if (s.has(activityId)) s.delete(activityId); else s.add(activityId);
      return s;
    });
    // TODO: POST /api/learning-strategies/done { activityId }
  }, []);

  const isDone = useCallback((activityId: number) => doneActivityIds.has(activityId), [doneActivityIds]);
  const doneCount = useCallback(() => doneActivityIds.size, [doneActivityIds]);

  const toggleOwned = useCallback((toolId: number) => {
    setOwnedToolIds(prev => {
      const s = new Set(prev);
      if (s.has(toolId)) s.delete(toolId); else s.add(toolId);
      return s;
    });
    // TODO: POST /api/learning-strategies/tools/owned { toolId }
  }, []);

  const isOwned = useCallback((toolId: number) => ownedToolIds.has(toolId), [ownedToolIds]);

  const toggleDownloaded = useCallback((downloadId: number) => {
    setDownloadedIds(prev => {
      const s = new Set(prev);
      if (s.has(downloadId)) s.delete(downloadId); else s.add(downloadId);
      return s;
    });
    // TODO: POST /api/learning-strategies/downloads/track { downloadId }
  }, []);

  const isDownloaded = useCallback((downloadId: number) => downloadedIds.has(downloadId), [downloadedIds]);

  const togglePlanDay = useCallback((planId: number, dayIndex: number) => {
    setPlanProgress(prev => {
      const existing = new Set(prev[planId] ?? []);
      if (existing.has(dayIndex)) existing.delete(dayIndex); else existing.add(dayIndex);
      return { ...prev, [planId]: existing };
    });
    // TODO: POST /api/learning-strategies/plans/progress { planId, dayIndex }
  }, []);

  const isPlanDayDone = useCallback((planId: number, dayIndex: number) =>
    planProgress[planId]?.has(dayIndex) ?? false, [planProgress]);

  const getPlanProgress = useCallback((planId: number) =>
    planProgress[planId]?.size ?? 0, [planProgress]);

  const isPlanDone = useCallback((planId: number) =>
    (planProgress[planId]?.size ?? 0) >= 7, [planProgress]);

  const getFollowedPlanId = useCallback((childId?: string): number | null => {
    const key = childId ?? GLOBAL_KEY;
    return followedPlanIds[key] ?? null;
  }, [followedPlanIds]);

  const followPlan = useCallback((planId: number, childId?: string) => {
    const key = childId ?? GLOBAL_KEY;
    setFollowedPlanIds(prev => ({ ...prev, [key]: planId }));
    // TODO: POST /api/learning-strategies/plans/follow { planId, childId }
    // TODO: schedule daily push notification reminder via backend
  }, []);

  const unfollowPlan = useCallback((childId?: string) => {
    const key = childId ?? GLOBAL_KEY;
    setFollowedPlanIds(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    // TODO: DELETE /api/learning-strategies/plans/follow { childId }
    // TODO: cancel scheduled push notifications
  }, []);

  const isFollowing = useCallback((planId: number, childId?: string) => {
    const key = childId ?? GLOBAL_KEY;
    return followedPlanIds[key] === planId;
  }, [followedPlanIds]);

  return (
    <LearningStrategiesContext.Provider value={{
      savedIds, doneActivityIds, ownedToolIds, downloadedIds, planProgress, followedPlanIds,
      toggleSaved, isSaved, totalSaved,
      toggleDone, isDone, doneCount,
      toggleOwned, isOwned,
      toggleDownloaded, isDownloaded,
      togglePlanDay, isPlanDayDone, getPlanProgress, isPlanDone,
      getFollowedPlanId, followPlan, unfollowPlan, isFollowing,
      managedActivities, managedPlans, managedTools, managedDownloads,
      adminAddActivity, adminUpdateActivity, adminDeleteActivity,
      adminAddPlan, adminUpdatePlan, adminDeletePlan,
      adminAddTool, adminUpdateTool, adminDeleteTool,
      adminAddDownload, adminUpdateDownload, adminDeleteDownload,
    }}>
      {children}
    </LearningStrategiesContext.Provider>
  );
}

export function useLearningStrategies() {
  const ctx = useContext(LearningStrategiesContext);
  if (!ctx) throw new Error('useLearningStrategies must be used within LearningStrategiesProvider');
  return ctx;
}
