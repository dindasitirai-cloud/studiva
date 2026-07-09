import React, { createContext, useContext, useState, useCallback } from 'react';

// TODO: sync all state to backend API once endpoints are ready

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
  followedPlanId: number | null; // which weekly plan the user is currently following

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
  followPlan: (planId: number) => void;
  unfollowPlan: () => void;
  isFollowing: (planId: number) => boolean;
}

const LearningStrategiesContext = createContext<LearningStrategiesContextValue | null>(null);

export function LearningStrategiesProvider({ children }: { children: React.ReactNode }) {
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
  const [followedPlanId, setFollowedPlanId] = useState<number | null>(null);

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

  const followPlan = useCallback((planId: number) => {
    setFollowedPlanId(planId);
    // TODO: POST /api/learning-strategies/plans/follow { planId }
    // TODO: schedule daily push notification reminder via backend
  }, []);

  const unfollowPlan = useCallback(() => {
    setFollowedPlanId(null);
    // TODO: DELETE /api/learning-strategies/plans/follow
    // TODO: cancel scheduled push notifications
  }, []);

  const isFollowing = useCallback((planId: number) => followedPlanId === planId, [followedPlanId]);

  return (
    <LearningStrategiesContext.Provider value={{
      savedIds, doneActivityIds, ownedToolIds, downloadedIds, planProgress, followedPlanId,
      toggleSaved, isSaved, totalSaved,
      toggleDone, isDone, doneCount,
      toggleOwned, isOwned,
      toggleDownloaded, isDownloaded,
      togglePlanDay, isPlanDayDone, getPlanProgress,
      followPlan, unfollowPlan, isFollowing,
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
